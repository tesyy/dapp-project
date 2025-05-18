// IndexedDB loan storage system

// Open the database
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open('LendingPlatformDB', 1);
    
    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
      reject('Could not open database');
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create loans object store
      if (!db.objectStoreNames.contains('loans')) {
        const loansStore = db.createObjectStore('loans', { keyPath: 'id' });
        loansStore.createIndex('borrower', 'borrower', { unique: false });
        loansStore.createIndex('lender', 'lender', { unique: false });
        loansStore.createIndex('status', 'status', { unique: false });
        loansStore.createIndex('txHash', 'txHash', { unique: false });
      }
      
      // Create transactions object store
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
        txStore.createIndex('loanId', 'loanId', { unique: false });
        txStore.createIndex('type', 'type', { unique: false });
        txStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

// Save a loan to the database
export const saveLoan = async (loan) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['loans'], 'readwrite');
      const loansStore = transaction.objectStore('loans');
      
      // Add timestamp and status field if not present
      const loanWithStatus = {
        ...loan,
        timestamp: loan.timestamp || Date.now(),
        status: loan.status || (
          loan.repaid ? 'repaid' : 
          (loan.lender === '0x0000000000000000000000000000000000000000' ? 'pending' : 'active')
        )
      };
      
      const request = loansStore.put(loanWithStatus);
      
      request.onsuccess = () => {
        console.log(`Loan ${loan.id} saved to IndexedDB`);
        resolve(loan);
      };
      
      request.onerror = (event) => {
        console.error('Error saving loan:', event);
        reject('Could not save loan');
      };
    });
  } catch (error) {
    console.error('Failed to save loan:', error);
    throw error;
  }
};

// Get all loans from the database
export const getAllLoans = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['loans'], 'readonly');
      const loansStore = transaction.objectStore('loans');
      const request = loansStore.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        console.error('Error getting loans:', event);
        reject('Could not get loans');
      };
    });
  } catch (error) {
    console.error('Failed to get loans:', error);
    throw error;
  }
};

// Get a loan by ID
export const getLoanById = async (id) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['loans'], 'readonly');
      const loansStore = transaction.objectStore('loans');
      const request = loansStore.get(id);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        console.error(`Error getting loan ${id}:`, event);
        reject(`Could not get loan ${id}`);
      };
    });
  } catch (error) {
    console.error(`Failed to get loan ${id}:`, error);
    throw error;
  }
};

// Update a loan
export const updateLoan = async (id, updates) => {
  try {
    // First get the current loan
    const loan = await getLoanById(id);
    if (!loan) {
      throw new Error(`Loan ${id} not found`);
    }
    
    // Apply updates
    const updatedLoan = { ...loan, ...updates };
    
    // Update status based on other fields
    updatedLoan.status = updatedLoan.repaid ? 'repaid' : 
      (updatedLoan.lender === '0x0000000000000000000000000000000000000000' ? 'pending' : 'active');
    
    // Save the updated loan
    return await saveLoan(updatedLoan);
  } catch (error) {
    console.error(`Failed to update loan ${id}:`, error);
    throw error;
  }
};

// Get loans by borrower
export const getLoansByBorrower = async (borrowerAddress) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['loans'], 'readonly');
      const loansStore = transaction.objectStore('loans');
      const borrowerIndex = loansStore.index('borrower');
      const request = borrowerIndex.getAll(borrowerAddress);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        console.error(`Error getting loans for borrower ${borrowerAddress}:`, event);
        reject(`Could not get loans for borrower ${borrowerAddress}`);
      };
    });
  } catch (error) {
    console.error(`Failed to get loans for borrower ${borrowerAddress}:`, error);
    throw error;
  }
};

// Get loans by lender
export const getLoansByLender = async (lenderAddress) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['loans'], 'readonly');
      const loansStore = transaction.objectStore('loans');
      const lenderIndex = loansStore.index('lender');
      const request = lenderIndex.getAll(lenderAddress);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        console.error(`Error getting loans for lender ${lenderAddress}:`, event);
        reject(`Could not get loans for lender ${lenderAddress}`);
      };
    });
  } catch (error) {
    console.error(`Failed to get loans for lender ${lenderAddress}:`, error);
    throw error;
  }
};

// Record a transaction
export const recordTransaction = async (transaction) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['transactions'], 'readwrite');
      const txStore = tx.objectStore('transactions');
      
      // Add timestamp if not present
      const txWithTimestamp = {
        ...transaction,
        timestamp: transaction.timestamp || Date.now()
      };
      
      const request = txStore.add(txWithTimestamp);
      
      request.onsuccess = () => {
        console.log('Transaction recorded:', request.result);
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        console.error('Error recording transaction:', event);
        reject('Could not record transaction');
      };
    });
  } catch (error) {
    console.error('Failed to record transaction:', error);
    throw error;
  }
};

// Generate a unique ID
export const generateId = () => {
  return `local-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}; 