/**
 * Shared HTTP utilities for making HTTPS requests
 */

const https = require('https');

/**
 * Make HTTPS POST request with JSON response
 * @param {string} url - The URL to make the request to
 * @param {string} postData - The POST data to send
 * @returns {Promise<Object>} - The parsed JSON response
 */
function makeHttpsPostRequest(url, postData) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
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

    req.write(postData);
    req.end();
  });
}

/**
 * Make HTTPS GET request with JSON response
 * @param {string} url - The URL to make the request to
 * @returns {Promise<Object>} - The parsed JSON response
 */
function makeHttpsGetRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

module.exports = {
  makeHttpsPostRequest,
  makeHttpsGetRequest,
};
