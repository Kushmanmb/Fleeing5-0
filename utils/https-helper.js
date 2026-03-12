/**
 * Shared HTTP utilities for making HTTPS requests
 * Provides a unified interface for GET and POST requests with JSON parsing
 */

const https = require('https');

/**
 * Make an HTTPS request to a URL
 * @param {string} url - Full URL to request
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method (GET or POST)
 * @param {string} [options.body] - Request body for POST requests
 * @param {Object} [options.headers] - Additional headers
 * @returns {Promise<Object>} Parsed JSON response
 */
function makeHttpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const method = options.method || 'GET';
    const body = options.body || null;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: options.headers || {},
    };

    // Add Content-Type and Content-Length for POST requests
    if (method === 'POST' && body) {
      requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      requestOptions.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (method === 'POST' && body) {
      req.write(body);
    }
    
    req.end();
  });
}

/**
 * Make an HTTPS GET request
 * @param {string} url - Full URL to request
 * @returns {Promise<Object>} Parsed JSON response
 */
function httpsGet(url) {
  return makeHttpsRequest(url, { method: 'GET' });
}

/**
 * Make an HTTPS POST request
 * @param {string} url - Full URL to request
 * @param {string} body - Request body (should be URL-encoded string)
 * @returns {Promise<Object>} Parsed JSON response
 */
function httpsPost(url, body) {
  return makeHttpsRequest(url, { method: 'POST', body });
}

module.exports = {
  makeHttpsRequest,
  httpsGet,
  httpsPost,
};
