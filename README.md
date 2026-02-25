code
Markdown
# Second Brain PWA (Level 3)

A mobile-first "Capture" tool designed to feed a Notion Second Brain system. It uses a dynamic interface to categorize inputs into Work or Personal streams instantly.

## Features
- **Smart Toggle:** Toggling between "Work" and "Personal" instantly changes the available fields.
- **Work Flow:** Captures Title, Notes, Functions (Multi-select), and Priority (Fire/High/Med/Low).
- **Personal Flow:** Captures Title, Notes, and Specific Interests (Trekking, Kids, etc.).
- **Visual Feedback:** Uses Emoji-based chips for quick visual recognition.
- **Speed:** Zero-friction interface designed for one-handed mobile use.

## Notion Database Setup
To make this app work, your Notion Database must have these exact columns:

| Column Name | Type | Options (Exact Spelling) |
| :--- | :--- | :--- |
| `Name` | Title | - |
| `Category` | Select | `Work`, `Personal` |
| `Function` | Multi-select | `S&F`, `B&M`, `Team`, `Prod`, `AI&E`, `Comm`, `Workbench` |
| `Priority` | Select | `Burning`, `High`, `Medium`, `Low`, `Gyaan-Reading` |
| `Interest` | Select | `Trekking &Outdoors`, `Kids & S-O-P`, `Cooking & Shooting`, `Ten-Run-Gym`, `Reading & Inspiration` |

## Environment Variables (Vercel)
The app requires two secrets to run:
1. `NOTION_KEY`: Your Internal Integration Token (starts with `secret_` or `ntn_`).
2. `NOTION_DB_ID`: The 32-character ID from your Database URL.

## Tech Stack
- **Frontend:** HTML5, Tailwind CSS, Vanilla JS.
- **Backend:** Node.js (Serverless via Vercel).
- **Database:** Notion API.

## Trying to fix the file path for manifest.json in the vercel organization
