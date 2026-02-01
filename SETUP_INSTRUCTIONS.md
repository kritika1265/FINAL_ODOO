# Frontend Setup Instructions

## Step 1: Install Node.js and npm

Your system doesn't have Node.js installed. Follow these steps:

### Option A: Download and Install Node.js (Recommended)

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - Download the **LTS (Long Term Support)** version for Windows
   - Choose the Windows Installer (.msi) for 64-bit

2. **Install Node.js:**
   - Run the downloaded installer
   - Follow the installation wizard
   - Make sure to check "Add to PATH" option during installation
   - Complete the installation

3. **Verify Installation:**
   - Close and reopen your PowerShell/Command Prompt
   - Run these commands to verify:
     ```powershell
     node --version
     npm --version
     ```

### Option B: Using Chocolatey (If you have it installed)

If you have Chocolatey package manager installed, you can run:
```powershell
choco install nodejs-lts
```

## Step 2: Install Frontend Dependencies

Once Node.js is installed, navigate to the frontend directory and install dependencies:

```powershell
cd C:\xampp\htdocs\FINAL_ODOO\frontend
npm install
```

This will install all the required packages listed in `package.json`.

## Step 3: Start the Development Server

After dependencies are installed, start the React development server:

```powershell
npm start
```

This will:
- Start the development server (usually on http://localhost:3000)
- Open your browser automatically
- Enable hot-reloading for development

## Step 4: Environment Configuration (Optional)

If you need to configure the API URL, create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=30000
```

## Troubleshooting

### If npm commands still don't work after installing Node.js:
1. Close and reopen your terminal/PowerShell
2. Restart your computer if needed
3. Check if Node.js is in your PATH:
   ```powershell
   $env:PATH
   ```
   Should include something like: `C:\Program Files\nodejs\`

### If you get permission errors:
- Run PowerShell as Administrator
- Or configure npm to use a different directory for global packages

### If port 3000 is already in use:
- The app will ask to use a different port (like 3001)
- Or you can specify a port: `set PORT=3001 && npm start`

## Required Node.js Version

According to your `package.json`, you need:
- Node.js >= 16.0.0
- npm >= 8.0.0

The LTS version of Node.js (currently v20.x) will work perfectly.
