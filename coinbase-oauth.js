#!/usr/bin/env node
/**
 * Coinbase OAuth2 Server
 * 
 * This server implements OAuth2 authorization code flow with PKCE for Coinbase API.
 * It allows users to authenticate with Coinbase and obtain access tokens.
 * 
 * Usage:
 *   1. Set up your Coinbase OAuth2 app credentials in .env
 *   2. Run: npm run coinbase-oauth
 *   3. Navigate to: http://localhost:8000/login
 */

require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');

// Configuration from environment variables or defaults
const config = {
  clientId: process.env.COINBASE_CLIENT_ID || 'YOUR_CLIENT_ID',
  clientSecret: process.env.COINBASE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET',
  redirectUri: process.env.COINBASE_REDIRECT_URI || 'http://localhost:8000/callback',
  authUrl: 'https://login.coinbase.com/oauth2/auth',
  tokenUrl: 'https://login.coinbase.com/oauth2/token',
  port: process.env.PORT || 8000
};

const app = express();

// In-memory storage for state and code verifier (for demo purposes)
// In production, use secure session storage
const sessionStore = new Map();

/**
 * Generates a cryptographically random state string for OAuth2
 * @returns {string} Random hex string
 */
function generateState() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generates a cryptographically random code verifier for PKCE
 * @returns {string} Base64URL-encoded random string (128 characters)
 */
