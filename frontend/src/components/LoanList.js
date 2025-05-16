import React, { useState } from 'react';
import { fundLoan, repayLoan, calculateRepaymentAmount } from '../ethereum';

const LoanList = ({ loans, contract, address, onTransactionComplete }) => {
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState('');
  const [repaymentDetails, setRepaymentDetails] = useState(null);
  const [repaymentLoanId, setRepaymentLoanId] = useState(null);
  
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
  
  // Function to check if addresses are equal (case-insensitive)
  const isSameAddress = (addr1, addr2) => {
    if (!addr1 || !addr2) return false;
    return addr1.toLowerCase() === addr2.toLowerCase();
  };
  
  const canFund = (loan) => {
    // Loans can be funded if:
    // 1. The loan has no lender (address is zero)
    // 2. The current user is not the borrower
    // 3. The loan is not repaid
    const hasNoLender = loan.lender === '0x0000000000000000000000000000000000000000';
    const isNotBorrower = !isSameAddress(loan.borrower, address);
    return hasNoLender && isNotBorrower && !loan.repaid;
  };
  
  const canRepay = (loan) => {
    // Loans can be repaid if:
    // 1. The current user is the borrower
    // 2. The loan has a lender
    // 3. The loan is not repaid yet
    const isBorrower = isSameAddress(loan.borrower, address);
    const hasLender = loan.lender !== '0x0000000000000000000000000000000000000000';
    return isBorrower && hasLender && !loan.repaid;
  };
  
  // Format a number to 5 decimal places
  const formatNumber = (num) => {
    return parseFloat(num).toFixed(5);
  };
  
  return (
    <div className="loan-list">
      <h2>Available Loans</h2>
      
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
      
      {loans.length === 0 ? (
        <p>No loans available yet.</p>
      ) : (
        <div className="loans-container">
          {loans.map((loan) => (
            <div key={loan.id} className={`loan-card ${loan.repaid ? 'repaid' : ''}`}>
              <h3>Loan #{loan.id}</h3>
              <div className="loan-details">
                <p>
                  <span className="label">Amount:</span> 
                  <span className="value">{loan.amount} ETH</span>
                </p>
                <p>
                  <span className="label">Interest Rate:</span>
                  <span className="value">{loan.interestRate / 100}%</span>
                </p>
                <p>
                  <span className="label">Duration:</span>
                  <span className="value">{loan.duration} days</span>
                </p>
                <p>
                  <span className="label">Borrower:</span>
                  <span className="value">{formatAddress(loan.borrower)}</span>
                </p>
                <p>
                  <span className="label">Lender:</span>
                  <span className="value">{formatAddress(loan.lender)}</span>
                </p>
                <p>
                  <span className="label">Status:</span>
                  <span className={`value status-${loan.repaid ? 'repaid' : (loan.lender === '0x0000000000000000000000000000000000000000' ? 'pending' : 'active')}`}>
                    {loan.repaid 
                      ? 'Repaid' 
                      : loan.lender === '0x0000000000000000000000000000000000000000'
                        ? 'Awaiting Funding'
                        : 'Active'
                    }
                  </span>
                </p>
                {isSameAddress(loan.borrower, address) && (
                  <p>
                    <span className="label owner-indicator">You are the borrower</span>
                  </p>
                )}
                {isSameAddress(loan.lender, address) && (
                  <p>
                    <span className="label owner-indicator">You are the lender</span>
                  </p>
                )}
              </div>
              
              <div className="loan-actions">
                {canFund(loan) && (
                  <button 
                    onClick={() => handleFundLoan(loan.id)}
                    disabled={processing === loan.id}
                    className="fund-button"
                  >
                    {processing === loan.id ? 'Processing...' : 'Fund Loan'}
                  </button>
                )}
                
                {canRepay(loan) && (
                  <button 
                    onClick={() => calculateRepayment(loan.id)}
                    disabled={processing === loan.id}
                    className="repay-button"
                  >
                    {processing === loan.id ? 'Processing...' : 'Repay Loan'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoanList; 