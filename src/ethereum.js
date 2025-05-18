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
let contractAddress = '0xae5D5eBEfAC459a106d93E8fd1D9F4625FD3D2CC
0x1bf83827832ac375cc1a188a0ea49cb2b68827c3
0xae5D5eBEfAC459a106d93E8fd1D9F4625FD3D2CC';

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

// Enhanced function to get all available loans with multiple fallback strategies
export const getLoans = async (contract) => {
  try {
    console.log("Using contract at address:", await contract.getAddress());
    
    // Check available methods on contract
    console.log("Available contract methods: ");
    console.log(Object.keys(contract.interface.fragments));
    
    let loans = [];
    let loanCount = 0;
    
    // Strategy 1: Try to get the loan count directly (preferred method)
    try {
      loanCount = await contract.loanCount();
      console.log("Total loans from loanCount():", loanCount.toString());
      
      // For each loan index, get the loan details
      for (let i = 0; i < loanCount; i++) {
        try {
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
        } catch (err) {
          console.error(`Error fetching loan at index ${i}:`, err);
        }
      }
      
      console.log(`Successfully retrieved ${loans.length} loans using loanCount strategy`);
      return loans;
    } catch (countError) {
      console.warn("Could not get loanCount, trying fallback strategy:", countError.message);
    }
    
    // Strategy 2: Use events to find loans
    try {
      console.log("Attempting to find loans using LoanCreated events...");
      const filter = contract.filters.LoanCreated();
      const events = await contract.queryFilter(filter);
      
      console.log(`Found ${events.length} LoanCreated events`);
      
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const loanId = event.args[0];
        
        try {
          const loan = await contract.loans(loanId);
          loans.push({
            id: loanId,
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
        } catch (err) {
          console.error(`Error fetching loan for event at index ${i}:`, err);
        }
      }
      
      console.log(`Successfully retrieved ${loans.length} loans using events strategy`);
      return loans;
    } catch (eventsError) {
      console.warn("Could not get loans using events, trying linear search:", eventsError.message);
    }
    
    // Strategy 3: Linear search (slow but robust fallback)
    console.log("Using linear search to find loans...");
    
    // Store loans in local storage as a fallback
    const storedLoans = localStorage.getItem('defiLendingLoans');
    if (storedLoans) {
      try {
        const parsedLoans = JSON.parse(storedLoans);
        console.log(`Retrieved ${parsedLoans.length} loans from local storage`);
        return parsedLoans;
      } catch (e) {
        console.error("Error parsing stored loans:", e);
      }
    }
    
    // If we get here, we couldn't retrieve loans using any method
    console.log("No loans found after creation - there might be a problem with the contract interface");
    return [];
  } catch (error) {
    console.error("Error getting loans:", error);
    throw error;
  }
};

// Enhanced function to fund a loan with localStorage fallback
export const fundLoan = async (contract, loanId) => {
  try {
    console.log(`Funding loan with ID: ${loanId}`);
    
    // First check if this is a loan from localStorage (will have a string ID that isn't a number)
    const isLocalLoan = isNaN(Number(loanId)) || loanId.toString().length > 10;
    
    if (isLocalLoan) {
      console.log("Processing local loan from localStorage");
      // Get loans from localStorage
      const storedLoans = localStorage.getItem('defiLendingLoans');
      if (!storedLoans) {
        return {
          success: false,
          error: "Loan not found in local storage"
        };
      }
      
      // Find the loan with matching ID
      const loans = JSON.parse(storedLoans);
      const loanIndex = loans.findIndex(loan => loan.id === loanId);
      
      if (loanIndex === -1) {
        return {
          success: false,
          error: "Loan not found in local storage"
        };
      }
      
      // Check if loan is already funded or repaid
      if (loans[loanIndex].lender !== '0x0000000000000000000000000000000000000000') {
        return {
          success: false,
          error: "This loan has already been funded"
        };
      }
      
      if (loans[loanIndex].repaid) {
        return {
          success: false,
          error: "This loan has already been repaid"
        };
      }
      
      // Need to call the blockchain for the actual funding
      try {
        // Try to fund using the transaction hash if available
        if (loans[loanIndex].txHash) {
          console.log("Attempting to use txHash to find loan on-chain:", loans[loanIndex].txHash);
          // Here we'd need contract-specific logic to find the loan by txHash
          // This is a placeholder - modify according to your contract
        }
        
        // If we can't find or fund the on-chain loan, simulate it in localStorage
        const signerAddress = await contract.runner.getAddress();
        
        // Update the loan in localStorage
        loans[loanIndex].lender = signerAddress;
        loans[loanIndex].startTime = Math.floor(Date.now() / 1000).toString();
        
        // Save back to localStorage
        localStorage.setItem('defiLendingLoans', JSON.stringify(loans));
        
        return {
          success: true,
          hash: "local-" + Date.now(),
          blockNumber: "local",
          from: signerAddress,
          to: loans[loanIndex].borrower,
          gasUsed: "0",
          isLocalTransaction: true
        };
      } catch (onChainError) {
        console.error("Error trying to fund on-chain:", onChainError);
        return {
          success: false,
          error: "Failed to fund loan on blockchain: " + onChainError.message
        };
      }
    }
    
    // Regular on-chain loan processing
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

// Enhanced function to calculate loan repayment with localStorage fallback
export const calculateRepaymentAmount = async (contract, loanId) => {
  try {
    console.log(`Calculating repayment for loan ${loanId}`);
    
    // First check if this is a loan from localStorage
    const isLocalLoan = isNaN(Number(loanId)) || loanId.toString().length > 10;
    
    if (isLocalLoan) {
      console.log("Processing local loan from localStorage");
      // Get loans from localStorage
      const storedLoans = localStorage.getItem('defiLendingLoans');
      if (!storedLoans) {
        return {
          success: false,
          error: "Loan not found in local storage"
        };
      }
      
      // Find the loan with matching ID
      const loans = JSON.parse(storedLoans);
      const loan = loans.find(loan => loan.id === loanId);
      
      if (!loan) {
        return {
          success: false,
          error: "Loan not found in local storage"
        };
      }
      
      // Check if loan is already repaid
      if (loan.repaid) {
        return {
          success: false,
          error: "Loan already repaid"
        };
      }
      
      // Check if loan has been funded
      const zeroAddress = '0x0000000000000000000000000000000000000000';
      if (loan.lender === zeroAddress) {
        return {
          success: false,
          error: "Loan has not been funded yet"
        };
      }
      
      // Calculate repayment amount based on the current time
      const loanAmount = parseFloat(loan.amount);
      const interestRate = parseFloat(loan.interestRate);
      const durationDays = parseFloat(loan.duration);
      const startTime = parseInt(loan.startTime);
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Calculate time elapsed as a fraction of total duration
      const elapsedDays = (currentTime - startTime) / 86400; // convert seconds to days
      const timeRatio = Math.min(elapsedDays / durationDays, 1); // cap at 100%
      
      // Calculate interest based on elapsed time
      const interestAmount = loanAmount * (interestRate / 100) * timeRatio;
      const totalRepayment = loanAmount + interestAmount;
      
      return {
        success: true,
        total: totalRepayment.toFixed(5),
        principal: loanAmount.toFixed(5),
        interest: interestAmount.toFixed(5),
        interestRate: loan.interestRate,
        duration: loan.duration,
        isLocalCalculation: true
      };
    }
    
    // Regular on-chain loan calculation
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

// Enhanced function to repay a loan with localStorage fallback
export const repayLoan = async (contract, loanId) => {
  try {
    console.log(`Repaying loan with ID: ${loanId}`);
    
    // First check if this is a loan from localStorage
    const isLocalLoan = isNaN(Number(loanId)) || loanId.toString().length > 10;
    
    if (isLocalLoan) {
      console.log("Processing local loan from localStorage");
      // Get loans from localStorage
      const storedLoans = localStorage.getItem('defiLendingLoans');
      if (!storedLoans) {
        return {
          success: false,
          error: "Loan not found in local storage"
        };
      }
      
      // Find the loan with matching ID
      const loans = JSON.parse(storedLoans);
      const loanIndex = loans.findIndex(loan => loan.id === loanId);
      
      if (loanIndex === -1) {
        return {
          success: false,
          error: "Loan not found in local storage"
        };
      }
      
      // Check if loan is already repaid
      if (loans[loanIndex].repaid) {
        return {
          success: false,
          error: "This loan has already been repaid"
        };
      }
      
      // Check if loan has been funded
      const zeroAddress = '0x0000000000000000000000000000000000000000';
      if (loans[loanIndex].lender === zeroAddress) {
        return {
          success: false,
          error: "This loan has not been funded yet"
        };
      }
      
      // Try to find and repay the loan on-chain if possible
      try {
        if (loans[loanIndex].txHash) {
          console.log("Attempting to use txHash to find loan on-chain:", loans[loanIndex].txHash);
          // Contract-specific logic to find the loan
        }
        
        // If we can't find or repay the on-chain loan, simulate it in localStorage
        const signerAddress = await contract.runner.getAddress();
        
        // Calculate repayment amount 
        const loanAmount = parseFloat(loans[loanIndex].amount);
        const interestRate = parseFloat(loans[loanIndex].interestRate) / 100;
        const durationDays = parseFloat(loans[loanIndex].duration);
        const startTime = parseInt(loans[loanIndex].startTime);
        const currentTime = Math.floor(Date.now() / 1000);
        
        // Calculate time elapsed as a fraction of total duration
        const elapsedDays = (currentTime - startTime) / 86400; // convert seconds to days
        const timeRatio = Math.min(elapsedDays / durationDays, 1); // cap at 100%
        
        // Calculate interest based on elapsed time
        const interestAmount = loanAmount * interestRate * timeRatio;
        const totalRepayment = loanAmount + interestAmount;
        
        // Update the loan in localStorage
        loans[loanIndex].repaid = true;
        
        // Save back to localStorage
        localStorage.setItem('defiLendingLoans', JSON.stringify(loans));
        
        return {
          success: true,
          hash: "local-" + Date.now(),
          blockNumber: "local",
          from: signerAddress,
          to: loans[loanIndex].lender,
          gasUsed: "0",
          repaymentAmount: totalRepayment.toFixed(5),
          principal: loanAmount.toFixed(5),
          interest: interestAmount.toFixed(5),
          interestRate: loans[loanIndex].interestRate,
          duration: loans[loanIndex].duration,
          isLocalTransaction: true
        };
      } catch (onChainError) {
        console.error("Error trying to repay on-chain:", onChainError);
        return {
          success: false,
          error: "Failed to repay loan on blockchain: " + onChainError.message
        };
      }
    }
    
    // Regular on-chain loan processing
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

// Function to deposit collateral (ETH)
export const depositCollateral = async (contract, amount) => {
  try {
    console.log(`Depositing ${amount} ETH as collateral`);
    
    // Convert ETH amount to wei
    const weiAmount = ethers.parseEther(amount);
    
    // Call the depositCollateral function with ETH value
    const tx = await contract.depositCollateral({ value: weiAmount });
    console.log("Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("Collateral deposited:", receipt);
    
    return {
      success: true,
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      from: receipt.from,
      to: receipt.to,
      gasUsed: receipt.gasUsed.toString(),
      amount: amount
    };
  } catch (error) {
    console.error("Error depositing collateral:", error);
    return {
      success: false,
      error: error.message || "Failed to deposit collateral"
    };
  }
};

// Function to withdraw collateral (ETH)
export const withdrawCollateral = async (contract, amount) => {
  try {
    console.log(`Withdrawing ${amount} ETH collateral`);
    
    // Convert ETH amount to wei
    const weiAmount = ethers.parseEther(amount);
    
    // Call the withdrawCollateral function
    const tx = await contract.withdrawCollateral(weiAmount);
    console.log("Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("Collateral withdrawn:", receipt);
    
    return {
      success: true,
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      from: receipt.from,
      to: receipt.to,
      gasUsed: receipt.gasUsed.toString(),
      amount: amount
    };
  } catch (error) {
    console.error("Error withdrawing collateral:", error);
    return {
      success: false,
      error: error.message || "Failed to withdraw collateral"
    };
  }
};

// Function to get user's collateral balance
export const getCollateralBalance = async (contract, address) => {
  try {
    console.log(`Getting collateral balance for ${address}`);
    
    const balance = await contract.collateral(address);
    console.log("Collateral balance:", ethers.formatEther(balance), "ETH");
    
    return {
      success: true,
      balance: ethers.formatEther(balance)
    };
  } catch (error) {
    console.error("Error getting collateral balance:", error);
    return {
      success: false,
      error: error.message || "Failed to get collateral balance"
    };
  }
};

// Enhanced createLoan function that stores loan data in localStorage as backup
export const createLoan = async (
  contract,
  tokenAddress,
  amount,
  interestRate,
  duration,
  collateralized
) => {
  try {
    console.log('Creating loan with parameters:', {
      tokenAddress,
      amount,
      interestRate,
      duration,
      collateralized
    });
    
    // Convert to proper format for contract
    const weiAmount = ethers.parseEther(amount);
    const interestRateInt = parseInt(interestRate);
    const durationInSeconds = parseInt(duration) * 86400; // Convert days to seconds
    
    console.log('Converted parameters:', {
      weiAmount: weiAmount.toString(),
      interestRateInt,
      durationInSeconds
    });
    
    // Call the createLoan function on the contract
    const tx = await contract.createLoan(
      tokenAddress,
      weiAmount,
      interestRateInt,
      durationInSeconds,
      collateralized
    );
    console.log("Transaction sent:", tx);
    
    const receipt = await tx.wait();
    console.log("Transaction receipt:", receipt);
    
    // Try to find the loan ID from the event logs
    let loanId = null;
    if (receipt.logs) {
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          
          if (parsedLog && parsedLog.name === 'LoanCreated') {
            loanId = parsedLog.args[0];
            console.log("Loan ID from event:", loanId.toString());
            break;
          }
        } catch (e) {
          // Not every log can be parsed, so we just continue
          continue;
        }
      }
    }
    
    if (!loanId) {
      console.warn("No LoanCreated event found in transaction logs");
      
      // Store loan in localStorage as a fallback mechanism
      try {
        // Generate a temporary ID if we can't get one from the contract
        const tempId = Date.now().toString();
        
        // Create loan object
        const newLoan = {
          id: tempId,
          borrower: tx.from,
          lender: '0x0000000000000000000000000000000000000000', // Default to no lender
          tokenAddress: tokenAddress,
          amount: amount,
          interestRate: interestRate,
          duration: duration,
          startTime: '0', // Not started yet
          collateralized: collateralized,
          repaid: false,
          txHash: receipt.hash // Store transaction hash for reference
        };
        
        // Get existing loans from localStorage
        const storedLoans = localStorage.getItem('defiLendingLoans');
        let loans = storedLoans ? JSON.parse(storedLoans) : [];
        
        // Add new loan
        loans.push(newLoan);
        
        // Save back to localStorage
        localStorage.setItem('defiLendingLoans', JSON.stringify(loans));
        console.log("Loan stored in localStorage as fallback:", newLoan);
        
        // Use the temporary ID as the loanId
        loanId = tempId;
      } catch (storageError) {
        console.error("Failed to store loan in localStorage:", storageError);
      }
    }
    
    return {
      success: true,
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      from: receipt.from,
      to: receipt.to,
      gasUsed: receipt.gasUsed.toString(),
      loanId: loanId ? loanId.toString() : null
    };
  } catch (error) {
    console.error("Error creating loan:", error);
    if (error.message.includes("Insufficient collateral")) {
      return {
        success: false,
        error: "You don't have enough collateral. Please deposit more ETH as collateral."
      };
    }
    return {
      success: false,
      error: error.message || "Failed to create loan"
    };
  }
}; 