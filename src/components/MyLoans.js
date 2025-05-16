import React from 'react';

const MyLoans = ({ loans, address }) => {
  const myLoans = loans.filter(loan => 
    loan.borrower.toLowerCase() === address.toLowerCase()
  );

  const formatAddress = (address) => {
    if (!address || address === '0x0000000000000000000000000000000000000000') return 'None';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatNumber = (num) => {
    return parseFloat(num).toFixed(5);
  };

  const getLoanStatus = (loan) => {
    if (loan.repaid) return 'Repaid';
    if (loan.lender === '0x0000000000000000000000000000000000000000') return 'Awaiting Funding';
    return 'Active';
  };

  const getStatusClass = (loan) => {
    if (loan.repaid) return 'repaid';
    if (loan.lender === '0x0000000000000000000000000000000000000000') return 'pending';
    return 'active';
  };

  return (
    <div className="my-loans">
      <h2>My Loans</h2>
      
      {myLoans.length === 0 ? (
        <p>You haven't created any loans yet.</p>
      ) : (
        <div className="loans-container">
          {myLoans.map((loan) => (
            <div key={loan.id} className={`loan-card ${getStatusClass(loan)}`}>
              <div className="loan-header">
                <h3>Loan #{loan.id}</h3>
                <span className={`loan-status status-${getStatusClass(loan)}`}>
                  {getLoanStatus(loan)}
                </span>
              </div>
              
              <div className="loan-details">
                <div className="loan-details-section">
                  <h4>Loan Information</h4>
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
                </div>
                
                <div className="loan-details-section">
                  <h4>Blockchain Details</h4>
                  <p>
                    <span className="label">Borrower:</span>
                    <span className="value">{formatAddress(loan.borrower)}</span>
                  </p>
                  <p>
                    <span className="label">Lender:</span>
                    <span className="value">{formatAddress(loan.lender)}</span>
                  </p>
                  {loan.startTime !== '0' && (
                    <p>
                      <span className="label">Start Time:</span>
                      <span className="value">{new Date(loan.startTime * 1000).toLocaleString()}</span>
                    </p>
                  )}
                </div>
              </div>
              
              <div className="loan-actions">
                <a 
                  href={`https://sepolia.etherscan.io/address/${loan.borrower}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="etherscan-link"
                >
                  View on Etherscan
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLoans; 