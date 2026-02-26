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

  const { title, content, category, functions, priority, interest } = req.body || {};

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
