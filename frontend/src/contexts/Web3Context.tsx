import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// Import contract addresses and ABIs
import contractAddresses from '../contracts/addresses.json';
import ProjectRegistryABI from '../contracts/ProjectRegistry.json';
import ApprovalWorkflowABI from '../contracts/ApprovalWorkflow.json';
import FundManagementABI from '../contracts/FundManagement.json';
import DocumentVerificationABI from '../contracts/DocumentVerification.json';

// Network configuration
const NETWORKS = {
  localhost: {
    chainId: '0x539', // 1337 in hex
    chainName: 'Localhost 8545',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['http://127.0.0.1:8545'],
    blockExplorerUrls: ['']
  },
  mumbai: {
    chainId: '0x13881', // 80001 in hex
    chainName: 'Polygon Mumbai Testnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/']
  }
};

interface Web3ContextType {
  // Wallet state
  account: string | null;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  
  // Contracts
  projectRegistry: ethers.Contract | null;
  approvalWorkflow: ethers.Contract | null;
  fundManagement: ethers.Contract | null;
  documentVerification: ethers.Contract | null;
  
  // Functions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (network: 'localhost' | 'mumbai') => Promise<void>;
  
  // Provider and signer
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  
  // Contract instances
  const [projectRegistry, setProjectRegistry] = useState<ethers.Contract | null>(null);
  const [approvalWorkflow, setApprovalWorkflow] = useState<ethers.Contract | null>(null);
  const [fundManagement, setFundManagement] = useState<ethers.Contract | null>(null);
  const [documentVerification, setDocumentVerification] = useState<ethers.Contract | null>(null);

  // Check if MetaMask is installed
  const checkMetaMaskInstalled = (): boolean => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask is not installed. Please install MetaMask to use this dApp.');
      return false;
    }
    return true;
  };

  // Initialize contracts
  const initializeContracts = async (signerInstance: ethers.Signer) => {
    try {
      const addresses = contractAddresses.contracts;
      
      const projectRegistryContract = new ethers.Contract(
        addresses.ProjectRegistry,
        ProjectRegistryABI,
        signerInstance
      );
      
      const approvalWorkflowContract = new ethers.Contract(
        addresses.ApprovalWorkflow,
        ApprovalWorkflowABI,
        signerInstance
      );
      
      const fundManagementContract = new ethers.Contract(
        addresses.FundManagement,
        FundManagementABI,
        signerInstance
      );
      
      const documentVerificationContract = new ethers.Contract(
        addresses.DocumentVerification,
        DocumentVerificationABI,
        signerInstance
      );
      
      setProjectRegistry(projectRegistryContract);
      setApprovalWorkflow(approvalWorkflowContract);
      setFundManagement(fundManagementContract);
      setDocumentVerification(documentVerificationContract);
      
      console.log('✅ Contracts initialized successfully');
    } catch (error) {
      console.error('Error initializing contracts:', error);
      toast.error('Failed to initialize contracts');
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!checkMetaMaskInstalled()) return;
    
    setIsConnecting(true);
    
    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await web3Provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      const userAccount = accounts[0];
      const signerInstance = web3Provider.getSigner();
      const network = await web3Provider.getNetwork();
      const userBalance = await web3Provider.getBalance(userAccount);
      
      setAccount(userAccount);
      setBalance(ethers.utils.formatEther(userBalance));
      setChainId(network.chainId);
      setProvider(web3Provider);
      setSigner(signerInstance);
      setIsConnected(true);
      
      // Initialize contracts
      await initializeContracts(signerInstance);
      
      toast.success(`Connected: ${userAccount.substring(0, 6)}...${userAccount.substring(38)}`);
      
      // Save to localStorage
      localStorage.setItem('isWalletConnected', 'true');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setBalance('0');
    setIsConnected(false);
    setChainId(null);
    setProvider(null);
    setSigner(null);
    setProjectRegistry(null);
    setApprovalWorkflow(null);
    setFundManagement(null);
    setDocumentVerification(null);
    
    localStorage.removeItem('isWalletConnected');
    toast.success('Wallet disconnected');
  };

  // Switch network
  const switchNetwork = async (network: 'localhost' | 'mumbai') => {
    if (!checkMetaMaskInstalled()) return;
    
    try {
      const networkConfig = NETWORKS[network];
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      });
      
      toast.success(`Switched to ${networkConfig.chainName}`);
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        try {
          const networkConfig = NETWORKS[network];
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          });
          toast.success(`Added and switched to ${networkConfig.chainName}`);
        } catch (addError: any) {
          console.error('Error adding network:', addError);
          toast.error('Failed to add network');
        }
      } else {
        console.error('Error switching network:', error);
        toast.error('Failed to switch network');
      }
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          toast('Account changed');
          // Reconnect to update balance and contracts
          connectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Auto-connect if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem('isWalletConnected');
    if (wasConnected === 'true' && typeof window.ethereum !== 'undefined') {
      connectWallet();
    }
  }, []);

  // Update balance periodically
  useEffect(() => {
    if (account && provider) {
      const updateBalance = async () => {
        try {
          const userBalance = await provider.getBalance(account);
          setBalance(ethers.utils.formatEther(userBalance));
        } catch (error) {
          console.error('Error updating balance:', error);
        }
      };

      updateBalance();
      const interval = setInterval(updateBalance, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    }
  }, [account, provider]);

  const value: Web3ContextType = {
    account,
    balance,
    isConnected,
    isConnecting,
    chainId,
    projectRegistry,
    approvalWorkflow,
    fundManagement,
    documentVerification,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    provider,
    signer,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
