# Smart Learning Hub

A React-based AI learning tool powered by Gemini.

## Running Locally
1. Install dependencies: `npm install`
2. Set API Key: Create `.env` file with `REACT_APP_API_KEY` or inject `process.env.API_KEY`.
3. Run: `npm start`

## Convert to Desktop App (Electron/Nativefier)

You can wrap this web application into a standalone desktop app easily using Nativefier.

**Prerequisites:**
- Node.js installed

**Steps:**

1. **Build the app**:
   If you are hosting this or running it locally (e.g., http://localhost:3000), note the URL.

2. **Install Nativefier**:
   ```bash
   npm install -g nativefier
   ```

3. **Generate the App**:
   Run the following command. Replace `[URL]` with your hosted URL or localhost.

   ```bash
   nativefier --name "SmartLearningHub" \
   --icon "https://picsum.photos/512/512" \
   --width 1200 --height 800 \
   --single-instance \
   --disable-dev-tools \
   "[URL]"
   ```

4. **Locate and Run**:
   Nativefier will create a folder named `SmartLearningHub-win32-x64` (or darwin/linux). Open the folder and run the executable.

## Privacy Note
All data is stored in your browser's LocalStorage. No data is sent to a backend server other than the prompt sent to Google's Gemini API for content generation.
