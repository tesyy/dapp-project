// src/App.js
import React, { useState, useEffect } from 'react';
import { connectWallet } from './ethereum';
import Header from './components/Header';

function App() {
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [duration, setDuration] = useState('');
  const [loanDetails, setLoanDetails] = useState(null);
  const [contract, setContract] = useState(null);

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
            }
          }
        } catch (error) {
          console.error("Error checking connection:", error);
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

  const handleConnectWallet = async () => {
    const connection = await connectWallet();
    if (connection.address) {
      setAccount(connection.address);
      setIsConnected(true);
      setContract(connection.contract);
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
      // Use the actual contract instance
      const contractAddress = await contract.getAddress();
      
      // Simulate loan creation and set loan details
      const loanInfo = {
        amount,
        interestRate,
        duration,
        contractAddress
      };
      setLoanDetails(loanInfo);
      
      // You would actually call the contract here:
      // await contract.createLoan(...) 
    } catch (error) {
      console.error("Error creating loan:", error);
      alert("Error creating loan. Check console for details.");
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>DeFi Lending Platform</h1>
        <button onClick={handleConnectWallet} className="connect-button">
          {isConnected 
            ? `Connected: ${formatAddress(account)}` 
            : 'Connect Wallet'}
        </button>
      </header>
      
      {isConnected ? (
        <>
          <section className="user-guide">
            <h2>How to Use</h2>
            <ol>
              <li>Enter the loan details including amount, interest rate, and duration.</li>
              <li>Click "Create Loan" to submit your loan request to the blockchain.</li>
              <li>View the loan details and smart contract address once the loan is created.</li>
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
            <button type="submit" className="submit-button">Create Loan</button>
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