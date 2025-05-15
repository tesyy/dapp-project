// src/App.js
import React, { useState } from 'react';
import { connectWallet } from './ethereum';

function App() {
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [duration, setDuration] = useState('');
  const [loanDetails, setLoanDetails] = useState(null);

  const handleConnectWallet = async () => {
    const { address } = await connectWallet();
    if (address) {
      setAccount(address);
    }
  };

  const createLoan = (e) => {
    e.preventDefault();
    console.log('Creating loan:', { amount, interestRate, duration });
    // Simulate loan creation and set loan details
    const loanInfo = {
      amount,
      interestRate,
      duration,
      contractAddress: '0x1234567890abcdef', // Example contract address
    };
    setLoanDetails(loanInfo);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>DeFi Lending Platform</h1>
        <button onClick={handleConnectWallet} className="connect-button">
          {account ? `Connected: ${account}` : 'Connect Wallet'}
        </button>
      </header>
      <section className="user-guide">
        <h2>How to Use</h2>
        <ol>
          <li>Connect your Ethereum wallet using the "Connect Wallet" button.</li>
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
    </div>
  );
}

export default App;