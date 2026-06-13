import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ethers } from 'ethers';
import '@/App.css';
import Dashboard from './components/Dashboard';
import ProjectDetails from './components/ProjectDetails';
import CreateProject from './components/CreateProject';
import TransactionHistory from './components/TransactionHistory';
import SupervisorApproval from './components/SupervisorApproval';
import OracleVerification from './components/OracleVerification';
import Login from './components/Login';
import Header from './components/Header';
import { Toaster } from './components/ui/sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
const API = `${BACKEND_URL}/api`;

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing user session
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    disconnectWallet();
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this application.\n\nDownload at: https://metamask.io');
      return;
    }

    try {
      setIsConnecting(true);

      // Request account access first
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Use ethers v5 API
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await web3Provider.getNetwork();
      const currentChainId = Number(network.chainId);

      console.log('🔗 Current chain:', currentChainId);

      // If not on localhost (1337), switch to it
      if (currentChainId !== 1337) {
        toast.info('Switching to Hardhat Local Network…');
        const switched = await switchToLocalhost();
        if (!switched) return;
        // Re-init provider after switch
        await new Promise(r => setTimeout(r, 500));
      }

      const finalProvider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = finalProvider.getSigner();
      const address = await web3Signer.getAddress();
      const finalNetwork = await finalProvider.getNetwork();

      setProvider(finalProvider);
      setSigner(web3Signer);
      setAccount(address);
      setChainId(Number(finalNetwork.chainId));

      console.log('✅ Wallet connected:', address);
      console.log('📡 Network: Hardhat Localhost (Chain ID:', finalNetwork.chainId, ')');
      toast.success('Wallet connected!', { description: address.slice(0, 10) + '…' + address.slice(-6) });

    } catch (error) {
      console.error('❌ Error connecting wallet:', error);
      if (error.code === 4001) {
        toast.error('MetaMask connection rejected by user');
      } else if (error.code === -32002) {
        toast.error('MetaMask already has a pending request — check the extension');
      } else {
        toast.error('Failed to connect: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToLocalhost = async () => {
    const LOCALHOST_CHAIN_ID = '0x539'; // 1337 in hex
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: LOCALHOST_CHAIN_ID }],
      });
      return true;
    } catch (switchError) {
      // Chain not added yet — add it
      if (switchError.code === 4902 || switchError.code === -32603) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: LOCALHOST_CHAIN_ID,
              chainName: 'Hardhat Localhost',
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['http://127.0.0.1:8545'],
              blockExplorerUrls: [],
            }],
          });
          return true;
        } catch (addError) {
          console.error('Error adding localhost network:', addError);
          toast.error('Could not add Hardhat network to MetaMask.\nAdd it manually: RPC http://127.0.0.1:8545, Chain ID 1337');
          return false;
        }
      } else if (switchError.code === 4001) {
        toast.error('Network switch rejected');
        return false;
      } else {
        toast.error('Failed to switch network: ' + switchError.message);
        return false;
      }
    }
  };


  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', (chainIdHex) => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        {isAuthenticated && (
          <Header 
            account={account}
            chainId={chainId}
            user={user}
            onConnect={connectWallet}
            onDisconnect={disconnectWallet}
            onLogout={handleLogout}
            isConnecting={isConnecting}
          />
        )}
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <Dashboard 
                  account={account}
                  provider={provider}
                  signer={signer}
                  user={user}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/project/:id" 
            element={
              isAuthenticated ? (
                <ProjectDetails 
                  account={account}
                  provider={provider}
                  signer={signer}
                  user={user}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/create" 
            element={
              isAuthenticated ? (
                user?.role === 'admin' ? (
                  <CreateProject 
                    account={account || user?.address}
                    signer={signer}
                    user={user}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/supervisor/approvals" 
            element={
              isAuthenticated ? (
                user?.role === 'supervisor' ? (
                  <SupervisorApproval user={user} />
                ) : (
                  <Navigate to="/" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/supervisor/verifications" 
            element={
              isAuthenticated ? (
                user?.role === 'supervisor' ? (
                  <OracleVerification user={user} />
                ) : (
                  <Navigate to="/" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/transactions" 
            element={
              isAuthenticated ? (
                <TransactionHistory user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;