import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { connectWallet } from './ethereum';
import Header from './components/Header';
import MyLoans from './components/MyLoans';
import LoanPool from './components/LoanPool';
import ActiveLoans from './components/ActiveLoans';
import CollateralManagement from './components/CollateralManagement';
import ContractProxy from './contractProxy';

function App() {
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [duration, setDuration] = useState('');
  const [isCollateralized, setIsCollateralized] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [contract, setContract] = useState(null);
  const [contractProxy, setContractProxy] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loans, setLoans] = useState([]);
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'myloans', 'pool', 'active', 'collateral'
  const [isLoadingLoans, setIsLoadingLoans] = useState(false);
  const [lastAction, setLastAction] = useState(''); // 'create', 'fund', 'repay', 'deposit-collateral', 'withdraw-collateral'
  const [isFallbackMode, setIsFallbackMode] = useState(false); // Track if we're in fallback mode

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
          setContractProxy(null);
          setLoans([]);
        }
      });
      
      // Listen for network changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
    
    // Check if we're in fallback mode
    const fallbackMode = localStorage.getItem('fallbackMode') === 'true';
    if (fallbackMode) {
      setIsFallbackMode(true);
    }
  }, []);

  const loadLoans = async (contractProxyInstance) => {
    try {
      setIsLoadingLoans(true);
      const proxyToUse = contractProxyInstance || contractProxy;
      
      if (!proxyToUse) {
        console.error("No contract proxy instance available to load loans");
        return;
      }
      
      console.log("Getting loans from contract proxy");
      
      // Use the contract proxy to get loans
      const loansList = await proxyToUse.getLoans();
      console.log("Loans loaded:", loansList);
      
      // Check if we got an array (local storage) or a BigInt (contract)
      let loansArray = [];
      
      if (Array.isArray(loansList)) {
        // Already an array from IndexedDB
        loansArray = loansList;
      } else if (typeof loansList === 'bigint') {
        // We got a loanCount from the contract, need to fetch each loan
        const count = Number(loansList);
        console.log(`Got loanCount: ${count} from contract`);
        
        // Implement contract-specific loan retrieval if needed
        // For now just use an empty array as we're assuming fallback mode
        loansArray = [];
      } else {
        console.warn("Unknown format for loans list:", loansList);
        loansArray = [];
      }
      
      // Sort by status and ID
      const sortByStatusAndId = (a, b) => {
        // First sort by status: pending, then active, then repaid
        const getStatusValue = (loan) => {
          if (loan.repaid) return 2; // Repaid (lowest priority)
          if (loan.lender === '0x0000000000000000000000000000000000000000') return 0; // Pending (highest priority)
          return 1; // Active (medium priority)
        };
        
        const statusA = getStatusValue(a);
        const statusB = getStatusValue(b);
        
        if (statusA !== statusB) {
          return statusA - statusB;
        }
        
        // Then sort by ID (most recent first)
        // Handle both number IDs and string IDs
        const idA = typeof a.id === 'string' ? a.timestamp || 0 : parseInt(a.id);
        const idB = typeof b.id === 'string' ? b.timestamp || 0 : parseInt(b.id);
        
        return idB - idA; // Descending (most recent first)
      };
      
      const sortedLoans = [...loansArray].sort(sortByStatusAndId);
      
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
        
        // Initialize contract proxy
        const proxy = new ContractProxy(connection.contract, connection.address);
        setContractProxy(proxy);
        
        // Check if we're in fallback mode
        if (localStorage.getItem('fallbackMode') === 'true') {
          setIsFallbackMode(true);
        }
        
        console.log("Wallet connected successfully:", connection.address);
        
        // Load loans after connecting
        // We pass the new proxy since the state might not be updated yet
        loadLoans(proxy);
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
    setContractProxy(null);
    setLoans([]);
    setTransactionData(null);
    console.log("Wallet disconnected");
    
    // Clear fallback mode when disconnecting
    localStorage.removeItem('fallbackMode');
    localStorage.removeItem('fallbackReason');
    setIsFallbackMode(false);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const createLoan = async (e) => {
    e.preventDefault();
    console.log('Creating loan:', { amount, interestRate, duration, isCollateralized });
    
    try {
      setIsLoading(true);
      setLastAction('create');
      
      // Use zero address for token (represents ETH in the contract)
      const zeroAddress = "0x0000000000000000000000000000000000000000";
      
      // Use contract proxy to create loan
      const result = await contractProxy.createLoan(
        zeroAddress,
        amount.toString(), 
        interestRate.toString(), 
        duration.toString(), 
        isCollateralized
      );
      
      if (result.success) {
        setTransactionData({
          hash: result.hash,
          blockNumber: result.blockNumber,
          from: result.from,
          to: result.to,
          gasUsed: result.gasUsed,
          loanId: result.loanId,
          isLocal: result.isLocal
        });
        
        // Reset form fields
        setAmount('');
        setInterestRate('');
        setDuration('');
        setIsCollateralized(false);
        
        // Reload loans after creating a new one
        await loadLoans(contractProxy);
        
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
    await loadLoans(contractProxy);
  };

  // Get action text based on lastAction
  const getActionText = (action) => {
    switch (action) {
      case 'create':
        return 'Loan Created';
      case 'fund':
        return 'Loan Funded';
      case 'repay':
        return 'Loan Repaid';
      case 'deposit-collateral':
        return 'Collateral Deposited';
      case 'withdraw-collateral':
        return 'Collateral Withdrawn';
      default:
        return 'Transaction Completed';
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>DeFi Lending Platform</h1>
        {isFallbackMode && (
          <div className="fallback-notice">
            <span role="img" aria-label="warning">⚠️</span> Running in local simulation mode
            <button 
              onClick={() => {
                localStorage.removeItem('fallbackMode');
                localStorage.removeItem('fallbackReason');
                setIsFallbackMode(false);
                window.location.reload();
              }}
              className="reset-button"
            >
              Reset
            </button>
          </div>
        )}
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
              onClick={() => { setActiveTab('myloans'); loadLoans(contractProxy); }}
            >
              My Loans
            </button>
            <button 
              className={`tab-button ${activeTab === 'pool' ? 'active' : ''}`}
              onClick={() => { setActiveTab('pool'); loadLoans(contractProxy); }}
            >
              Loan Pool
            </button>
            <button 
              className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => { setActiveTab('active'); loadLoans(contractProxy); }}
            >
              Active Loans
            </button>
            <button 
              className={`tab-button ${activeTab === 'collateral' ? 'active' : ''}`}
              onClick={() => setActiveTab('collateral')}
            >
              Collateral
            </button>
          </div>
          
          {/* Transaction success message */}
          {transactionData && (
            <section className={`transaction-details ${transactionData.isLocal ? 'local-transaction' : ''}`}>
              <h2>
                {getActionText(lastAction)} Successfully!
                {transactionData.isLocal && <span className="simulation-badge">Simulated</span>}
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
                {transactionData.amount && (
                  <div className="transaction-item">
                    <span className="label">Amount:</span>
                    <span className="value">{transactionData.amount} ETH</span>
                  </div>
                )}
              </div>
              <div className="explorer-link">
                {!transactionData.isLocal && (
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${transactionData.hash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View on Etherscan
                  </a>
                )}
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
                      <li>Select whether the loan should be collateralized (requires depositing collateral first).</li>
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
                    <div className="collateral-checkbox">
                      <input
                        id="collateralized"
                        type="checkbox"
                        checked={isCollateralized}
                        onChange={(e) => setIsCollateralized(e.target.checked)}
                      />
                      <label htmlFor="collateralized">Collateralized Loan</label>
                    </div>
                    {isCollateralized && (
                      <p className="collateral-note">
                        Note: You need to deposit collateral in the "Collateral" tab before creating a collateralized loan.
                      </p>
                    )}
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
                  contract={contractProxy}
                  address={account}
                  onTransactionComplete={handleTransactionComplete}
                />
              )}
              
              {activeTab === 'active' && (
                <ActiveLoans 
                  loans={loans}
                  contract={contractProxy}
                  address={account}
                  onTransactionComplete={handleTransactionComplete}
                />
              )}
              
              {activeTab === 'collateral' && (
                <CollateralManagement 
                  contract={contractProxy}
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