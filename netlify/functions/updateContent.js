const { GITHUB_TOKEN, REPO_OWNER, REPO_NAME } = process.env;

/**
 * Netlify Function: updateContent
 * Updates site content (JSON and Files) on GitHub via API.
 * 
 * Env Vars Required by Netlify Site Settings:
 * - GITHUB_TOKEN: Personal Access Token with 'repo' scope
 * - REPO_OWNER: GitHub Username (e.g. 'hackura')
 * - REPO_NAME: Repository Name (e.g. 'Portfolio')
 */

exports.handler = async (event, context) => {
    // 1. Authorization Check (Netlify Identity)
    // Ensures only logged-in users can trigger updates.
    const { user } = context.clientContext;
    if (!user) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: "Unauthorized: You must be logged in via Netlify Identity." })
        };
    }

    // Optional: Add specific Role check if needed
    // if (!user.app_metadata.roles || !user.app_metadata.roles.includes('admin')) { ... }

    // 2. Method Check
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed. Use POST." })
        };
    }

    try {
        // 3. Parse Request Body
        const payload = JSON.parse(event.body);
        const { siteData, fileData } = payload;

        if (!siteData) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing required 'siteData' in request body." })
            };
        }

        /**
         * Helper: Update a file on GitHub
         * Handles the GET (for SHA) -> PUT (update) flow.
         * @param {string} filePath - Path to file in repo (e.g. 'data/siteData.json')
         * @param {string} contentBase64 - Base64 encoded content
         * @param {string} message - Commit message
         */
        const updateGitHubFile = async (filePath, contentBase64, message) => {
            const baseUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;
            const headers = {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            };

            // A. Get current file SHA (required for updates)
            let sha = null;
            const getRes = await fetch(baseUrl, { headers });

            if (getRes.ok) {
                const data = await getRes.json();
                sha = data.sha;
            } else if (getRes.status === 404) {
                // File doesn't exist yet, we'll create it (SHA stays null)
                console.log(`File ${filePath} not found. creating new.`);
            } else {
                const errText = await getRes.text();
                throw new Error(`GitHub GET Error (${filePath}): ${getRes.status} ${errText}`);
            }

            // B. PUT new content
            const putBody = {
                message: message,
                content: contentBase64,
                branch: 'master'  // Changed from main to master based on error
            };
            if (sha) putBody.sha = sha;

            const putRes = await fetch(baseUrl, {
                method: 'PUT',
                headers,
                body: JSON.stringify(putBody)
            });

            if (!putRes.ok) {
                const errText = await putRes.text();
                throw new Error(`GitHub PUT Error (${filePath}): ${putRes.status} ${errText}`);
            }

            return await putRes.json();
        };

        const results = [];

        // 4. Update siteData.json
        // Convert JSON object to Base64 string
        const jsonContent = Buffer.from(JSON.stringify(siteData, null, 2)).toString('base64');
        await updateGitHubFile('data/siteData.json', jsonContent, 'Update site data via Admin Dashboard');
        results.push('siteData.json updated successfully');

        // 5. Update CV File (Optional)
        if (fileData && fileData.content && fileData.filename) {
            // Note: We use assets/cv/ as the directory based on project structure
            const cvPath = `assets/cv/${fileData.filename}`;
            // fileData.content comes as base64 from the frontend FileReader
            await updateGitHubFile(cvPath, fileData.content, `Update CV: ${fileData.filename}`);
            results.push(`CV (${fileData.filename}) updated successfully`);
        }

        // 6. Success Response
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Content updated successfully on GitHub",
                details: results
            })
        };

    } catch (error) {
        console.error("Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message || "Internal Server Error"
            })
        };
    }
};
