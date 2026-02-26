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


Markdown
# Second Brain PWA (Level 3 - Installed)

A fast, mobile-first Progressive Web App (PWA) to capture thoughts directly into a Notion Second Brain system. This version supports **Work/Personal branching** and features a high-contrast **Dark Mode** UI.

## Core Features
- **Installed PWA:** Fully installable on Android via Chrome, with custom icon support via `manifest.json`.
- **Theming:** Dynamic UI with **Blue accents for Work** and **Fuchsia/Purple accents for Personal**.
- **Work Flow:** Captures Title, Notes, **Function** (Multi-select), and **Priority** (Single-select with Emojis).
- **Personal Flow:** Captures Title, Notes, and **Interest** (Single-select with Emojis).
- **Notion Integration:** Securely sends data via a Vercel Serverless Function located in the `/api` folder.

## Notion Database Setup
To make this app work, your Notion Database must have these exact columns:

| Column Name | Type | Options (Exact Spelling) |
| :--- | :--- | :--- |
| `Name` | Title | - |
| `Category` | Select | `Work`, `Personal` |
| `Function` | **Multi-select** | `S&F`, `B&M`, `Team`, `Prod`, `AI&E`, `Comm`, `Workbench` |
| `Priority` | Select | `Burning`, `High`, `Medium`, `Low`, `Gyaan-Reading` |
| `Interest` | Select | `Trekking &Outdoors`, `Kids & S-O-P`, `Cooking & Shooting`, `Ten-Run-Gym`, `Reading & Inspiration` |

## Environment Variables (Vercel)
The app requires two secrets set in **Vercel Environment Variables** for the backend to function:

| Variable Name | Value | Notes |
| :--- | :--- | :--- |
| `NOTION_KEY` | `secret_...` or `ntn_...` | Your Notion Integration Secret. |
| `NOTION_DB_ID` | `32-char-code` | The 32-character UUID from your Database URL. **Must NOT contain `https://notion.so/`**. |

## Deployment & Debugging Learnings

### ⚙️ File Structure (Crucial for Vercel)
Vercel automatically serves files in the `public` folder at the root of the URL.

*   **Root Folder:** Contains server code and configuration: `package.json`, `api/` (Backend Code), `vercel.json` (Static Rewrites).
*   **`public/` Folder:** **MUST** contain all static assets: `index.html`, `manifest.json`, `SBIcon512.png`, `service-worker.js`.

### ⚠️ Debugging Playbook (How to Read Errors)
| Error Signal | Tool to Check | Likely Cause & Fix |
| :--- | :--- | :--- |
| **401 Unauthorized** | Vercel Logs / Network Tab | File is being treated as private code, not a public asset. **Fix:** Ensure file is in the `public/` folder. |
| **404 Not Found** | Network Tab / Vercel Source Tab | File is missing from the expected location (`public/`) or has a **casing/spelling error**. **Fix:** Check spelling/casing, or ensure it's in `public/`. |
| **`body.parent...` Errors** | Frontend `alert()` / Vercel Logs | Backend received bad data from the client. **Fix:** Clean the Environment Variable value (e.g., remove URL from `NOTION_DB_ID`). |
| **No Install Prompt** | Dev Tools $\rightarrow$ Application $\rightarrow$ Manifest | The browser cannot validate the PWA criteria. **Fix:** Ensure icon URL in `manifest.json` is a **direct raw link** to a PNG. |

