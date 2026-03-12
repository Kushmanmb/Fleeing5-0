/**
 * Shared validation utilities
 */

const { ethers } = require('ethers');

/**
 * Validate an Ethereum address format
 * @param {string} address - The address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidEthereumAddress(address) {
  return ethers.utils.isAddress(address);
}

/**
 * Validate an Ethereum address and throw error if invalid
 * @param {string} address - The address to validate
 * @param {string} fieldName - The name of the field for error message (default: 'Address')
 * @throws {Error} - If address is invalid
 */
function validateEthereumAddress(address, fieldName = 'Address') {
  if (!ethers.utils.isAddress(address)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
}

module.exports = {
  isValidEthereumAddress,
  validateEthereumAddress,
};
