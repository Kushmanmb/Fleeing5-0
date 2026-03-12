/**
 * Shared validation utilities
 * Common validation functions used across multiple modules
 */

const { ethers } = require('ethers');

/**
 * Validate an Ethereum address format
 * @param {string} address - The address to validate
 * @throws {Error} If address is invalid
 */
function validateEthereumAddress(address) {
  if (!address) {
    throw new Error('Address is required');
  }
  if (!ethers.utils.isAddress(address)) {
    throw new Error('Invalid Ethereum address format');
  }
}

/**
 * Normalize an Ethereum address to lowercase
 * @param {string} address - The address to normalize
 * @returns {string} Lowercase address
 */
function normalizeAddress(address) {
  validateEthereumAddress(address);
  return address.toLowerCase();
}

module.exports = {
  validateEthereumAddress,
  normalizeAddress,
};
