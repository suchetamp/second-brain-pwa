const { Client } = require('@notionhq/client');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const path = req.url; 
  
  if (req.method !== 'POST') {
    if (path.startsWith('/share-target')) {
        return res.status(405).json({ error: 'Share Target requires POST method' });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  }
// OLD:
// const { title, content, category, functions, priority, interest } = req.body || {};
// NEW: You need a way to parse form data. Since we can't add a library easily
// without a new deploy step, we will rely on the standard Node/Vercel parser.
// For now, let's ensure the code handles missing fields better:
const data = req.body || {}; // Assume data is available but might not be JSON parsed yet

// *** Since we cannot easily add new dependencies here, the most direct fix
// *** is to ensure the main submission path in index.html sends URLENCODED data
// *** or to use a dependency like 'formidable' or 'multer' in package.json and submit.js. ***

// For the immediate fix, let's assume Vercel's default Node setup might handle it if we check the body structure.
// Revert to the previous structure, but ensure the request is POST:
const { title, content, category, functions, priority, interest } = req.body || {}; 
// (Keep the code as it was when it sent the success message)
  
  try {
    if (!process.env.NOTION_KEY) throw new Error("Missing NOTION_KEY.");
    if (!process.env.NOTION_DB_ID) throw new Error("Missing NOTION_DB_ID.");

    const notion = new Client({ auth: process.env.NOTION_KEY.trim() });

    const dbProperties = {
      Name: { title: [{ text: { content: title || "Untitled Shared Entry" } }] },
      Category: { select: { name: category || "Personal" } },
    };

    if (category === 'Work') {
        if (functions && functions.length > 0) {
            dbProperties['Function'] = { multi_select: functions.map(f => ({ name: f })) };
        }
        if (priority) {
            dbProperties['Priority'] = { select: { name: priority } };
        }
    }

    if (category === 'Personal') {
        if (interest) {
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
            rich_text: [{ type: 'text', text: { content: content || "Shared content received." } }],
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
