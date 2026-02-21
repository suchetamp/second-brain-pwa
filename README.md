
# Second Brain PWA (MVP)

A fast, mobile-first Progressive Web App to capture thoughts directly into a Notion Database.

## Features
- **Instant Capture:** Title and Body text.
- **Categorization:** Simple toggle for "Work" vs "Personal".
- **Notion Integration:** Uses the Notion API to save data instantly.
- **Mobile Optimized:** Large touch targets and "Add to Home Screen" ready.

## Setup Instructions

### 1. Notion Setup
1. Create a new Full Page Database.
2. Delete all default properties except `Name`.
3. Add a **Select Property** named `Category`. Add options: `Work`, `Personal`.
4. Create a new Integration at [Notion Developers](https://www.notion.so/my-integrations).
5. **Important:** Go to your Database page -> `...` -> `Connections` -> Add your new integration.

### 2. Deployment (Vercel)
1. Fork/Clone this repo to your GitHub.
2. Import project into [Vercel](https://vercel.com).
3. Add Environment Variables in Vercel Settings:

| Variable Name | Value | Notes |
| :--- | :--- | :--- |
| `NOTION_KEY` | `secret_...` or `ntn_...` | Your Internal Integration Secret. |
| `NOTION_DB_ID` | `32-char-code` | The ID found in your Database URL (between / and ?). |

### 3. Troubleshooting Vercel Errors
If the app fails to save:
1. **Check for Spaces:** Ensure `NOTION_KEY` and `NOTION_DB_ID` do not have spaces at the start or end.
2. **Check ID Format:** The `NOTION_DB_ID` should NOT include `https://notion.so/`. It is just the 32-character code.
3. **Redeploy:** After changing any Environment Variable, you MUST go to Deployments -> Redeploy.

## Project Structure
- `api/submit.js`: Serverless function that talks to Notion securely.
- `public/index.html`: The user interface.
- `package.json`: Configuration for Vercel.
