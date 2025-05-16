import React, { useState } from 'react';
import { fundLoan } from '../ethereum';

const LoanPool = ({ loans, contract, address, onTransactionComplete }) => {
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState('');
  
  // Filter loans that can be funded
  const availableLoans = loans.filter(loan => 
    !loan.repaid && 
    loan.lender === '0x0000000000000000000000000000000000000000' &&
    loan.borrower.toLowerCase() !== address.toLowerCase()
  );
  
  const handleFundLoan = async (loanId) => {
    if (!contract) return;
    
    try {
      setProcessing(loanId);
      setError('');
      
      console.log(`Attempting to fund loan ${loanId}`);
      const result = await fundLoan(contract, loanId);
      console.log("Fund result:", result);
      
      if (result.success) {
        onTransactionComplete(result, 'fund');
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Error in handleFundLoan:", err);
      setError(err.message || 'Failed to fund loan');
    } finally {
      setProcessing(null);
    }
  };

  const formatAddress = (address) => {
    if (!address || address === '0x0000000000000000000000000000000000000000') return 'None';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const formatNumber = (num) => {
    return parseFloat(num).toFixed(5);
  };

  return (
    <div className="loan-pool">
      <h2>Loan Pool</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {availableLoans.length === 0 ? (
        <p>No loans available for funding at the moment.</p>
      ) : (
        <div className="loans-container">
          {availableLoans.map((loan) => (
            <div key={loan.id} className="loan-card available">
              <h3>Loan #{loan.id}</h3>
              <div className="loan-details">
                <p>
                  <span className="label">Amount:</span> 
                  <span className="value">{formatNumber(loan.amount)} ETH</span>
                </p>
                <p>
                  <span className="label">Interest Rate:</span>
                  <span className="value">{loan.interestRate / 100}%</span>
                </p>
                <p>
                  <span className="label">Duration:</span>
                  <span className="value">{loan.duration / 86400} days</span>
                </p>
                <p>
                  <span className="label">Borrower:</span>
                  <span className="value">{formatAddress(loan.borrower)}</span>
                </p>
              </div>
              
              <div className="loan-actions">
                <button
                  onClick={() => handleFundLoan(loan.id)}
                  disabled={processing === loan.id}
                  className="fund-button"
                >
                  {processing === loan.id ? 'Processing...' : 'Fund Loan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoanPool; 