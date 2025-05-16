// src/App.js
import React, { useState, useEffect } from 'react';
import { connectWallet, getLoans } from './ethereum';
import Header from './components/Header';
import { ethers } from 'ethers';
import LoanList from './components/LoanList';

function App() {
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [duration, setDuration] = useState('');
  const [loanDetails, setLoanDetails] = useState(null);
  const [contract, setContract] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState('');
  const [blockDetails, setBlockDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loans, setLoans] = useState([]);
  const [isLoadingLoans, setIsLoadingLoans] = useState(false);
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'pool'
  const [showNetworkGuide, setShowNetworkGuide] = useState(false);
  const [networkError, setNetworkError] = useState('');

  // Check if already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            
            // Get contract instance
            const connection = await connectWallet();
            if (connection.contract) {
              setContract(connection.contract);
            } else if (connection.error) {
              setNetworkError(connection.error);
              setShowNetworkGuide(true);
            }
          }
        } catch (error) {
          console.error("Error checking connection:", error);
          setNetworkError(error.message || "Failed to connect");
          setShowNetworkGuide(true);
        }
      }
    };
    
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          setAccount('');
          setIsConnected(false);
        }
      });
    }
  }, []);

  // Load loans when contract is available
  useEffect(() => {
    if (contract && isConnected) {
      fetchLoans();
    }
  }, [contract, isConnected]);

  const fetchLoans = async () => {
    setIsLoadingLoans(true);
    try {
      // Check if contract is valid before fetching loans
      if (!contract) {
        console.error("Contract is not connected");
        setTransactionStatus("Error: Please make sure your wallet is connected to the correct network");
        setNetworkError("Contract is not connected. Please make sure you're on the correct network.");
        setShowNetworkGuide(true);
        setIsLoadingLoans(false);
        return;
      }

      const result = await getLoans(contract);
      if (result.success) {
        setLoans(result.loans);
        // Clear any previous error messages
        if (transactionStatus && transactionStatus.includes("Error")) {
          setTransactionStatus('');
        }
      } else {
        setTransactionStatus(`Error loading loans: ${result.error}`);
        setNetworkError(result.error);
        setShowNetworkGuide(true);
      }
    } catch (error) {
      console.error("Error fetching loans:", error);
      setTransactionStatus(`Error: ${error.message || "Failed to load loans"}`);
      setNetworkError(error.message || "Failed to load loans");
      setShowNetworkGuide(true);
    } finally {
      setIsLoadingLoans(false);
    }
  };

  const handleConnectWallet = async () => {
    const connection = await connectWallet();
    if (connection.error) {
      setTransactionStatus(`Error: ${connection.error}`);
      setNetworkError(connection.error);
      setShowNetworkGuide(true);
      return;
    }
    
    if (connection.address) {
      setAccount(connection.address);
      setIsConnected(true);
      
      // Validate contract
      if (connection.contract) {
        try {
          // Try to get the contract address to validate it
          const contractAddress = await connection.contract.getAddress();
          console.log(`Connected to contract at ${contractAddress}`);
          setContract(connection.contract);
        } catch (error) {
          console.error("Error validating contract:", error);
          setTransactionStatus("Error: Could not connect to the smart contract. Please check your network connection.");
          setNetworkError("Could not connect to the smart contract");
          setShowNetworkGuide(true);
        }
      } else {
        setTransactionStatus("Error: Could not establish contract connection");
        setNetworkError("Could not establish contract connection");
        setShowNetworkGuide(true);
      }
    } else {
      setTransactionStatus("Error: Could not connect to wallet");
      setNetworkError("Could not connect to wallet");
      setShowNetworkGuide(true);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const createLoan = async (e) => {
    e.preventDefault();
    console.log('Creating loan:', { amount, interestRate, duration });
    
    try {
      // Validate contract connection first
      if (!contract) {
        setTransactionStatus("Error: Smart contract not connected. Please check your network.");
        setNetworkError("Smart contract not connected");
        setShowNetworkGuide(true);
        return;
      }
      
      setIsLoading(true);
      setTransactionStatus('Sending transaction to blockchain...');
      
      // Log contract info for debugging
      try {
        const contractAddress = await contract.getAddress();
        console.log(`Using contract at address: ${contractAddress} for loan creation`);
        console.log("Available contract methods:", Object.keys(contract.interface.fragments).join(", "));
      } catch (err) {
        console.error("Error getting contract info:", err);
      }
      
      // Convert values to appropriate formats for the contract
      const amountInWei = ethers.parseEther(amount.toString());
      // Convert interest rate from decimal to whole number (e.g., 0.1% -> 10)
      const interestRateValue = Math.round(parseFloat(interestRate) * 100);
      const durationInDays = parseInt(duration);
      
      // For simplicity, using zero address for token address
      // In a real application, you would use the actual token address
      const tokenAddress = "0x0000000000000000000000000000000000000000";
      
      console.log("Preparing to call createLoan with params:", {
        tokenAddress,
        amountInWei: amountInWei.toString(),
        interestRateValue,
        durationInDays,
        collateralized: false
      });
      
      // Call createLoan function on the smart contract
      const tx = await contract.createLoan(
        tokenAddress, 
        amountInWei, 
        interestRateValue, 
        durationInDays, 
        false // not collateralized for this example
      );
      
      console.log("Transaction sent:", tx);
      setTransactionStatus('Transaction submitted! Waiting for confirmation...');
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);
      
      // Look for loan created event
      const loanCreatedEvent = receipt.logs
        .map(log => {
          try {
            return contract.interface.parseLog({
              topics: log.topics,
              data: log.data
            });
          } catch (e) {
            console.warn("Failed to parse log:", e);
            return null;
          }
        })
        .filter(parsedLog => parsedLog && parsedLog.name === 'LoanCreated');
      
      if (loanCreatedEvent && loanCreatedEvent.length > 0) {
        console.log("LoanCreated event found:", loanCreatedEvent[0]);
        // If you have the loan ID from the event, you can log it
        if (loanCreatedEvent[0].args.loanId) {
          console.log("New loan ID:", loanCreatedEvent[0].args.loanId.toString());
        }
      } else {
        console.log("No LoanCreated event found in transaction logs");
      }
      
      // Get block details
      const provider = new ethers.BrowserProvider(window.ethereum);
      const block = await provider.getBlock(receipt.blockNumber);
      
      // Get transaction hash and block details
      const blockInfo = {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        blockHash: block.hash,
        timestamp: new Date(block.timestamp * 1000).toLocaleString(),
        gasUsed: receipt.gasUsed.toString()
      };
      
      // Set block details to display to user
      setBlockDetails(blockInfo);
      
      // Set loan details for display
      const loanInfo = {
        amount,
        interestRate,
        duration,
        contractAddress: await contract.getAddress()
      };
      setLoanDetails(loanInfo);
      
      setTransactionStatus('Loan created successfully!');
      setIsLoading(false);
      
      // Refresh the loan list with a small delay
      setTimeout(async () => {
        await fetchLoans();
        
        // Check if loans were found
        if (loans.length === 0) {
          console.log("No loans found after creation - there might be a problem with the contract interface");
        }
        
        // Automatically switch to loan pool after successful creation
        setActiveTab('pool');
      }, 2000); // Wait 2 seconds to allow user to see success message
      
    } catch (error) {
      console.error("Error creating loan:", error);
      setTransactionStatus(`Error: ${error.message || "Transaction failed"}`);
      setIsLoading(false);
      
      // Check if it's a contract-related error
      if (error.message && (
        error.message.includes("contract") || 
        error.message.includes("network") ||
        error.message.includes("chain")
      )) {
        setNetworkError(error.message);
        setShowNetworkGuide(true);
      }
    }
  };

  const handleTransactionComplete = async (result, type) => {
    // Display the transaction result
    setBlockDetails({
      transactionHash: result.transactionHash,
      blockNumber: result.blockNumber,
      blockHash: result.blockHash,
      timestamp: result.timestamp,
      gasUsed: result.gasUsed
    });
    
    setTransactionStatus(`${type === 'fund' ? 'Loan funded' : 'Loan repaid'} successfully!`);
    
    // Refresh loans after transaction
    await fetchLoans();
  };
  
  // Close network guide modal
  const closeNetworkGuide = () => {
    setShowNetworkGuide(false);
  };

  // Add disconnect wallet functionality
  const handleDisconnectWallet = () => {
    // Reset app state
    setAccount('');
    setIsConnected(false);
    setContract(null);
    setLoanDetails(null);
    setBlockDetails(null);
    setTransactionStatus('');
    setLoans([]);
    
    // Note: MetaMask doesn't have a true "disconnect" method via its API
    // We can only clear our app's state, MetaMask still shows as connected
    console.log("Wallet disconnected from application");
    
    // Provide user feedback
    alert("Wallet disconnected from application. You may need to also disconnect in your MetaMask extension if desired.");
  };

  // Tab switching
  const renderContent = () => {
    if (activeTab === 'create') {
      return (
        <>
          <section className="user-guide">
            <h2>How to Create a Loan</h2>
            <ol>
              <li>Enter the loan details including amount, interest rate, and duration.</li>
              <li>Click "Create Loan" to submit your loan request to the blockchain.</li>
              <li>View the loan details and transaction information once the loan is created.</li>
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
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Create Loan'}
            </button>
          </form>
          
          {loanDetails && (
            <section className="loan-details">
              <h2>Loan Details</h2>
              <p>Amount: {loanDetails.amount} ETH</p>
              <p>Interest Rate: {loanDetails.interestRate}%</p>
              <p>Duration: {loanDetails.duration} days</p>
              <p>Contract Address: {loanDetails.contractAddress}</p>
            </section>
          )}
        </>
      );
    } else if (activeTab === 'pool') {
      return (
        <>
          <section className="user-guide">
            <h2>How to Fund a Loan</h2>
            <ol>
              <li>Browse the available loans in the loan pool.</li>
              <li>Click "Fund Loan" on a loan you'd like to fund.</li>
              <li>Confirm the transaction in your wallet.</li>
              <li>The loan status will be updated after the transaction is confirmed.</li>
            </ol>
            <div className="refresh-container">
              <button 
                className="refresh-button" 
                onClick={fetchLoans}
                disabled={isLoadingLoans}
              >
                {isLoadingLoans ? 'Refreshing...' : 'Refresh Loan Pool'}
              </button>
            </div>
          </section>
          {isLoadingLoans ? (
            <div className="loading-message">Loading loans from the blockchain...</div>
          ) : (
            loans.length > 0 ? (
              <LoanList 
                loans={loans} 
                contract={contract} 
                address={account}
                onTransactionComplete={handleTransactionComplete}
              />
            ) : (
              <div className="empty-loans">
                <p>No loans available. Be the first to create a loan!</p>
                <button 
                  className="tab-action-button"
                  onClick={() => setActiveTab('create')}
                >
                  Create a Loan
                </button>
              </div>
            )
          )}
        </>
      );
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>DeFi Lending Platform</h1>
        <div className="wallet-controls">
          {isConnected ? (
            <div className="connection-status">
              <span className="connected-address">
                Connected: {formatAddress(account)}
              </span>
              <button onClick={handleDisconnectWallet} className="disconnect-button">
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={handleConnectWallet} className="connect-button">
              Connect Wallet
            </button>
          )}
        </div>
      </header>
      
      {isConnected ? (
        <>
          <nav className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              Create Loan
            </button>
            <button 
              className={`tab-button ${activeTab === 'pool' ? 'active' : ''}`}
              onClick={() => setActiveTab('pool')}
            >
              Loan Pool
            </button>
          </nav>
          
          {transactionStatus && (
            <div className={`transaction-status ${transactionStatus.includes('Error') ? 'error' : ''}`}>
              {transactionStatus}
            </div>
          )}
          
          {renderContent()}
          
          {blockDetails && (
            <section className="block-details">
              <h2>Transaction Details</h2>
              <p>Transaction Hash: {blockDetails.transactionHash}</p>
              <p>Block Number: {blockDetails.blockNumber}</p>
              <p>Block Hash: {blockDetails.blockHash}</p>
              <p>Timestamp: {blockDetails.timestamp}</p>
              <p>Gas Used: {blockDetails.gasUsed}</p>
            </section>
          )}
        </>
      ) : (
        <div className="welcome-message">
          <h2>Welcome to DeFi Lending Platform</h2>
          <p>Please connect your wallet to use the application.</p>
        </div>
      )}
      
      {/* Network Guide Modal */}
      {showNetworkGuide && (
        <div className="network-guide-modal">
          <div className="network-guide-content">
            <h2>Connection Troubleshooting</h2>
            <p className="error-message">{networkError}</p>
            
            <div className="guide-section">
              <h3>Ensure you are on the correct network</h3>
              <p>This DApp is configured to work with:</p>
              <ul>
                <li>Hardhat Local Network (Chain ID: 31337)</li>
                {/* Add other supported networks as needed */}
              </ul>
            </div>
            
            <div className="guide-section">
              <h3>Local Development Setup</h3>
              <ol>
                <li>Ensure your Hardhat node is running: <code>npx hardhat node</code></li>
                <li>Deploy the contract: <code>npx hardhat run scripts/deploy.js --network localhost</code></li>
                <li>Connect MetaMask to localhost:8545 (Chain ID: 31337)</li>
                <li>Import a Hardhat account into MetaMask using the private key</li>
              </ol>
            </div>
            
            <div className="guide-section">
              <h3>Common Issues</h3>
              <ul>
                <li><strong>Contract not found:</strong> Make sure the contract is deployed to the network you're connected to</li>
                <li><strong>Wrong network:</strong> Switch to the correct network in MetaMask</li>
                <li><strong>MetaMask error:</strong> Reset your MetaMask account (Settings → Advanced → Reset Account)</li>
              </ul>
            </div>
            
            <button onClick={closeNetworkGuide} className="close-button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;