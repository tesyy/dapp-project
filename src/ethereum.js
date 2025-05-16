import { ethers } from 'ethers';

// Get Ethereum provider, handling different browser environments
// Only detects if provider exists, doesn't connect
const getEthereumProvider = () => {
  if (window.ethereum) {
    console.log("MetaMask detected (not connected)");
    return window.ethereum;
  } 
  
  // For mobile browsers that inject ethereum differently
  if (window.web3 && window.web3.currentProvider) {
    console.log("Legacy web3 provider detected (not connected)");
    return window.web3.currentProvider;
  }
  
  return null;
};

// Export for testability but don't use directly - use connectWallet instead
export const checkForProvider = () => {
  return getEthereumProvider() !== null;
};

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

// Default to localhost hardhat address, but allow override
// You'll need to update this with your deployed contract address for testnets/mainnet
// For testing locally with Hardhat: 0x5fbdb2315678afecb367f032d93f642f64180aa3
// For Sepolia testnet: Using your deployed contract address
// Last updated: May 15, 2025
let contractAddress = '0x13E3f4A80B6A9B4C25575FF2646a0F4adb4D88eD';

// Get network info to determine right contract address
export const getNetworkAndSetContract = async (provider) => {
  try {
    const network = await provider.getNetwork();
    console.log("Connected to network:", network.name, network.chainId);
    
    // Set appropriate contract address based on network
    if (network.chainId === 31337n) {
      // Local Hardhat network
      contractAddress = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
    } else if (network.chainId === 11155111n) {
      // Sepolia testnet
      contractAddress = '0x13E3f4A80B6A9B4C25575FF2646a0F4adb4D88eD'; // Your deployed contract address
    } else {
      console.warn("Connected to unsupported network. Contract interactions may fail.");
    }
    
    console.log("Using contract address:", contractAddress);
    return { network, contractAddress };
  } catch (error) {
    console.error("Error getting network:", error);
    return { error: error.message };
  }
};

export const connectWallet = async () => {
  console.log("Attempting to connect wallet...");
  
  try {
    const ethereum = getEthereumProvider();
    
    if (!ethereum) {
      console.error("No Ethereum provider found");
      alert('Please install MetaMask to use this dApp! Visit https://metamask.io/');
      return { error: "MetaMask not installed" };
    }
    
    console.log("MetaMask found, requesting accounts...");
    
    // Explicitly request account access - this will trigger the MetaMask popup
    const accounts = await ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    console.log("Accounts received:", accounts);
    
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts returned");
    }
    
    const address = accounts[0];
    
    const provider = new ethers.BrowserProvider(ethereum);
    console.log("Provider initialized");
    
    // Get network info and set appropriate contract address
    await getNetworkAndSetContract(provider);
    
    const signer = await provider.getSigner();
    console.log("Signer obtained");
    
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    console.log("Contract instance created");
    
    return { provider, signer, contract, address };
  } catch (error) {
    console.error("Error connecting to MetaMask:", error);
    if (error.code === 4001) {
      // User rejected request
      alert("Please connect to MetaMask to use this dApp!");
    } else {
      alert(`Error connecting to wallet: ${error.message || "Unknown error"}`);
    }
    return { error: error.message || "Failed to connect to wallet" };
  }
};

export const updateContractAddress = (address) => {
  contractAddress = address;
  console.log("Contract address updated to:", address);
};

// Function to get all available loans
export const getLoans = async (contract) => {
  try {
    const loanCount = await contract.loanCount();
    console.log("Total loans:", loanCount.toString());
    
    const loans = [];
    for (let i = 0; i < loanCount; i++) {
      const loan = await contract.loans(i);
      loans.push({
        id: i,
        borrower: loan.borrower,
        lender: loan.lender,
        tokenAddress: loan.tokenAddress,
        amount: ethers.formatEther(loan.amount),
        interestRate: loan.interestRate.toString(),
        duration: loan.duration.toString(),
        startTime: loan.startTime.toString(),
        collateralized: loan.collateralized,
        repaid: loan.repaid
      });
    }
    
    return loans;
  } catch (error) {
    console.error("Error getting loans:", error);
    throw error;
  }
};

