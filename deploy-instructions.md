# Deployment Instructions

## 1. Setup Environment

1. Create a `.env` file in the project root with these values:
   ```
   INFURA_API_KEY=your_infura_api_key_here
   PRIVATE_KEY=your_wallet_private_key_here
   ```

2. Replace placeholders with your actual values:
   - Get an Infura API key by signing up at https://infura.io
   - Export your private key from MetaMask (Account Details > Export Private Key)
   - **IMPORTANT**: Never share your private key or commit the `.env` file to version control!

3. Install dependencies (if not already done):
   ```
   npm install
   ```

## 2. Deploy Smart Contract

1. We've created the deployment script for Sepolia testnet. Run:
   ```
   npx hardhat run scripts/deploy-sepolia.js --network sepolia
   ```

2. Take note of the deployed contract address from the output. You should see something like:
   ```
   DecentralizedLending deployed to: 0x...
   ```

## 3. Update Frontend with Contract Address

1. Open `src/ethereum.js`
2. Find the line that sets the contract address:
   ```javascript
   let contractAddress = '0x13E3f4A80B6A9B4C25575FF2646a0F4adb4D88eD';
   ```
3. Update it with your newly deployed contract address.

## 4. Deploy Frontend to GitHub Pages

1. Ensure your `package.json` has the correct GitHub Pages configuration:
   ```json
   "homepage": "https://tesyy.github.io/dapp-project",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```

2. Build and deploy with:
   ```
   npm run build
   npm run deploy
   ```

3. The app will be accessible at: `https://tesyy.github.io/dapp-project`

## 5. Alternate: Automated Deployment

You can use the provided script that handles all the above steps automatically:

```
./deploy.sh
```

## 6. Testing the Deployed Application

1. Visit your GitHub Pages URL
2. Connect your MetaMask wallet to Sepolia testnet
3. Use the application to:
   - Create loans
   - Deposit collateral
   - Fund other users' loans
   - Repay your loans

## Troubleshooting

- If you encounter errors about missing dependencies, run `npm install`
- For MetaMask connection issues, ensure you're on the Sepolia testnet
- If the contract doesn't appear to be working, verify the contract address is correctly updated in the frontend 