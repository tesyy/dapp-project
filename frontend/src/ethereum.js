// src/ethereum.js
import { ethers } from 'ethers';

// Use our lending contract ABI
const contractABI = [
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "CollateralDeposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "CollateralWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "interestRate",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "collateralized",
        "type": "bool"
      }
    ],
    "name": "LoanCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "lender",
        "type": "address"
      }
    ],
    "name": "LoanFunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      }
    ],
    "name": "LoanRepaid",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_loanId",
        "type": "uint256"
      }
    ],
    "name": "calculateRepayment",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "collateral",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_tokenAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_interestRate",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_duration",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "_collateralized",
        "type": "bool"
      }
    ],
    "name": "createLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "depositCollateral",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_loanId",
        "type": "uint256"
      }
    ],
    "name": "fundLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "loanCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "loans",
    "outputs": [
      {
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "lender",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "interestRate",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "collateralized",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "repaid",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_loanId",
        "type": "uint256"
      }
    ],
    "name": "repayLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "withdrawCollateral",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Replace with your deployed contract address
// Default is the Hardhat local deployment address
let contractAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

// For different networks, we can set these dynamically
const CONTRACT_ADDRESSES = {
  // Hardhat local
  '31337': '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  // Add other networks as needed
  // '1': '0x...', // Ethereum Mainnet
  // '5': '0x...', // Goerli Testnet
  // '11155111': '0x...', // Sepolia Testnet
};

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      // Get network ID to determine which contract address to use
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const networkId = parseInt(chainId, 16).toString();
      console.log(`Connected to network ID: ${networkId}`);
      
      // Get the appropriate contract address for this network
      if (CONTRACT_ADDRESSES[networkId]) {
        contractAddress = CONTRACT_ADDRESSES[networkId];
        console.log(`Using contract address for network ${networkId}: ${contractAddress}`);
      } else {
        console.warn(`No contract address configured for network ID ${networkId}, using default`);
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create contract instance with verbose error handling
      try {
        console.log(`Creating contract instance at address: ${contractAddress}`);
        console.log(`Contract ABI length: ${contractABI.length} items`);
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        
        // Check if contract was created successfully
        if (!contract) {
          throw new Error("Failed to create contract instance");
        }
        
        console.log("Contract instance created successfully");
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          window.location.reload();
        });
        
        // Listen for network changes
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
        
        return { provider, signer, contract, address };
      } catch (contractError) {
        console.error("Error creating contract instance:", contractError);
        return { error: contractError.message || "Failed to create contract instance" };
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      return { error: error.message || "Failed to connect to wallet" };
    }
  } else {
    console.error("MetaMask not installed");
    return { error: "MetaMask not installed. Please install MetaMask to use this dApp!" };
  }
};

export const updateContractAddress = (address) => {
  contractAddress = address;
};

// Function to get all loans from the contract
export const getLoans = async (contract) => {
  try {
    // First check if contract is valid
    if (!contract) {
      console.error("Contract instance is not valid");
      return { success: false, error: "Contract not connected", loans: [] };
    }

    // Get the contract address and log for debugging
    try {
      const address = await contract.getAddress();
      console.log(`Using contract at address: ${address}`);
      
      // Safety check for contract interface
      try {
        // Log available contract methods for debugging (with safety checks)
        if (contract.interface) {
          const functions = contract.interface.functions 
            ? Object.keys(contract.interface.functions) 
            : (contract.interface.fragments 
                ? Object.keys(contract.interface.fragments) 
                : []);
          console.log("Available contract methods:", functions);
        } else {
          console.log("Contract interface not available for inspection");
        }
      } catch (error) {
        console.log("Could not inspect contract interface:", error.message);
      }
    } catch (error) {
      console.error("Error getting contract address:", error);
      return { success: false, error: "Invalid contract address", loans: [] };
    }

    // Skip loanCount and go straight to linear search, which is more reliable
    console.log("Using linear search to find loans...");
    return await findLoansLinearSearch(contract);
  } catch (error) {
    console.error("Error getting loans:", error);
    return { success: false, error: error.message || "Failed to fetch loans", loans: [] };
  }
};

// Helper function to find loans using linear search
async function findLoansLinearSearch(contract) {
  console.log("Performing linear search for up to 20 loans...");
  const loans = [];
  const MAX_LOANS_TO_CHECK = 20;

  for (let i = 0; i < MAX_LOANS_TO_CHECK; i++) {
    try {
      console.log(`Checking index ${i}...`);
      
      // Try to get the loan with extra safety checks
      let loan;
      try {
        loan = await contract.loans(i);
        console.log(`Raw loan data at index ${i}:`, loan);
      } catch (callError) {
        console.log(`Error calling loans(${i}):`, callError.message);
        // If we get a specific decoding error, continue to the next index
        if (callError.message.includes('could not decode result data')) {
          continue;
        }
        // For other errors, break the loop
        break;
      }
      
      // Check if this is a valid loan - using optional chaining for safety
      if (loan && 
          loan.amount !== undefined && 
          !loan.amount?.isZero?.() && 
          loan.borrower !== undefined &&
          loan.borrower !== '0x0000000000000000000000000000000000000000') {
        
        // Extra safety checks when formatting the loan
        try {
          const formattedLoan = {
            id: i,
            borrower: loan.borrower || '0x0000000000000000000000000000000000000000',
            lender: loan.lender || '0x0000000000000000000000000000000000000000',
            tokenAddress: loan.tokenAddress || '0x0000000000000000000000000000000000000000',
            amount: typeof loan.amount?.toString === 'function' 
              ? ethers.formatEther(loan.amount.toString()) 
              : '0',
            interestRate: loan.interestRate?.toString() || '0',
            duration: loan.duration?.toString() || '0',
            startTime: loan.startTime?.toString() || '0',
            collateralized: !!loan.collateralized,
            repaid: !!loan.repaid
          };
          
          loans.push(formattedLoan);
          console.log(`Found valid loan at index ${i}:`, formattedLoan);
        } catch (formatError) {
          console.error(`Error formatting loan ${i}:`, formatError);
        }
      } else {
        console.log(`No valid loan at index ${i}, loan data:`, loan);
      }
    } catch (error) {
      console.log(`Error processing loan at index ${i}:`, error.message);
      // Continue to the next index instead of breaking
      continue;
    }
  }

  console.log(`Linear search found ${loans.length} loans`);
  return { success: true, loans };
}

