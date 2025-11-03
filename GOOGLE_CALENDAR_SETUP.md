# Google Calendar Integration Setup Guide

## Manual Setup Required

### 1. Google Cloud Console Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or Select a Project**:
   - Click on the project dropdown at the top
   - Click "New Project" or select an existing one
   - Note your Project ID

3. **Enable Required APIs**:
   - Navigate to "APIs & Services" > "Library"
   - Search and enable:
     - **Google Calendar API**
     - **Gmail API**

4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure OAuth consent screen first:
     - User Type: External (or Internal for Google Workspace)
     - App name: "Velora"
     - User support email: Your email
     - Developer contact: Your email
     - Add scopes:
       - `https://www.googleapis.com/auth/calendar`
       - `https://www.googleapis.com/auth/calendar.events`
       - `https://www.googleapis.com/auth/gmail.readonly`
       - `https://www.googleapis.com/auth/gmail.send`
     - Add test users (if in testing mode)
   - Back to Credentials, select "Web application"
   - Add Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Add Authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Click "Create"
   - **Copy the Client ID** (not the Client Secret - you don't need it for this flow)

### 2. Environment Variables

Add to your `.env.local` file:

```env
# Google OAuth Client ID (for Calendar/Gmail integration)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

### 3. Backend API Endpoint

Your FastAPI backend needs to implement:

#### POST `/user/token`
- **Purpose**: Exchange Google OAuth authorization code for access/refresh tokens
- **Headers**: 
  - `Authorization: Bearer <backend_token>`
  - `Content-Type: application/json`
- **Body**:
```json
{
  "code": "authorization_code_from_google"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Google Calendar connected successfully"
}
```

#### GET `/user/google/status`
- **Purpose**: Check if user has Google Calendar connected
- **Headers**: 
  - `Authorization: Bearer <backend_token>`
- **Response**:
```json
{
  "connected": true,
  "email": "user@gmail.com"
}
```

### 4. Backend Implementation Notes

Your FastAPI backend should:
1. Receive the authorization `code` from the frontend
2. Exchange it with Google for access/refresh tokens using:
   - Client ID: Same as `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - Client Secret: From Google Cloud Console (keep this secret!)
   - Redirect URI: Must match one of the authorized redirect URIs
3. Store the tokens securely (associated with the user)
4. Use the tokens to access Google Calendar/Gmail APIs when needed

**Example Python code for token exchange**:
```python
import requests

def exchange_google_code(code: str, client_id: str, client_secret: str, redirect_uri: str):
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code"
    }
    response = requests.post(token_url, data=data)
    return response.json()  # Contains access_token, refresh_token, etc.
```

### 5. Testing

1. Start your development server
2. Click on your profile avatar in the header
3. Click "Connect Google Calendar"
4. You should see Google OAuth popup
5. Sign in and authorize the requested permissions
6. The button should show "Google Calendar Connected"

## Troubleshooting

- **"NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set"**: Add the env variable to `.env.local`
- **OAuth popup blocked**: Check browser popup settings
- **"redirect_uri_mismatch"**: Ensure redirect URI in Google Console matches your app URL
- **"invalid_client"**: Verify Client ID is correct
- **Backend errors**: Check backend logs for token exchange issues

## Security Notes

- Never expose Client Secret in frontend code
- Store refresh tokens securely in your backend database
- Use HTTPS in production
- Implement token refresh logic in your backend

