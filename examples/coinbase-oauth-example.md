# Coinbase OAuth2 Integration Example

This example demonstrates how to implement OAuth2 authentication with Coinbase using Node.js and Express.

## Overview

The Coinbase OAuth2 integration allows your application to:
- Authenticate users with their Coinbase accounts
- Access Coinbase API on behalf of users
- Securely manage user tokens with PKCE (Proof Key for Code Exchange)

## Features

- **OAuth2 Authorization Code Flow**: Industry-standard OAuth2 implementation
- **PKCE Support**: Enhanced security for public clients
- **State Parameter**: CSRF protection
- **Token Management**: Access and refresh token handling
- **Session Management**: Secure state and code verifier storage

## Prerequisites

1. **Create a Coinbase OAuth2 Application**
   - Go to [Coinbase API Settings](https://www.coinbase.com/settings/api)
   - Click "New OAuth2 Application"
   - Fill in the application details
   - Set the redirect URI to: `http://localhost:8000/callback`
   - Note your Client ID and Client Secret

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Add your Coinbase credentials to `.env`:
   ```env
   COINBASE_CLIENT_ID=your_client_id_here
   COINBASE_CLIENT_SECRET=your_client_secret_here
   COINBASE_REDIRECT_URI=http://localhost:8000/callback
   ```

## Usage

### Starting the OAuth Server

Run the Coinbase OAuth server:

```bash
npm run coinbase-oauth
```

The server will start at `http://localhost:8000`

### Testing the OAuth Flow

1. Open your browser and navigate to: `http://localhost:8000`
2. Click "Login with Coinbase" button
3. You will be redirected to Coinbase for authentication
4. Log in with your Coinbase credentials
5. Authorize the application to access your account
6. You will be redirected back to the callback URL with tokens

### OAuth Flow Steps

```
┌──────────┐                                                     ┌──────────┐
│          │  1. User clicks "Login with Coinbase"              │          │
│  Client  │────────────────────────────────────────────────────▶│  Server  │
│          │                                                     │          │
└──────────┘                                                     └──────────┘
                                                                       │
                                                                       │ 2. Generate state & PKCE
                                                                       │    code_challenge
                                                                       ▼
┌──────────┐                                                     ┌──────────┐
│          │  3. Redirect to Coinbase with state & challenge    │          │
│ Coinbase │◀────────────────────────────────────────────────────│  Server  │
│   API    │                                                     │          │
└──────────┘                                                     └──────────┘
     │
     │ 4. User authenticates & authorizes
     ▼
┌──────────┐
│          │  5. Redirect to callback with code & state
│  Client  │────────────────────────────────────────────────────▶
│          │                                                     
└──────────┘                                                     
                                                                 ┌──────────┐
                                                                 │          │
     6. Verify state & exchange code for token                  │  Server  │
        using code_verifier                                     │          │
◀────────────────────────────────────────────────────────────────│          │
                                                                 └──────────┘
                                                                       │
                                                                       │ 7. Coinbase validates
                                                                       │    code_verifier
                                                                       ▼
┌──────────┐                                                     ┌──────────┐
│          │  8. Return access_token & refresh_token            │          │
│ Coinbase │─────────────────────────────────────────────────────▶│  Server  │
│   API    │                                                     │          │
└──────────┘                                                     └──────────┘
```

## API Endpoints

### GET /

Home page with instructions and links.

### GET /login

Initiates the OAuth2 flow:
- Generates state parameter (CSRF protection)
- Generates PKCE code verifier and challenge
- Redirects to Coinbase authorization URL

**Query Parameters Sent to Coinbase:**
- `response_type=code`: OAuth2 authorization code flow
- `client_id`: Your application's client ID
- `redirect_uri`: Where Coinbase redirects after authorization
- `scope=wallet:user:read`: Requested permissions
- `state`: Random string for CSRF protection
- `code_challenge`: SHA256 hash of code verifier
- `code_challenge_method=S256`: PKCE method

### GET /callback

Handles the OAuth2 callback:
- Receives authorization code from Coinbase
- Validates state parameter
- Exchanges code for access token using PKCE
- Displays tokens (demo only - store securely in production)

**Query Parameters Received:**
- `code`: Authorization code to exchange for token
- `state`: State parameter for validation

## Security Considerations

### PKCE (Proof Key for Code Exchange)

This implementation uses PKCE to prevent authorization code interception attacks:

1. **Code Verifier**: Random 128-character string
2. **Code Challenge**: SHA256 hash of code verifier (base64url encoded)
3. The code verifier is stored server-side and sent during token exchange
4. Coinbase validates that the code_verifier matches the code_challenge

### State Parameter

The state parameter prevents CSRF attacks:
- Random string generated for each OAuth flow
- Sent to Coinbase and returned in callback
- Server validates that returned state matches stored state

### Session Storage

The demo uses in-memory storage (not suitable for production):
```javascript
const sessionStore = new Map();
```

**Production Recommendations:**
- Use Redis or secure session store
- Encrypt session data
- Set session expiration (current demo: 10 minutes)
- Use secure, httpOnly cookies for session IDs

### Token Storage

**This demo displays tokens (for demonstration only).**

**Production Best Practices:**
- Store tokens in encrypted database
- Never expose tokens to client-side code
- Use secure, httpOnly cookies for session management
- Implement token refresh logic
- Set proper token expiration

## Available Scopes

Coinbase supports various OAuth scopes:

- `wallet:user:read` - Read user profile information
- `wallet:user:email` - Read user email
- `wallet:accounts:read` - Read account information
- `wallet:transactions:read` - Read transaction history
- `wallet:transactions:send` - Send transactions
- `wallet:buys:read` - Read buy information
- `wallet:sells:read` - Read sell information

Modify the scope in `coinbase-oauth.js`:
```javascript
scope: 'wallet:user:read wallet:accounts:read'
```

## Using the Access Token

After obtaining an access token, you can make authenticated API requests:

```javascript
const https = require('https');

function getUserProfile(accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.coinbase.com',
      path: '/v2/user',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'CB-VERSION': '2023-11-01'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });

    req.on('error', reject);
    req.end();
  });
}

// Usage
const profile = await getUserProfile(tokenData.access_token);
console.log('User:', profile.data.name);
```

## Refreshing Tokens

Access tokens expire after a certain time. Use refresh tokens to get new access tokens:

```javascript
function refreshAccessToken(refreshToken) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const req = https.request(config.tokenUrl, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}
```

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Ensure redirect URI in Coinbase app settings exactly matches `COINBASE_REDIRECT_URI`
   - Include the protocol (`http://` or `https://`)
   - Match the port number exactly

2. **"Invalid client"**
   - Verify `COINBASE_CLIENT_ID` and `COINBASE_CLIENT_SECRET` are correct
   - Check that credentials are from the correct Coinbase application

3. **"Invalid state"**
   - Session may have expired (default: 10 minutes)
   - Ensure browser cookies are enabled
   - Try clearing browser cache and cookies

4. **"Code verifier mismatch"**
   - This shouldn't happen if implementation is correct
   - May indicate session storage issues

### Debug Mode

Enable detailed logging by adding console.log statements:

```javascript
// In exchangeCodeForToken function
console.log('Token request:', postData);
console.log('Token response:', data);
```

## Production Deployment Checklist

- [ ] Use environment variables for all sensitive data
- [ ] Enable HTTPS (required by Coinbase in production)
- [ ] Update redirect URI to production URL in Coinbase settings
- [ ] Implement secure session storage (Redis, etc.)
- [ ] Store tokens encrypted in database
- [ ] Never log or display tokens in production
- [ ] Implement proper error handling
- [ ] Add rate limiting
- [ ] Set up monitoring and alerting
- [ ] Implement token refresh logic
- [ ] Add user logout functionality
- [ ] Use secure, httpOnly cookies
- [ ] Implement CSRF protection beyond state parameter
- [ ] Add input validation and sanitization
- [ ] Set proper CORS headers
- [ ] Implement proper logging (without sensitive data)

## Additional Resources

- [Coinbase OAuth2 Documentation](https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/oauth2-authentication)
- [RFC 6749 - OAuth 2.0](https://tools.ietf.org/html/rfc6749)
- [RFC 7636 - PKCE](https://tools.ietf.org/html/rfc7636)
- [Coinbase API Reference](https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-users)

## License

See [OWNERSHIP.md](../OWNERSHIP.md) for licensing information.
