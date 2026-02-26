const { Client } = require('@notionhq/client');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // --- 1. Determine the API Route ---
  // If the request came from the Share Sheet, the path is /share-target.
  // If it came from the PWA button, it will likely be /submit (or similar).
  const path = req.url; 
  
  if (req.method !== 'POST') {
    // If it's a GET request, we should probably just serve the index page,
    // but for API endpoints, we only allow POST.
    if (path.startsWith('/share-target')) {
        return res.status(405).json({ error: 'Share Target requires POST method' });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // --- 2. Parse Input Data ---
  const { title, content, category, functions, priority, interest } = req.body || {};

  try {
    if (!process.env.NOTION_KEY) throw new Error("Missing NOTION_KEY.");
    if (!process.env.NOTION_DB_ID) throw new Error("Missing NOTION_DB_ID.");

    const notion = new Client({ auth: process.env.NOTION_KEY.trim() });

    // --- 3. Conditional Logic (Same as before) ---
    const dbProperties = {
      Name: { title: [{ text: { content: title || "Untitled Shared Entry" } }] }, // Default title if user doesn't type one
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

    // --- 4. Send to Notion ---
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
