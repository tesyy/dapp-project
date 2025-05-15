// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract DecentralizedLending is ReentrancyGuard {
    struct Loan {
        address borrower;
        address lender;
        address tokenAddress;
        uint256 amount;
        uint256 interestRate;
        uint256 duration;
        uint256 startTime;
        bool collateralized;
        bool repaid;
    }

    mapping(uint256 => Loan) public loans;
    uint256 public loanCount;
    mapping(address => uint256) public collateral;

    event LoanCreated(
        uint256 loanId,
        address borrower,
        address tokenAddress,
        uint256 amount,
        uint256 interestRate,
        uint256 duration,
        bool collateralized
    );

    event LoanFunded(uint256 loanId, address lender);
    event LoanRepaid(uint256 loanId);
    event CollateralDeposited(address borrower, uint256 amount);
    event CollateralWithdrawn(address borrower, uint256 amount);

    // Create a new loan request
    function createLoan(
        address _tokenAddress,
        uint256 _amount,
        uint256 _interestRate,
        uint256 _duration,
        bool _collateralized
    ) external {
        require(_amount > 0, "Amount must be greater than 0");
        require(_interestRate > 0, "Interest rate must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");

        if (_collateralized) {
            require(collateral[msg.sender] >= _amount, "Insufficient collateral");
        }

        loans[loanCount] = Loan({
            borrower: msg.sender,
            lender: address(0),
            tokenAddress: _tokenAddress,
            amount: _amount,
            interestRate: _interestRate,
            duration: _duration,
            startTime: 0,
            collateralized: _collateralized,
            repaid: false
        });

        emit LoanCreated(
            loanCount,
            msg.sender,
            _tokenAddress,
            _amount,
            _interestRate,
            _duration,
            _collateralized
        );

        loanCount++;
    }

    // Fund a loan
    function fundLoan(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.borrower != address(0), "Loan does not exist");
        require(loan.lender == address(0), "Loan already funded");
        require(msg.sender != loan.borrower, "Cannot fund your own loan");

        IERC20 token = IERC20(loan.tokenAddress);
        require(
            token.transferFrom(msg.sender, loan.borrower, loan.amount),
            "Token transfer failed"
        );

        loan.lender = msg.sender;
        loan.startTime = block.timestamp;

        emit LoanFunded(_loanId, msg.sender);
    }

    // Repay a loan
    function repayLoan(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.borrower == msg.sender, "Only borrower can repay");
        require(loan.lender != address(0), "Loan not funded yet");
        require(!loan.repaid, "Loan already repaid");

        uint256 interest = (loan.amount * loan.interestRate * (block.timestamp - loan.startTime)) / 
                          (100 * loan.duration);
        uint256 totalAmount = loan.amount + interest;

        IERC20 token = IERC20(loan.tokenAddress);
        require(
            token.transferFrom(msg.sender, loan.lender, totalAmount),
            "Token transfer failed"
        );

        loan.repaid = true;

        if (loan.collateralized) {
            collateral[msg.sender] += loan.amount;
        }

        emit LoanRepaid(_loanId);
    }

    // Deposit collateral (ETH)
    function depositCollateral() external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        collateral[msg.sender] += msg.value;
        emit CollateralDeposited(msg.sender, msg.value);
    }

    // Withdraw collateral (ETH)
    function withdrawCollateral(uint256 _amount) external nonReentrant {
        require(collateral[msg.sender] >= _amount, "Insufficient collateral");
        collateral[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
        emit CollateralWithdrawn(msg.sender, _amount);
    }

    // Calculate repayment amount for a loan
    function calculateRepayment(uint256 _loanId) public view returns (uint256) {
        Loan storage loan = loans[_loanId];
        if (loan.lender == address(0) || loan.repaid) {
            return 0;
        }
        uint256 interest = (loan.amount * loan.interestRate * (block.timestamp - loan.startTime)) / 
                          (100 * loan.duration);
        return loan.amount + interest;
    }
}