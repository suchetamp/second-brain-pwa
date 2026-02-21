const { Client } = require('@notionhq/client');

module.exports = async (req, res) => {
  // 1. Setup CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Parse Input (Including new 'functions' array)
  const { title, content, category, functions } = req.body || {};

  try {
    if (!process.env.NOTION_KEY) throw new Error("Missing NOTION_KEY in Vercel.");
    if (!process.env.NOTION_DB_ID) throw new Error("Missing NOTION_DB_ID in Vercel.");

    const notion = new Client({ auth: process.env.NOTION_KEY.trim() });

    // 3. Construct Properties
    const dbProperties = {
      Name: {
        title: [
          { text: { content: title || "Untitled" } },
        ],
      },
      Category: {
        select: { name: category || "Personal" },
      },
    };

    // 4. Add Function logic (Only if Work AND functions selected)
    if (category === 'Work' && functions && functions.length > 0) {
      dbProperties['Function'] = {
        multi_select: functions.map(f => ({ name: f }))
      };
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
            rich_text: [
              { type: 'text', text: { content: content || " " } },
            ],
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
