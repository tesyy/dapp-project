import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { connectWallet, getLoans } from './ethereum';
import Header from './components/Header';
import MyLoans from './components/MyLoans';
import LoanPool from './components/LoanPool';
import ActiveLoans from './components/ActiveLoans';

function App() {
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [duration, setDuration] = useState('');
  const [transactionData, setTransactionData] = useState(null);
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loans, setLoans] = useState([]);
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'myloans', 'pool', 'active'
  const [isLoadingLoans, setIsLoadingLoans] = useState(false);
  const [lastAction, setLastAction] = useState(''); // 'create', 'fund', or 'repay'

  // Only set up event listeners for account and chain changes, no automatic connection
  useEffect(() => {
    if (window.ethereum) {
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          setAccount('');
          setIsConnected(false);
          setContract(null);
          setLoans([]);
        }
      });
      
      // Listen for network changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const loadLoans = async (contractInstance) => {
    try {
      setIsLoadingLoans(true);
      const contractToUse = contractInstance || contract;
      
      if (!contractToUse) {
        console.error("No contract instance available to load loans");
        return;
      }
      
      console.log("Getting loans from contract:", await contractToUse.getAddress());
      const loansList = await getLoans(contractToUse);
      console.log("Loans loaded:", loansList);
      
      // Sort by ID (most recent first)
      const sortById = (a, b) => parseInt(b.id) - parseInt(a.id);
      const sortedLoans = [...loansList].sort(sortById);
      
      setLoans(sortedLoans);
    } catch (error) {
      console.error("Error loading loans:", error);
    } finally {
      setIsLoadingLoans(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      console.log("Connecting wallet from App component...");
      const connection = await connectWallet();
      console.log("Connection result:", connection);
      
      if (connection.address) {
        setAccount(connection.address);
        setIsConnected(true);
        setContract(connection.contract);
        console.log("Wallet connected successfully:", connection.address);
        
        // Load loans after connecting
        loadLoans(connection.contract);
      } else if (connection.error) {
        console.error("Connection returned error:", connection.error);
      }
    } catch (error) {
      console.error("Error in handleConnectWallet:", error);
      alert(`Failed to connect wallet: ${error.message || "Unknown error"}`);
    }
  };

  const handleDisconnectWallet = () => {
    // There's no actual "disconnect" in MetaMask/web3, 
    // so we just reset the app state
    setAccount('');
    setIsConnected(false);
    setContract(null);
    setLoans([]);
    setTransactionData(null);
    console.log("Wallet disconnected");
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const createLoan = async (e) => {
    e.preventDefault();
    console.log('Creating loan:', { amount, interestRate, duration });
    
    try {
      setIsLoading(true);
      setLastAction('create');
      
      // Use zero address for token (represents ETH in the contract)
      const zeroAddress = "0x0000000000000000000000000000000000000000";
      
      // Import the enhanced createLoan function from ethereum.js
      const { createLoan } = await import('./ethereum');
      
      // Call our enhanced createLoan function with better error handling
      const result = await createLoan(
        contract,
        zeroAddress,
        amount.toString(), 
        interestRate.toString(), 
        duration.toString(), 
        false // Not collateralized for this example
      );
      
      if (result.success) {
        setTransactionData({
          hash: result.hash,
          blockNumber: result.blockNumber,
          from: result.from,
          to: result.to,
          gasUsed: result.gasUsed,
          loanId: result.loanId
        });
        
        // Reset form fields
        setAmount('');
        setInterestRate('');
        setDuration('');
        
        // Reload loans after creating a new one
        await loadLoans(contract);
        
        // Switch to the myloans tab to see the new loan
        setActiveTab('myloans');
      } else {
        alert(`Error: ${result.error}`);
      }
      
    } catch (error) {
      console.error("Error creating loan:", error);
      alert(`Error creating loan: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionComplete = async (result, type) => {
    setTransactionData(result);
    setLastAction(type);
    
    // Reload loans to get the updated state
    await loadLoans(contract);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>DeFi Lending Platform</h1>
        <div className="wallet-section">
          {!isConnected ? (
            <button onClick={handleConnectWallet} className="connect-button">
              Connect Wallet
            </button>
          ) : (
            <>
              <span className="connected-address">
                Connected: {formatAddress(account)}
              </span>
              <button onClick={handleConnectWallet} className="connect-button">
                Switch Wallet
              </button>
              <button 
                onClick={handleDisconnectWallet} 
                className="disconnect-button"
                style={{backgroundColor: '#ff4757', color: 'white', padding: '8px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer'}}
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </header>
      
      {isConnected ? (
        <>
          <div className="tabs">
            <button 
              className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              Create Loan
            </button>
            <button 
              className={`tab-button ${activeTab === 'myloans' ? 'active' : ''}`}
              onClick={() => { setActiveTab('myloans'); loadLoans(contract); }}
            >
              My Loans
            </button>
            <button 
              className={`tab-button ${activeTab === 'pool' ? 'active' : ''}`}
              onClick={() => { setActiveTab('pool'); loadLoans(contract); }}
            >
              Loan Pool
            </button>
            <button 
              className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => { setActiveTab('active'); loadLoans(contract); }}
            >
              Active Loans
            </button>
          </div>
          
          {/* Transaction success message */}
          {transactionData && (
            <section className="transaction-details">
              <h2>
                {lastAction === 'create' ? 'Loan Created' : 
                lastAction === 'fund' ? 'Loan Funded' : 
                'Loan Repaid'} Successfully!
              </h2>
              <div className="transaction-grid">
                <div className="transaction-item">
                  <span className="label">Transaction Hash:</span>
                  <span className="value">{transactionData.hash}</span>
                </div>
                <div className="transaction-item">
                  <span className="label">Block Number:</span>
                  <span className="value">{transactionData.blockNumber}</span>
                </div>
                <div className="transaction-item">
                  <span className="label">From:</span>
                  <span className="value">{transactionData.from}</span>
                </div>
                <div className="transaction-item">
                  <span className="label">To:</span>
                  <span className="value">{transactionData.to}</span>
                </div>
                <div className="transaction-item">
                  <span className="label">Gas Used:</span>
                  <span className="value">{transactionData.gasUsed}</span>
                </div>
              </div>
              <div className="explorer-link">
                <a 
                  href={`https://sepolia.etherscan.io/tx/${transactionData.hash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  View on Etherscan
                </a>
                <button 
                  className="clear-tx-button" 
                  onClick={() => setTransactionData(null)}
                >
                  Dismiss
                </button>
              </div>
            </section>
          )}
          
          {/* Loading indicator */}
          {isLoadingLoans && (
            <div className="loading">Loading loans...</div>
          )}
          
          {/* Tab content */}
          {!isLoadingLoans && (
            <>
              {activeTab === 'create' && (
                <>
                  <section className="user-guide">
                    <h2>Create a New Loan Request</h2>
                    <ol>
                      <li>Enter the loan details including amount, interest rate, and duration.</li>
                      <li>Click "Create Loan" to submit your loan request to the blockchain.</li>
                      <li>After creation, you'll be able to see your loan in the "My Loans" tab.</li>
                    </ol>
                  </section>
                  <form onSubmit={createLoan} className="loan-form">
                    <h2>Create a Loan</h2>
                    <input
                      type="number"
                      placeholder="Amount (ETH)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Interest Rate (%)"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Duration (days)"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                    />
                    <button 
                      type="submit" 
                      className="submit-button"
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Create Loan"}
                    </button>
                  </form>
                </>
              )}
              
              {activeTab === 'myloans' && (
                <MyLoans 
                  loans={loans}
                  address={account}
                />
              )}
              
              {activeTab === 'pool' && (
                <LoanPool 
                  loans={loans}
                  contract={contract}
                  address={account}
                  onTransactionComplete={handleTransactionComplete}
                />
              )}
              
              {activeTab === 'active' && (
                <ActiveLoans 
                  loans={loans}
                  contract={contract}
                  address={account}
                  onTransactionComplete={handleTransactionComplete}
                />
              )}
            </>
          )}
        </>
      ) : (
        <div className="welcome-message">
          <h2>Welcome to DeFi Lending Platform</h2>
          <p>Please connect your wallet to use the application.</p>
        </div>
      )}
    </div>
  );
}

export default App; 