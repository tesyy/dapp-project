import { ethers } from 'ethers';
import * as db from './db';

// Constants
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Class to manage both blockchain and local interactions
class ContractProxy {
  constructor(contract, address) {
    this.contract = contract;
    this.userAddress = address;
    this.fallbackMode = false; // Start assuming contract works
    this.fallbackReason = '';
    
    // Check if we're in fallback mode already (from previous session)
    const savedMode = localStorage.getItem('fallbackMode');
    if (savedMode === 'true') {
      this.fallbackMode = true;
      this.fallbackReason = localStorage.getItem('fallbackReason') || 'Unknown reason from previous session';
      console.warn(`Starting in fallback mode: ${this.fallbackReason}`);
    }
  }
  
  // Set fallback mode
  setFallbackMode(reason) {
    this.fallbackMode = true;
    this.fallbackReason = reason;
    localStorage.setItem('fallbackMode', 'true');
    localStorage.setItem('fallbackReason', reason);
    console.warn(`Switched to fallback mode: ${reason}`);
  }
  
  // Try contract call, fall back to local if it fails
  async tryContractCall(method, args, fallbackFn) {
    // If already in fallback mode, don't try contract
    if (this.fallbackMode) {
      console.log(`In fallback mode, skipping contract call to ${method}`);
      return await fallbackFn();
    }
    
    try {
      console.log(`Trying contract call: ${method}`);
      if (!this.contract[method]) {
        this.setFallbackMode(`Method ${method} not found on contract`);
        return await fallbackFn();
      }
      
      const result = await this.contract[method](...args);
      console.log(`Contract call succeeded: ${method}`, result);
      return result;
    } catch (error) {
      console.error(`Contract call failed: ${method}`, error);
      this.setFallbackMode(`${method} call failed: ${error.message}`);
      return await fallbackFn();
    }
  }
  
  // Get all loans
  async getLoans() {
    return this.tryContractCall(
      'loanCount', 
      [], 
      async () => {
        console.log('Using local loans from IndexedDB');
        const localLoans = await db.getAllLoans();
        console.log(`Found ${localLoans.length} local loans`);
        return localLoans;
      }
    );
  }
  
  // Create a loan
  async createLoan(tokenAddress, amount, interestRate, duration, collateralized) {
    // Always store locally, even if contract call succeeds
    const loanId = db.generateId();
    const amountInEther = parseFloat(amount);
    
    const loan = {
      id: loanId,
      borrower: this.userAddress,
      lender: ZERO_ADDRESS,
      tokenAddress: tokenAddress,
      amount: amountInEther.toString(),
      interestRate: interestRate,
      duration: duration,
      startTime: '0',
      collateralized: collateralized,
      repaid: false,
      timestamp: Date.now()
    };
    
    // Try contract call first 
    return this.tryContractCall(
      'createLoan',
      [tokenAddress, ethers.parseEther(amount), parseInt(interestRate), parseInt(duration) * 86400, collateralized],
      async () => {
        console.log('Creating loan locally');
        await db.saveLoan(loan);
        
        // Record the transaction
        await db.recordTransaction({
          loanId: loanId,
          type: 'create',
          from: this.userAddress,
          amount: amountInEther.toString(),
          timestamp: Date.now()
        });
        
        return {
          success: true,
          hash: `local-tx-${Date.now()}`,
          blockNumber: 'local',
          from: this.userAddress,
          to: tokenAddress,
          gasUsed: '0',
          loanId: loanId,
          isLocal: true
        };
      }
    ).then(async (result) => {
      // If contract call succeeded, store with blockchain ID
      if (!this.fallbackMode) {
        try {
          // Extract loanId from events if possible
          let blockchainLoanId = null;
          if (result.logs) {
            for (const log of result.logs) {
              try {
                const parsedLog = this.contract.interface.parseLog({
                  topics: log.topics,
                  data: log.data
                });
                
                if (parsedLog && parsedLog.name === 'LoanCreated') {
                  blockchainLoanId = parsedLog.args[0].toString();
                  break;
                }
              } catch (e) {
                continue;
              }
            }
          }
          
          if (blockchainLoanId) {
            // Store mapping from blockchain ID to local ID
            loan.blockchainId = blockchainLoanId;
            loan.txHash = result.hash;
            await db.saveLoan(loan);
            
            return {
              success: true,
              hash: result.hash,
              blockNumber: result.blockNumber,
              from: result.from,
              to: result.to,
              gasUsed: result.gasUsed?.toString() || '0',
              loanId: loanId
            };
          } else {
            // No blockchain ID found, but transaction succeeded
            // Store the transaction hash
            loan.txHash = result.hash;
            await db.saveLoan(loan);
            
            return {
              success: true,
              hash: result.hash || `local-tx-${Date.now()}`,
              blockNumber: result.blockNumber || 'local',
              from: this.userAddress,
              to: tokenAddress,
              gasUsed: result.gasUsed?.toString() || '0',
              loanId: loanId
            };
          }
        } catch (error) {
          console.error('Error processing contract result:', error);
        }
      }
      
      return result;
    });
  }
  
