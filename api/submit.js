const { Client } = require('@notionhq/client');
const formidable = require('formidable');

// Helper to allow Vercel to wait for the Form parsing
export const config = {
  api: {
    bodyParser: false, // Disable Vercel's default JSON parser for this route so Formidable can work
  },
};

module.exports = async (req, res) => {
  // 1. CORS Setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 2. Validate Environment Variables
    if (!process.env.NOTION_KEY) throw new Error("Missing NOTION_KEY.");
    if (!process.env.NOTION_DB_ID) throw new Error("Missing NOTION_DB_ID.");

    const notion = new Client({ auth: process.env.NOTION_KEY.trim() });
    let finalData = {};

    // 3. Determine Request Type (Share Sheet vs PWA Button)
    const contentType = req.headers['content-type'] || '';

    if (contentType.includes('multipart/form-data')) {
        // --- CASE A: From Android Share Sheet ---
        // We must parse the form data stream
        const form = new formidable.IncomingForm();
        
        const formData = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                resolve({ fields, files });
            });
        });

        // Extract data (Formidable returns arrays, we take the first item)
        // Manifest params: title, text, url
        const rawTitle = formData.fields.title ? formData.fields.title[0] : '';
        const rawText = formData.fields.text ? formData.fields.text[0] : '';
        const rawUrl = formData.fields.url ? formData.fields.url[0] : '';

        finalData = {
            title: rawTitle || 'Shared Entry', 
            content: rawUrl || rawText || '', // Prefer URL if specific, else text
            category: 'Personal', // Default category for shares
            functions: [],
            priority: null,
            interest: null
        };

    } else {
        // --- CASE B: From PWA Button (JSON) ---
        // Since we disabled the default bodyParser at the top, we must parse JSON manually here
        const buffers = [];
        for await (const chunk of req) {
            buffers.push(chunk);
        }
        const data = Buffer.concat(buffers).toString();
        const body = JSON.parse(data);

        finalData = {
            title: body.title,
            content: body.content,
            category: body.category || 'Personal',
            functions: body.functions || [],
            priority: body.priority,
            interest: body.interest
        };
    }

    // 4. Construct Notion Properties
    const dbProperties = {
      Name: { title: [{ text: { content: finalData.title || "Untitled" } }] },
      Category: { select: { name: finalData.category } },
    };

    // Logic: Work
    if (finalData.category === 'Work') {
        if (finalData.functions && finalData.functions.length > 0) {
            dbProperties['Function'] = { multi_select: finalData.functions.map(f => ({ name: f })) };
        }
        if (finalData.priority) {
            dbProperties['Priority'] = { select: { name: finalData.priority } };
        }
    }

    // Logic: Personal
    if (finalData.category === 'Personal') {
        if (finalData.interest) {
            dbProperties['Interest'] = { select: { name: finalData.interest } };
        }
    }

    // 5. Send to Notion
    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DB_ID.trim() },
      properties: dbProperties,
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: finalData.content || " " } }],
          },
        },
      ],
    });
    
    res.status(200).json({ success: true, id: response.id });

  } catch (error) {
    console.error("Backend Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
