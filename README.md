# CardiovasHora

CardiovasHora is a static HTML, CSS, and Vanilla JavaScript web app for cardiovascular risk assessment, AI result display, dashboard views, and an n8n-powered AI chatbot.

The project is currently frontend-only. There is no real authentication, database, Supabase, Firebase, FastAPI, or REST backend integration yet.

## Project Structure

```text
CardiovasHora/
|-- index.html
|-- login.html
|-- dashboard.html
|-- predict.html
|-- result.html
|-- chatbot.html
|-- css/
|   |-- global.css
|   |-- index.css
|   |-- login.css
|   |-- dashboard.css
|   |-- predict.css
|   |-- result.css
|   `-- chatbot.css
|-- js/
|   |-- api/
|   |   |-- api.js
|   |   |-- auth.js
|   |   `-- chatbot.js
|   |-- runtime-config.js
|   |-- common/
|   |   `-- router.js
|   |-- pages/
|   |   |-- index.js
|   |   |-- login.js
|   |   |-- dashboard.js
|   |   |-- predict.js
|   |   |-- result.js
|   |   `-- chatbot.js
|   |-- services/
|   |   `-- assessment.js
|-- scripts/
|   `-- generate-runtime-config.js
|-- components/
|   `-- navbar.html
|-- assets/
|   |-- images/
|   |-- icons/
|   `-- fonts/
|-- vercel.json
`-- README.md
```

## How Files Connect

- Each HTML file represents one page and loads `css/global.css`, its own page CSS file, shared JavaScript, and its own page script.
- `components/navbar.html` is injected by `js/common/router.js` on pages that include a navbar slot.
- `js/common/router.js` handles page navigation, dark mode, mobile menu, sidebar state, and logout routing.
- `js/api/auth.js` keeps the current mock login behavior using `sessionStorage`.
- `scripts/generate-runtime-config.js` reads `CHATBOT_WEBHOOK_URL` and generates `js/runtime-config.js` during the Vercel build.
- `js/api/chatbot.js` contains the existing n8n webhook communication and reads the webhook URL from `js/runtime-config.js`.
- `js/pages/chatbot.js` handles only chatbot UI interactions and calls `AppChatbotApi`.
- `js/services/assessment.js` contains reusable BMI and assessment validation logic.

## Pages

- `index.html` - Intro / landing page
- `login.html` - Login UI only
- `dashboard.html` - Doctor and researcher dashboard
- `predict.html` - Patient assessment form
- `result.html` - AI risk assessment results
- `chatbot.html` - AI chatbot connected to n8n

## Run Locally

Run a local static server from the project root:

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Notes

- The login page is UI-only and does not authenticate against a backend.
- The chatbot still uses the existing n8n webhook, but the URL now lives in Vercel Environment Variables and is written into `js/runtime-config.js` at build time.
- Backend integrations should be added through `js/api/` in the future.
