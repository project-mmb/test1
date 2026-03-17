<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ea9509cb-5ef8-441b-8276-3ae8ef184a67

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

1. Push this project to a GitHub repository named `campusFIT-website`.
2. Install dependencies:
   `npm install`
3. Publish:
   `npm run deploy`
4. In GitHub repository settings, open **Pages** and confirm source is **Deploy from a branch** using `gh-pages` branch.

Notes:
- The app is configured for project pages at `/campusFIT-website/`.
- SPA deep links are supported via a `404.html` redirect fallback.
