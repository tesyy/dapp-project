# DeFi Lending Platform

A decentralized lending platform built with Solidity, Hardhat, and React.

## Project Structure

- `/contracts`: Smart contracts written in Solidity
- `/scripts`: Deployment scripts
- `/test`: Contract test files
- `/artifacts`: Compiled contract artifacts (ABIs, bytecode)
- `/frontend`: React frontend application

## Getting Started

### Smart Contract Development

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy contracts
npm run deploy
```

### Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## License

MIT

## Features

- Create loan requests with custom terms (amount, interest rate, duration)
- Optionally secure loans with ETH collateral
- Lenders can browse and fund available loans
- Borrowers can repay loans (principal + interest)
- Track loan status (pending, funded, repaid)

## Technology Stack

- **Smart Contract**: Solidity (with OpenZeppelin libraries)
- **Frontend**: HTML, CSS, JavaScript with Web3.js
- **Blockchain**: Ethereum (Goerli Testnet)

## Setup Instructions

1. Deploy the smart contract to the Goerli testnet
2. Update the contract address and ABI in the frontend code
3. Host the frontend on GitHub Pages or similar service

## Testnet Details

- **Network**: Goerli Testnet
- **Contract Address**: [Your deployed contract address]
- **Frontend URL**: [Your GitHub Pages URL]

## Testing

The platform has been tested with:
- MetaMask wallet integration
- DAI, USDC, and USDT test tokens
- Various loan scenarios (collateralized/non-collateralized)

## Security Considerations

- Uses OpenZeppelin's ReentrancyGuard to prevent reentrancy attacks
- Proper access control checks in all functions
- Input validation for all user-provided data
- Tested with common attack vectors in mind

## Screenshots

[Include screenshots of the application in action]

 npx hardhat run scripts/deploy.js --network localhost
 