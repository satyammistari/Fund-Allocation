import { ethers } from 'ethers';
import toast from 'react-hot-toast';

/**
 * Format Ethereum address for display
 */
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(38)}`;
};

/**
 * Format balance with decimals
 */
export const formatBalance = (balance: string, decimals: number = 4): string => {
  const num = parseFloat(balance);
  return num.toFixed(decimals);
};

/**
 * Convert ETH to Wei
 */
export const toWei = (amount: string): ethers.BigNumber => {
  try {
    return ethers.utils.parseEther(amount);
  } catch (error) {
    console.error('Error converting to Wei:', error);
    throw new Error('Invalid amount');
  }
};

/**
 * Convert Wei to ETH
 */
export const fromWei = (amount: ethers.BigNumber): string => {
  try {
    return ethers.utils.formatEther(amount);
  } catch (error) {
    console.error('Error converting from Wei:', error);
    return '0';
  }
};

/**
 * Wait for transaction confirmation
 */
export const waitForTransaction = async (
  tx: ethers.ContractTransaction,
  confirmations: number = 1
): Promise<ethers.ContractReceipt> => {
  try {
    toast.loading('Transaction submitted. Waiting for confirmation...', {
      id: 'tx-wait',
    });

    const receipt = await tx.wait(confirmations);

    toast.success('Transaction confirmed!', { id: 'tx-wait' });
    return receipt;
  } catch (error: any) {
    toast.error('Transaction failed', { id: 'tx-wait' });
    console.error('Transaction error:', error);
    throw error;
  }
};

/**
 * Handle contract transaction with error handling
 */
export const executeTransaction = async (
  transactionFn: () => Promise<ethers.ContractTransaction>,
  successMessage: string = 'Transaction successful'
): Promise<ethers.ContractReceipt> => {
  try {
    const tx = await transactionFn();
    const receipt = await waitForTransaction(tx);
    toast.success(successMessage);
    return receipt;
  } catch (error: any) {
    console.error('Transaction execution error:', error);
    
    // Parse error message
    let errorMessage = 'Transaction failed';
    
    if (error.code === 4001) {
      errorMessage = 'Transaction rejected by user';
    } else if (error.reason) {
      errorMessage = error.reason;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Get transaction explorer URL
 */
export const getExplorerUrl = (
  txHash: string,
  chainId: number
): string => {
  const explorers: { [key: number]: string } = {
    1: 'https://etherscan.io/tx/',
    5: 'https://goerli.etherscan.io/tx/',
    137: 'https://polygonscan.com/tx/',
    80001: 'https://mumbai.polygonscan.com/tx/',
    1337: '', // Localhost
  };

  const baseUrl = explorers[chainId] || '';
  return baseUrl ? `${baseUrl}${txHash}` : '';
};

/**
 * Get address explorer URL
 */
export const getAddressExplorerUrl = (
  address: string,
  chainId: number
): string => {
  const explorers: { [key: number]: string } = {
    1: 'https://etherscan.io/address/',
    5: 'https://goerli.etherscan.io/address/',
    137: 'https://polygonscan.com/address/',
    80001: 'https://mumbai.polygonscan.com/address/',
    1337: '', // Localhost
  };

  const baseUrl = explorers[chainId] || '';
  return baseUrl ? `${baseUrl}${address}` : '';
};

/**
 * Parse contract error
 */
export const parseContractError = (error: any): string => {
  if (error.code === 4001) {
    return 'Transaction rejected by user';
  }

  if (error.reason) {
    return error.reason;
  }

  if (error.data?.message) {
    return error.data.message;
  }

  if (error.message) {
    // Extract revert reason from error message
    const match = error.message.match(/reason="([^"]+)"/);
    if (match) {
      return match[1];
    }
    return error.message;
  }

  return 'Unknown error occurred';
};

/**
 * Validate Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
  try {
    return ethers.utils.isAddress(address);
  } catch {
    return false;
  }
};

/**
 * Get network name from chain ID
 */
export const getNetworkName = (chainId: number): string => {
  const networks: { [key: number]: string } = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    137: 'Polygon Mainnet',
    80001: 'Mumbai Testnet',
    1337: 'Localhost',
  };

  return networks[chainId] || 'Unknown Network';
};

/**
 * Format timestamp to readable date
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

/**
 * Calculate time ago
 */
export const timeAgo = (timestamp: number): string => {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);

  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInInterval);
    if (interval >= 1) {
      return `${interval} ${name}${interval !== 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  } catch (error) {
    console.error('Failed to copy:', error);
    toast.error('Failed to copy');
  }
};

/**
 * Truncate text
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format large numbers
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toString();
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

/**
 * Validate GPS coordinates
 */
export const validateGPSCoordinates = (
  latitude: string,
  longitude: string
): boolean => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Generate random color for charts
 */
export const generateRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Check if transaction is pending
 */
export const isTransactionPending = (receipt: ethers.ContractReceipt): boolean => {
  return receipt.status === 0;
};

/**
 * Get gas price in Gwei
 */
export const getGasPrice = async (
  provider: ethers.providers.Provider
): Promise<string> => {
  try {
    const gasPrice = await provider.getGasPrice();
    return ethers.utils.formatUnits(gasPrice, 'gwei');
  } catch (error) {
    console.error('Error getting gas price:', error);
    return '0';
  }
};
