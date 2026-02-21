const { Client } = require('@notionhq/client');

module.exports = async (req, res) => {
  // 1. Setup CORS (Optional, but good for stability)
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Parse Input
  const { title, content, category } = req.body || {};

  try {
    // 3. Validation
    if (!process.env.NOTION_KEY) throw new Error("Missing NOTION_KEY in Vercel.");
    if (!process.env.NOTION_DB_ID) throw new Error("Missing NOTION_DB_ID in Vercel.");

    // 4. Connect to Notion
    const notion = new Client({ auth: process.env.NOTION_KEY.trim() }); // .trim() removes accidental spaces!

    // 5. Send Data
    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DB_ID.trim() },
      properties: {
        Name: {
          title: [
            { text: { content: title || "Untitled" } },
          ],
        },
        Category: {
          select: { name: category || "Work" },
        },
      },
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
    
    // 6. Success
    res.status(200).json({ success: true, id: response.id });

  } catch (error) {
    console.error("Backend Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
