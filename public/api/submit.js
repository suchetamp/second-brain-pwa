ode
JavaScript
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, content, category } = req.body;

  try {
    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DB_ID },
      properties: {
        Name: {
          title: [
            { text: { content: title } },
          ],
        },
        Category: {
          select: { name: category },
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
    
    res.status(200).json({ success: true, id: response.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
