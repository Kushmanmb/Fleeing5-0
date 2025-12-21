// Etherscan API integration

/**
 * Fetches transaction list from Etherscan API v2
 * @param {string} apiKey - Your Etherscan API key
 * @param {string} address - Ethereum address to query (default: 0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae)
 * @param {number} startblock - Starting block number (default: 0)
 * @param {number} endblock - Ending block number (default: 99999999)
 * @param {string} sort - Sort order: 'asc' or 'desc' (default: 'asc')
 * @returns {Promise<Object>} API response with transaction list
 */
async function fetchEtherscanTransactions(
  apiKey,
  address = "0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae",
  startblock = 0,
  endblock = 99999999,
  sort = "asc"
) {
  const url = "https://api.etherscan.io/v2/api";
  
  const requestBody = {
    module: "account",
    action: "txlist",
    address: address,
    startblock: startblock,
    endblock: endblock,
    sort: sort
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Etherscan transactions:", error);
    throw error;
  }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fetchEtherscanTransactions };
}