function generateCodeVerifier() {
  // RFC 7636 requires code_verifier to be 43-128 characters
  // Generate 96 random bytes which produces exactly 128 base64url characters
  // (96 bytes * 4/3 = 128 characters, no padding needed)
  const buffer = crypto.randomBytes(96);
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generates a code challenge from the code verifier using S256 method
 * @param {string} codeVerifier - The code verifier string
 * @returns {string} Base64URL-encoded SHA256 hash
 */
function generateCodeChallenge(codeVerifier) {
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();
  return hash.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Login handler - initiates the OAuth2 flow
 */
app.get('/login', (req, res) => {
  console.log('Login initiated');
  
  // Generate state and PKCE parameters
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  
  // Store state and code verifier for validation in callback
  sessionStore.set(state, { codeVerifier, timestamp: Date.now() });
  
  // Clean up old sessions (older than 10 minutes)
  for (const [key, value] of sessionStore.entries()) {
    if (Date.now() - value.timestamp > 600000) {
      sessionStore.delete(key);
    }
  }
  
  // Build authorization URL
  const authParams = {
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: 'wallet:user:read',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  };
  
  const authorizationUrl = `${config.authUrl}?${querystring.stringify(authParams)}`;
  
  console.log('Redirecting to Coinbase authorization URL');
  res.redirect(authorizationUrl);
});

/**
 * Callback handler - handles OAuth2 callback and exchanges code for token
 */
app.get('/callback', async (req, res) => {
  console.log('Callback received');
  
  const { state, code, error, error_description } = req.query;
  
  // Check for OAuth errors
  if (error) {
    console.error('OAuth error:', error, error_description);
    return res.status(400).send(`OAuth Error: ${error} - ${error_description || 'Unknown error'}`);
  }
  
  // Validate required parameters
  if (!state || !code) {
    console.error('Missing state or code parameter');
    return res.status(400).send('Invalid callback: missing state or code');
  }
  
  // Retrieve session data
  const sessionData = sessionStore.get(state);
  if (!sessionData) {
    console.error('Invalid or expired state');
    return res.status(400).send('Invalid state: session expired or invalid');
  }
  
  // Remove used state from store
  sessionStore.delete(state);
  
  // Exchange code for access token
  try {
    const tokenData = await exchangeCodeForToken(code, sessionData.codeVerifier);
    
    console.log('Token exchange successful');
    
    // In a real application, you would:
    // 1. Store the tokens securely (encrypted in database)
    // 2. Create a user session
    // 3. Redirect to your application
    
    res.send(`
      <html>
        <head>
          <title>Coinbase OAuth Success</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            .success { color: green; }
            .token-display { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; word-wrap: break-word; }
            .warning { color: #ff6600; font-style: italic; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1 class="success">✓ Authentication Successful</h1>
          <p>You have successfully authenticated with Coinbase.</p>
          
          <h2>Token Information</h2>
          <div class="token-display">
            <strong>Access Token:</strong><br>${tokenData.access_token}
          </div>
          <div class="token-display">
            <strong>Token Type:</strong> ${tokenData.token_type}
          </div>
          <div class="token-display">
            <strong>Expires In:</strong> ${tokenData.expires_in} seconds
          </div>
          <div class="token-display">
            <strong>Refresh Token:</strong><br>${tokenData.refresh_token || 'N/A'}
          </div>
          <div class="token-display">
            <strong>Scope:</strong> ${tokenData.scope}
          </div>
          
          <p class="warning">
            ⚠️ Warning: In production, never display tokens directly. Store them securely and use them server-side.
          </p>
          
          <p><a href="/login">Authenticate Again</a></p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Token exchange error:', error.message);
    res.status(500).send(`Error exchanging token: ${error.message}`);
  }
});

/**
 * Exchanges authorization code for access token
 * @param {string} code - Authorization code from OAuth callback
 * @param {string} codeVerifier - PKCE code verifier
 * @returns {Promise<Object>} Token response object
 */
function exchangeCodeForToken(code, codeVerifier) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: config.redirectUri,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code_verifier: codeVerifier
    });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(config.tokenUrl, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(jsonData);
          } else {
            reject(new Error(jsonData.error_description || jsonData.error || `HTTP ${res.statusCode}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });
    
    req.write(postData);
    req.end();
  });
}

/**
 * Root endpoint - displays instructions
 */
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Coinbase OAuth2 Demo</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
          .button { display: inline-block; background: #1652f0; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .button:hover { background: #0d3cc7; }
          code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>Coinbase OAuth2 Demo Server</h1>
        <p>This server demonstrates OAuth2 authorization code flow with PKCE for Coinbase API.</p>
        
        <div class="warning">
          <strong>⚠️ Setup Required</strong><br>
          Before using this demo, you need to:
          <ol>
            <li>Create a Coinbase OAuth2 application at <a href="https://www.coinbase.com/settings/api" target="_blank">Coinbase API Settings</a></li>
            <li>Set the redirect URI to: <code>${config.redirectUri}</code></li>
            <li>Add your credentials to <code>.env</code> file:
              <ul>
                <li><code>COINBASE_CLIENT_ID</code></li>
                <li><code>COINBASE_CLIENT_SECRET</code></li>
                <li><code>COINBASE_REDIRECT_URI</code> (optional, defaults to http://localhost:8000/callback)</li>
              </ul>
            </li>
          </ol>
        </div>
        
        <h2>Getting Started</h2>
        <p>Click the button below to start the OAuth2 flow:</p>
        <a href="/login" class="button">Login with Coinbase</a>
        
        <h2>What This Demo Does</h2>
        <ul>
          <li>Generates secure state parameter to prevent CSRF attacks</li>
          <li>Implements PKCE (Proof Key for Code Exchange) for enhanced security</li>
          <li>Redirects to Coinbase for user authentication</li>
          <li>Handles the OAuth callback with authorization code</li>
          <li>Exchanges the code for access and refresh tokens</li>
          <li>Displays the obtained tokens (for demo purposes only)</li>
        </ul>
        
        <h2>Security Notes</h2>
        <ul>
          <li>This demo uses in-memory session storage (not suitable for production)</li>
          <li>In production, store tokens securely in an encrypted database</li>
          <li>Never expose access tokens to the client side</li>
          <li>Use HTTPS in production environments</li>
          <li>Implement proper session management with secure cookies</li>
        </ul>
      </body>
    </html>
  `);
});

// Start the server
app.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║           Coinbase OAuth2 Server Started                      ║
╚════════════════════════════════════════════════════════════════╝

Server running at: http://localhost:${config.port}

Configuration:
  • Client ID: ${config.clientId === 'YOUR_CLIENT_ID' ? '⚠️  NOT SET' : '✓ Configured'}
  • Client Secret: ${config.clientSecret === 'YOUR_CLIENT_SECRET' ? '⚠️  NOT SET' : '✓ Configured'}
  • Redirect URI: ${config.redirectUri}

${config.clientId === 'YOUR_CLIENT_ID' || config.clientSecret === 'YOUR_CLIENT_SECRET' ? 
`⚠️  WARNING: Please configure your Coinbase OAuth2 credentials in .env file
   See .env.example for required variables.
` : ''}
To start OAuth flow, open: http://localhost:${config.port}/login

Press Ctrl+C to stop the server.
  `);
});

module.exports = app;
