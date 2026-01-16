# Admin Dashboard Setup

## 1. Install Dependencies
Run this command to install the necessary tools (Netlify CLI):
```bash
npm install
```

## 2. Link to Netlify
To fix the **"Failed to load settings"** error, you must connect your local folder to your live Netlify site.

1.  Log in to Netlify via the terminal:
    ```bash
    npx netlify login
    ```
2.  Link this folder to your site:
    ```bash
    npx netlify link
    ```
    *(Choose "Use current git remote" or select your site manually)*

## 3. Run the Dashboard
Always start the site with this command. It runs a local server that handles the login and API calls correclty.
```bash
npm start
```

Access the dashboard at: `http://localhost:8888/admin/admin/dashboard/`
