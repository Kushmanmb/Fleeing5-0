// Example usage of the Etherscan API integration
// This demonstrates how to use the fetchEtherscanTransactions function

const { fetchEtherscanTransactions } = require('./script.js');

// Example: Fetch transactions for the default address
async function exampleUsage() {
  // Replace 'YOUR_API_KEY' with your actual Etherscan API key
  const apiKey = 'YOUR_API_KEY';
  
  try {
    console.log('Fetching transactions from Etherscan API...');
    
    // Using default parameters (address: 0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae)
    const result = await fetchEtherscanTransactions(apiKey);
    
    console.log('API Response:', JSON.stringify(result, null, 2));
    
    // You can also customize the parameters:
    // const customResult = await fetchEtherscanTransactions(
    //   apiKey,
    //   '0xYourCustomAddress',
    //   1000000,  // startblock
    //   2000000,  // endblock
    //   'desc'    // sort order
    // );
    
  } catch (error) {
    console.error('Failed to fetch transactions:', error.message);
  }
}

// Uncomment the line below to run the example
exampleUsage();

console.log('Example file loaded. Set your API key and uncomment exampleUsage() to run.');
