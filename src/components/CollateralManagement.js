import React, { useState, useEffect } from 'react';
import { depositCollateral, withdrawCollateral, getCollateralBalance } from '../ethereum';

const CollateralManagement = ({ contract, address, onTransactionComplete }) => {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [collateralBalance, setCollateralBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [action, setAction] = useState(''); // 'deposit' or 'withdraw'
  
  useEffect(() => {
    if (contract && address) {
      fetchCollateralBalance();
    }
  }, [contract, address]);
  
  const fetchCollateralBalance = async () => {
    try {
      const result = await getCollateralBalance(contract, address);
      
      if (result.success) {
        setCollateralBalance(result.balance);
      } else {
        console.error("Error fetching collateral balance:", result.error);
      }
    } catch (error) {
      console.error("Failed to fetch collateral balance:", error);
    }
  };
  
  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid deposit amount');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      setAction('deposit');
      
      const result = await depositCollateral(contract, depositAmount);
      
      if (result.success) {
        setDepositAmount('');
        fetchCollateralBalance();
        onTransactionComplete(result, 'deposit-collateral');
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Error depositing collateral:", error);
      setError(error.message || 'Failed to deposit collateral');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError('Please enter a valid withdrawal amount');
      return;
    }
    
    if (parseFloat(withdrawAmount) > parseFloat(collateralBalance)) {
      setError('Cannot withdraw more than your collateral balance');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      setAction('withdraw');
      
      const result = await withdrawCollateral(contract, withdrawAmount);
      
      if (result.success) {
        setWithdrawAmount('');
        fetchCollateralBalance();
        onTransactionComplete(result, 'withdraw-collateral');
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Error withdrawing collateral:", error);
      setError(error.message || 'Failed to withdraw collateral');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="collateral-management">
      <h2>Collateral Management</h2>
      <div className="collateral-info">
        <h3>Your Collateral Balance</h3>
        <p className="balance">{collateralBalance} ETH</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="collateral-actions">
        <div className="collateral-action">
          <h3>Deposit Collateral</h3>
          <p>Deposit ETH as collateral to secure loans</p>
          <form onSubmit={handleDeposit}>
            <input
              type="number"
              step="0.01"
              placeholder="Amount in ETH"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              disabled={isLoading && action === 'deposit'}
              required
            />
            <button 
              type="submit" 
              className="deposit-button"
              disabled={isLoading && action === 'deposit'}
            >
              {isLoading && action === 'deposit' ? 'Processing...' : 'Deposit'}
            </button>
          </form>
        </div>
        
        <div className="collateral-action">
          <h3>Withdraw Collateral</h3>
          <p>Withdraw ETH from your collateral balance</p>
          <form onSubmit={handleWithdraw}>
            <input
              type="number"
              step="0.01"
              placeholder="Amount in ETH"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              disabled={isLoading && action === 'withdraw'}
              required
            />
            <button 
              type="submit" 
              className="withdraw-button"
              disabled={isLoading && action === 'withdraw' || parseFloat(collateralBalance) <= 0}
            >
              {isLoading && action === 'withdraw' ? 'Processing...' : 'Withdraw'}
            </button>
          </form>
        </div>
      </div>
      
      <div className="collateral-guide">
        <h3>About Collateral</h3>
        <ul>
          <li>Collateral is required for secured loans</li>
          <li>You can create secured loans with lower interest rates</li>
          <li>Your collateral is locked until the loan is repaid</li>
          <li>If you default on a loan, your collateral may be seized</li>
        </ul>
      </div>
    </div>
  );
};

export default CollateralManagement; 