import React, { useState } from 'react';
import { calculateRepaymentAmount, repayLoan } from '../ethereum';

const ActiveLoans = ({ loans, contract, address, onTransactionComplete }) => {
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState('');
  const [repaymentDetails, setRepaymentDetails] = useState(null);
  const [repaymentLoanId, setRepaymentLoanId] = useState(null);
  
  // Filter loans that can be repaid by the current user
  const activeLoans = loans.filter(loan =>
    !loan.repaid &&
    loan.borrower.toLowerCase() === address.toLowerCase() &&
    loan.lender !== '0x0000000000000000000000000000000000000000'
  );
  
  const calculateRepayment = async (loanId) => {
    if (!contract) return;
    
    try {
      setProcessing(loanId);
      setError('');
      
      console.log(`Calculating repayment for loan ${loanId}`);
      const result = await calculateRepaymentAmount(contract, loanId);
      console.log("Calculation result:", result);
      
      if (result.success) {
        setRepaymentDetails(result);
        setRepaymentLoanId(loanId);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Error calculating repayment:", err);
      setError(err.message || 'Failed to calculate repayment');
    } finally {
      setProcessing(null);
    }
  };
  
  const confirmRepayLoan = async () => {
    if (!contract || !repaymentLoanId) return;
    
    try {
      setProcessing(repaymentLoanId);
      setError('');
      
      console.log(`Confirming repayment for loan ${repaymentLoanId}`);
      const result = await repayLoan(contract, repaymentLoanId);
      console.log("Repay result:", result);
      
      if (result.success) {
        onTransactionComplete(result, 'repay');
        // Clear repayment details after successful repayment
        setRepaymentDetails(null);
        setRepaymentLoanId(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Error in confirmRepayLoan:", err);
      setError(err.message || 'Failed to repay loan');
    } finally {
      setProcessing(null);
    }
  };
  
  const cancelRepayment = () => {
    setRepaymentDetails(null);
    setRepaymentLoanId(null);
    setError('');
  };
  
  const formatAddress = (address) => {
    if (!address || address === '0x0000000000000000000000000000000000000000') return 'None';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const formatNumber = (num) => {
    return parseFloat(num).toFixed(5);
  };
  
  return (
    <div className="active-loans">
      <h2>Active Loans to Repay</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {repaymentDetails && (
        <div className="repayment-modal">
          <div className="repayment-modal-content">
            <h3>Confirm Loan Repayment</h3>
            <div className="repayment-details">
              <p>You are about to repay loan #{repaymentLoanId}</p>
              
              <div className="repayment-summary">
                <div className="repayment-row">
                  <span className="label">Principal:</span>
                  <span className="value">{formatNumber(repaymentDetails.principal)} ETH</span>
                </div>
                <div className="repayment-row">
                  <span className="label">Interest ({repaymentDetails.interestRate / 100}%):</span>
                  <span className="value">{formatNumber(repaymentDetails.interest)} ETH</span>
                </div>
                <div className="repayment-row total">
                  <span className="label">Total Repayment:</span>
                  <span className="value">{formatNumber(repaymentDetails.total)} ETH</span>
                </div>
              </div>
              
              <div className="repayment-actions">
                <button
                  onClick={confirmRepayLoan}
                  disabled={processing === repaymentLoanId}
                  className="repay-button confirm"
                >
                  {processing === repaymentLoanId ? 'Processing...' : 'Confirm Repayment'}
                </button>
                <button
                  onClick={cancelRepayment}
                  className="cancel-button"
                  disabled={processing === repaymentLoanId}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeLoans.length === 0 ? (
        <p>You don't have any active loans to repay.</p>
      ) : (
        <div className="loans-container">
          {activeLoans.map((loan) => (
            <div key={loan.id} className="loan-card active">
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
                  <span className="label">Lender:</span>
                  <span className="value">{formatAddress(loan.lender)}</span>
                </p>
                <p>
                  <span className="label">Start Time:</span>
                  <span className="value">
                    {loan.startTime !== '0' ? new Date(loan.startTime * 1000).toLocaleString() : 'Not started'}
                  </span>
                </p>
              </div>
              
              <div className="loan-actions">
                <button
                  onClick={() => calculateRepayment(loan.id)}
                  disabled={processing === loan.id}
                  className="repay-button"
                >
                  {processing === loan.id ? 'Processing...' : 'Repay Loan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveLoans; 