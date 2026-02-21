const { Client } = require('@notionhq/client');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse new fields
  const { title, content, category, functions, priority, interest } = req.body || {};

  try {
    if (!process.env.NOTION_KEY) throw new Error("Missing NOTION_KEY.");
    if (!process.env.NOTION_DB_ID) throw new Error("Missing NOTION_DB_ID.");

    const notion = new Client({ auth: process.env.NOTION_KEY.trim() });

    // Base Properties
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

    // Conditional Logic for WORK
    if (category === 'Work') {
        // Add Function (Multi-select)
        if (functions && functions.length > 0) {
            dbProperties['Function'] = {
                multi_select: functions.map(f => ({ name: f }))
            };
        }
        // Add Priority (Single Select)
        if (priority) {
            dbProperties['Priority'] = {
                select: { name: priority }
            };
        }
    }

    // Conditional Logic for PERSONAL
    if (category === 'Personal') {
        // Add Interest (Single Select)
        if (interest) {
            dbProperties['Interest'] = {
                select: { name: interest }
            };
        }
    }

    // Send to Notion
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
