const { Client } = require('@notionhq/client');
const formidable = require('formidable');
const { URLSearchParams } = require('url'); // Needed to handle URL Encoded data fallback

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const path = req.url; 
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.NOTION_KEY) throw new Error("Missing NOTION_KEY.");
    if (!process.env.NOTION_DB_ID) throw new Error("Missing NOTION_DB_ID.");

    const notion = new Client({ auth: process.env.NOTION_KEY.trim() });
    let sharedData = {};

    // --- NEW: Handle Form/Multipart Data from Share Target ---
    if (path.startsWith('/share-target')) {
        // Use Formidable to parse the incoming data stream
        const form = formidable({});
        
        const [fields] = await form.parse(req);
        
        // The shared data comes through in the 'text' field as defined in manifest.json
        sharedData = {
            title: fields.title ? fields.title[0] : 'Shared Link', // Use shared title if provided, else default
            content: fields.text ? fields.text[0] : '', // This gets the URL/Text from the share sheet
            category: fields.category ? fields.category[0] : 'Personal', // Default category if not set by PWA button
            // Other fields (functions, priority, interest) will be undefined here, which is fine.
        };

    } else {
        // --- Existing Logic: Handle data from the PWA's own capture button (Assumes JSON) ---
        const body = req.body || {};
        sharedData = {
            title: body.title,
            content: body.content,
            category: body.category,
            functions: body.functions,
            priority: body.priority,
            interest: body.interest,
        };
    }
    
    // Sanitize and prepare Notion Properties (using collected sharedData)
    const dbProperties = {
      Name: { title: [{ text: { content: sharedData.title || "Shared Link - Title Needed" } }] },
      Category: { select: { name: sharedData.category || "Personal" } },
    };

    if (sharedData.category === 'Work') {
        if (sharedData.functions && sharedData.functions.length > 0) {
            dbProperties['Function'] = { multi_select: sharedData.functions.map(f => ({ name: f })) };
        }
        if (sharedData.priority) {
            dbProperties['Priority'] = { select: { name: sharedData.priority } };
        }
    }

    if (sharedData.category === 'Personal') {
        if (sharedData.interest) {
            dbProperties['Interest'] = { select: { name: interest } };
        }
    }

    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DB_ID.trim() },
      properties: dbProperties,
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: sharedData.content || "Shared content received." } }],
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