// Helper function to fetch a single loan
async function fetchLoan(contract, loanId) {
  try {
    console.log(`Trying to fetch loan at index ${loanId}...`);
    
    // Try to get the loan with extra safety
    let loan;
    try {
      loan = await contract.loans(loanId);
    } catch (callError) {
      console.error(`Error calling loans(${loanId}):`, callError.message);
      return null;
    }
    
    // Add validation to ensure this is a real loan
    if (!loan || 
        loan.amount === undefined || 
        (typeof loan.amount.isZero === 'function' && loan.amount.isZero()) ||
        loan.borrower === undefined ||
        loan.borrower === '0x0000000000000000000000000000000000000000') {
      console.log(`No loan found at index ${loanId}, trying next index...`);
      return null;
    }
    
    // Format the loan data for UI with extra safety
    try {
      const formattedLoan = {
        id: loanId,
        borrower: loan.borrower || '0x0000000000000000000000000000000000000000',
        lender: loan.lender || '0x0000000000000000000000000000000000000000',
        tokenAddress: loan.tokenAddress || '0x0000000000000000000000000000000000000000',
        amount: typeof loan.amount.toString === 'function' 
          ? ethers.formatEther(loan.amount.toString()) 
          : '0',
        interestRate: loan.interestRate?.toString() || '0',
        duration: loan.duration?.toString() || '0',
        startTime: loan.startTime?.toString() || '0',
        collateralized: !!loan.collateralized,
        repaid: !!loan.repaid
      };
      
      console.log(`Found valid loan at index ${loanId}:`, formattedLoan);
      return formattedLoan;
    } catch (formatError) {
      console.error(`Error formatting loan ${loanId}:`, formatError);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching loan ${loanId}:`, error);
    return null;
  }
}

// Fund a loan
export const fundLoan = async (contract, loanId) => {
  try {
    console.log(`Funding loan ${loanId}`);
    
    // Call the fundLoan function on the contract
    const tx = await contract.fundLoan(loanId);
    console.log("Fund transaction:", tx);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log("Fund receipt:", receipt);
    
    // Get the block information
    const provider = new ethers.BrowserProvider(window.ethereum);
    const block = await provider.getBlock(receipt.blockNumber);
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      blockHash: block.hash,
      timestamp: new Date(block.timestamp * 1000).toLocaleString(),
      gasUsed: receipt.gasUsed.toString(),
      message: `Successfully funded loan ${loanId}`
    };
  } catch (error) {
    console.error("Error funding loan:", error);
    return { 
      success: false, 
      error: error.message || "Failed to fund loan" 
    };
  }
};

// Calculate repayment amount
export const calculateRepaymentAmount = async (contract, loanId) => {
  try {
    // Get loan details to calculate interest rate
    const loan = await contract.loans(loanId);
    const repaymentWei = await contract.calculateRepayment(loanId);
    
    // Convert from wei to ETH for display
    const total = ethers.formatEther(repaymentWei);
    const principal = ethers.formatEther(loan.amount);
    const interest = parseFloat(total) - parseFloat(principal);
    
    return {
      success: true,
      total,
      principal,
      interest,
      interestRate: loan.interestRate
    };
  } catch (error) {
    console.error("Error calculating repayment:", error);
    return { 
      success: false, 
      error: error.message || "Failed to calculate repayment" 
    };
  }
};

// Repay a loan
export const repayLoan = async (contract, loanId) => {
  try {
    console.log(`Repaying loan ${loanId}`);
    
    // Get the repayment amount first
    const repaymentWei = await contract.calculateRepayment(loanId);
    console.log(`Repayment amount: ${ethers.formatEther(repaymentWei)} ETH`);
    
    // Call the repayLoan function on the contract
    const tx = await contract.repayLoan(loanId);
    console.log("Repay transaction:", tx);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log("Repay receipt:", receipt);
    
    // Get the block information
    const provider = new ethers.BrowserProvider(window.ethereum);
    const block = await provider.getBlock(receipt.blockNumber);
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      blockHash: block.hash,
      timestamp: new Date(block.timestamp * 1000).toLocaleString(),
      gasUsed: receipt.gasUsed.toString(),
      message: `Successfully repaid loan ${loanId}`
    };
  } catch (error) {
    console.error("Error repaying loan:", error);
    return { 
      success: false, 
      error: error.message || "Failed to repay loan" 
    };
  }
};