// Function to fund a loan
export const fundLoan = async (contract, loanId) => {
  try {
    console.log(`Funding loan with ID: ${loanId}`);
    
    // Get loan details to verify it's fundable
    const loan = await contract.loans(loanId);
    console.log("Loan details:", loan);
    
    // Check if loan is already funded or repaid
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    if (loan.lender !== zeroAddress) {
      return {
        success: false,
        error: "This loan has already been funded"
      };
    }
    
    if (loan.repaid) {
      return {
        success: false,
        error: "This loan has already been repaid"
      };
    }
    
    // Call the fundLoan function on the contract
    const tx = await contract.fundLoan(loanId);
    console.log("Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("Loan funded:", receipt);
    
    return {
      success: true,
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      from: receipt.from,
      to: receipt.to,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error("Error funding loan:", error);
    return {
      success: false,
      error: error.message || "Failed to fund loan"
    };
  }
};

// Function to calculate loan repayment amount
export const calculateRepaymentAmount = async (contract, loanId) => {
  try {
    // Get loan details
    const loan = await contract.loans(loanId);
    
    // Check if loan exists and is not repaid
    if (loan.repaid) {
      return { 
        success: false,
        error: "Loan already repaid" 
      };
    }
    
    const repaymentAmount = await contract.calculateRepayment(loanId);
    const principalAmount = loan.amount;
    const interestAmount = repaymentAmount - principalAmount;
    
    return {
      success: true,
      total: ethers.formatEther(repaymentAmount),
      principal: ethers.formatEther(principalAmount),
      interest: ethers.formatEther(interestAmount),
      interestRate: loan.interestRate.toString(),
      duration: loan.duration.toString()
    };
  } catch (error) {
    console.error("Error calculating repayment:", error);
    return {
      success: false,
      error: error.message || "Failed to calculate repayment"
    };
  }
};

// Function to repay a loan
export const repayLoan = async (contract, loanId) => {
  try {
    console.log(`Repaying loan with ID: ${loanId}`);
    
    // Get loan details to verify it's repayable
    const loan = await contract.loans(loanId);
    console.log("Loan details for repayment:", loan);
    
    // Check if loan is already repaid
    if (loan.repaid) {
      return {
        success: false,
        error: "This loan has already been repaid"
      };
    }
    
    // Check if loan has been funded
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    if (loan.lender === zeroAddress) {
      return {
        success: false,
        error: "This loan has not been funded yet"
      };
    }
    
    // Calculate repayment amount (principal + interest)
    const repaymentAmount = await contract.calculateRepayment(loanId);
    const formattedRepaymentAmount = ethers.formatEther(repaymentAmount);
    console.log("Repayment amount:", formattedRepaymentAmount, "ETH");
    
    // Show breakdown for user clarity
    const principalAmount = loan.amount;
    const interestAmount = repaymentAmount - principalAmount;
    console.log("Principal:", ethers.formatEther(principalAmount), "ETH");
    console.log("Interest:", ethers.formatEther(interestAmount), "ETH");
    
    // Call the repayLoan function on the contract
    const tx = await contract.repayLoan(loanId);
    console.log("Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("Loan repaid:", receipt);
    
    return {
      success: true,
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      from: receipt.from,
      to: receipt.to,
      gasUsed: receipt.gasUsed.toString(),
      repaymentAmount: formattedRepaymentAmount,
      principal: ethers.formatEther(principalAmount),
      interest: ethers.formatEther(interestAmount),
      interestRate: loan.interestRate.toString(),
      duration: loan.duration.toString()
    };
  } catch (error) {
    console.error("Error repaying loan:", error);
    // Check for specific error messages from the contract
    if (error.message.includes("insufficient funds")) {
      return {
        success: false,
        error: "You don't have enough funds to repay this loan. Please add more ETH to your wallet."
      };
    }
    
    return {
      success: false,
      error: error.message || "Failed to repay loan"
    };
  }
}; 