  // Fund a loan
  async fundLoan(loanId) {
    return this.tryContractCall(
      'fundLoan',
      [loanId],
      async () => {
        console.log('Funding loan locally');
        
        // Get the loan from local storage
        const loan = await db.getLoanById(loanId);
        if (!loan) {
          return {
            success: false,
            error: 'Loan not found'
          };
        }
        
        // Check if loan is already funded or repaid
        if (loan.lender !== ZERO_ADDRESS) {
          return {
            success: false,
            error: 'This loan has already been funded'
          };
        }
        
        if (loan.repaid) {
          return {
            success: false,
            error: 'This loan has already been repaid'
          };
        }
        
        // Update the loan
        loan.lender = this.userAddress;
        loan.startTime = Math.floor(Date.now() / 1000).toString();
        
        // Save the updated loan
        await db.updateLoan(loanId, {
          lender: this.userAddress,
          startTime: Math.floor(Date.now() / 1000).toString()
        });
        
        // Record the transaction
        await db.recordTransaction({
          loanId: loanId,
          type: 'fund',
          from: this.userAddress,
          to: loan.borrower,
          amount: loan.amount,
          timestamp: Date.now()
        });
        
        return {
          success: true,
          hash: `local-tx-${Date.now()}`,
          blockNumber: 'local',
          from: this.userAddress,
          to: loan.borrower,
          gasUsed: '0',
          isLocal: true
        };
      }
    );
  }
  
  // Calculate repayment
  async calculateRepayment(loanId) {
    return this.tryContractCall(
      'calculateRepayment',
      [loanId],
      async () => {
        console.log('Calculating repayment locally');
        
        // Get the loan from local storage
        const loan = await db.getLoanById(loanId);
        if (!loan) {
          return {
            success: false,
            error: 'Loan not found'
          };
        }
        
        // Check if loan is already repaid
        if (loan.repaid) {
          return {
            success: false,
            error: 'Loan already repaid'
          };
        }
        
        // Check if loan has been funded
        if (loan.lender === ZERO_ADDRESS) {
          return {
            success: false,
            error: 'Loan has not been funded yet'
          };
        }
        
        // Calculate repayment amount
        const loanAmount = parseFloat(loan.amount);
        const interestRate = parseFloat(loan.interestRate) / 100;
        const durationSeconds = parseFloat(loan.duration) * 86400;
        const startTime = parseInt(loan.startTime);
        const currentTime = Math.floor(Date.now() / 1000);
        
        // Calculate time elapsed
        const elapsedSeconds = currentTime - startTime;
        const timeRatio = Math.min(elapsedSeconds / durationSeconds, 1);
        
        // Calculate interest
        const interestAmount = loanAmount * interestRate * timeRatio;
        const totalRepayment = loanAmount + interestAmount;
        
        return {
          success: true,
          total: totalRepayment.toFixed(5),
          principal: loanAmount.toFixed(5),
          interest: interestAmount.toFixed(5),
          interestRate: loan.interestRate,
          duration: loan.duration,
          isLocal: true
        };
      }
    );
  }
  
