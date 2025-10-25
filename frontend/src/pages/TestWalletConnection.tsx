import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import WalletConnect from '../components/common/WalletConnect';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatAddress, formatBalance, getNetworkName } from '../utils/blockchain';

const TestWalletConnection: React.FC = () => {
  const {
    account,
    balance,
    isConnected,
    chainId,
    projectRegistry,
    approvalWorkflow,
    fundManagement,
    documentVerification,
    provider,
  } = useWeb3();

  const [contractsStatus, setContractsStatus] = useState<{
    [key: string]: { loaded: boolean; address: string };
  }>({});
  const [blockNumber, setBlockNumber] = useState<number>(0);
  const [gasPrice, setGasPrice] = useState<string>('0');

  // Check contract status
  useEffect(() => {
    const checkContracts = async () => {
      const status: any = {};

      if (projectRegistry) {
        status.projectRegistry = {
          loaded: true,
          address: projectRegistry.address,
        };
      }

      if (approvalWorkflow) {
        status.approvalWorkflow = {
          loaded: true,
          address: approvalWorkflow.address,
        };
      }

      if (fundManagement) {
        status.fundManagement = {
          loaded: true,
          address: fundManagement.address,
        };
      }

      if (documentVerification) {
        status.documentVerification = {
          loaded: true,
          address: documentVerification.address,
        };
      }

      setContractsStatus(status);
    };

    checkContracts();
  }, [projectRegistry, approvalWorkflow, fundManagement, documentVerification]);

  // Get real-time blockchain data
  useEffect(() => {
    if (provider) {
      const updateBlockchainData = async () => {
        try {
          const block = await provider.getBlockNumber();
          setBlockNumber(block);

          const price = await provider.getGasPrice();
          setGasPrice((parseFloat(price.toString()) / 1e9).toFixed(2));
        } catch (error) {
          console.error('Error fetching blockchain data:', error);
        }
      };

      updateBlockchainData();
      const interval = setInterval(updateBlockchainData, 5000);

      return () => clearInterval(interval);
    }
  }, [provider]);

  // Test contract interaction
  const testContractRead = async () => {
    if (!projectRegistry) {
      alert('Project Registry contract not loaded');
      return;
    }

    try {
      const totalProjects = await projectRegistry.getTotalProjects();
      alert(`Total Projects: ${totalProjects.toString()}`);
    } catch (error: any) {
      console.error('Error reading contract:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🧪 Wallet Connection Test
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Real-time Web3 Connection Verification
              </p>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please connect your MetaMask wallet to test the Web3 integration
              </p>
              <div className="flex justify-center">
                <WalletConnect />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connection Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  ✅ Wallet Connected
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Account
                  </p>
                  <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white break-all">
                    {formatAddress(account || '')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 break-all">
                    {account}
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Balance
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatBalance(balance)} ETH
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Network
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {chainId ? getNetworkName(chainId) : 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Chain ID: {chainId}
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Block Number
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {blockNumber.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Gas: {gasPrice} Gwei
                  </p>
                </div>
              </div>
            </div>

            {/* Contracts Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                📜 Smart Contracts Status
              </h2>

              <div className="space-y-3">
                {Object.entries(contractsStatus).length === 0 ? (
                  <div className="text-center py-8">
                    <LoadingSpinner size="lg" text="Loading contracts..." />
                  </div>
                ) : (
                  <>
                    {Object.entries(contractsStatus).map(([name, status]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              status.loaded ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          ></div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white capitalize">
                              {name.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                              {status.address}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            status.loaded
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {status.loaded ? 'Loaded' : 'Not Loaded'}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Test Interactions Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                🧪 Test Contract Interactions
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={testContractRead}
                  disabled={!projectRegistry}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Read Total Projects
                </button>

                <button
                  onClick={() => alert('Write function test - Coming soon!')}
                  disabled={!projectRegistry}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Test Write Function
                </button>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex gap-3">
                  <svg
                    className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                      Test Information
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                      These buttons test read/write operations with the deployed smart
                      contracts. Make sure your wallet is connected to the correct
                      network.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Updates Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                📡 Real-time Updates
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-900 dark:text-white font-medium">
                      Block Number Updates
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Every 5 seconds
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-900 dark:text-white font-medium">
                      Balance Updates
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Every 10 seconds
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-900 dark:text-white font-medium">
                      Gas Price Tracking
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Real-time
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TestWalletConnection;