  // Repay a loan
  async repayLoan(loanId) {
    return this.tryContractCall(
      'repayLoan',
      [loanId],
      async () => {
        console.log('Repaying loan locally');
        
        // Get the loan from local storage
        const loan = await db.getLoanById(loanId);
        if (!loan) {
          return {
            success: false,
            error: 'Loan not found'
          };
        }
        
        // Check if loan is already repaid
        if (loan.repaid) {
          return {
            success: false,
            error: 'This loan has already been repaid'
          };
        }
        
        // Check if loan has been funded
        if (loan.lender === ZERO_ADDRESS) {
          return {
            success: false,
            error: 'This loan has not been funded yet'
          };
        }
        
        // Calculate repayment amount
        const repaymentInfo = await this.calculateRepayment(loanId);
        if (!repaymentInfo.success) {
          return repaymentInfo;
        }
        
        // Update the loan
        await db.updateLoan(loanId, {
          repaid: true
        });
        
        // Record the transaction
        await db.recordTransaction({
          loanId: loanId,
          type: 'repay',
          from: this.userAddress,
          to: loan.lender,
          amount: repaymentInfo.total,
          timestamp: Date.now()
        });
        
        return {
          success: true,
          hash: `local-tx-${Date.now()}`,
          blockNumber: 'local',
          from: this.userAddress,
          to: loan.lender,
          gasUsed: '0',
          repaymentAmount: repaymentInfo.total,
          principal: repaymentInfo.principal,
          interest: repaymentInfo.interest,
          interestRate: loan.interestRate,
          duration: loan.duration,
          isLocal: true
        };
      }
    );
  }
  
  // Deposit collateral
  async depositCollateral(amount) {
    // For collateral, we'll keep a balance in local storage
    return this.tryContractCall(
      'depositCollateral',
      [],
      async () => {
        console.log('Depositing collateral locally');
        
        // Get current balance
        let balance = localStorage.getItem('collateralBalance');
        balance = balance ? parseFloat(balance) : 0;
        
        // Add deposit
        const amountToDeposit = parseFloat(amount);
        balance += amountToDeposit;
        
        // Save new balance
        localStorage.setItem('collateralBalance', balance.toString());
        
        // Record the transaction
        await db.recordTransaction({
          type: 'deposit',
          from: this.userAddress,
          amount: amountToDeposit.toString(),
          timestamp: Date.now()
        });
        
        return {
          success: true,
          hash: `local-tx-${Date.now()}`,
          blockNumber: 'local',
          from: this.userAddress,
          gasUsed: '0',
          amount: amount,
          isLocal: true
        };
      }
    );
  }
  
  // Withdraw collateral
  async withdrawCollateral(amount) {
    return this.tryContractCall(
      'withdrawCollateral',
      [ethers.parseEther(amount)],
      async () => {
        console.log('Withdrawing collateral locally');
        
        // Get current balance
        let balance = localStorage.getItem('collateralBalance');
        balance = balance ? parseFloat(balance) : 0;
        
        // Check if enough balance
        const amountToWithdraw = parseFloat(amount);
        if (balance < amountToWithdraw) {
          return {
            success: false,
            error: 'Insufficient collateral balance'
          };
        }
        
        // Subtract withdrawal
        balance -= amountToWithdraw;
        
        // Save new balance
        localStorage.setItem('collateralBalance', balance.toString());
        
        // Record the transaction
        await db.recordTransaction({
          type: 'withdraw',
          from: this.userAddress,
          amount: amountToWithdraw.toString(),
          timestamp: Date.now()
        });
        
        return {
          success: true,
          hash: `local-tx-${Date.now()}`,
          blockNumber: 'local',
          from: this.userAddress,
          gasUsed: '0',
          amount: amount,
          isLocal: true
        };
      }
    );
  }
  
  // Get collateral balance
  async getCollateralBalance() {
    return this.tryContractCall(
      'collateral',
      [this.userAddress],
      async () => {
        console.log('Getting collateral balance locally');
        
        // Get current balance
        let balance = localStorage.getItem('collateralBalance');
        balance = balance ? parseFloat(balance) : 0;
        
        return {
          success: true,
          balance: balance.toString(),
          isLocal: true
        };
      }
    );
  }
}

export default ContractProxy; 