#!/bin/bash

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}   DeFi Lending Platform Deployment Tool  ${NC}"
echo -e "${YELLOW}=========================================${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${RED}Error: .env file not found!${NC}"
  echo -e "Creating a template .env file..."
  echo "INFURA_API_KEY=your_infura_api_key_here" > .env
  echo "PRIVATE_KEY=your_wallet_private_key_here" >> .env
  echo -e "${YELLOW}Please edit the .env file with your actual Infura API key and private key.${NC}"
  exit 1
fi

# Source environment variables
source .env

# Check if keys are set
if [ "$INFURA_API_KEY" = "your_infura_api_key_here" ] || [ "$PRIVATE_KEY" = "your_wallet_private_key_here" ]; then
  echo -e "${RED}Error: Please update your .env file with actual values.${NC}"
  exit 1
fi

# 1. Deploy the smart contract
echo -e "\n${GREEN}Step 1: Deploying the smart contract to Sepolia...${NC}"
CONTRACT_OUTPUT=$(npx hardhat run scripts/deploy-sepolia.js --network sepolia)
CONTRACT_ADDRESS=$(echo "$CONTRACT_OUTPUT" | grep -o '0x[a-fA-F0-9]\{40\}')

if [ -z "$CONTRACT_ADDRESS" ]; then
  echo -e "${RED}Error: Failed to deploy contract or extract address.${NC}"
  echo "Raw output: $CONTRACT_OUTPUT"
  exit 1
fi

echo -e "${GREEN}Contract deployed at: ${YELLOW}$CONTRACT_ADDRESS${NC}"

# 2. Update contract address in ethereum.js
echo -e "\n${GREEN}Step 2: Updating contract address in frontend...${NC}"
# More reliable method to update the contract address
perl -i -pe "s|let contractAddress = '0x[a-fA-F0-9]{40}'|let contractAddress = '$CONTRACT_ADDRESS'|g" src/ethereum.js

echo -e "${GREEN}Contract address updated in src/ethereum.js${NC}"

# 3. Build and deploy the frontend
echo -e "\n${GREEN}Step 3: Building and deploying the frontend...${NC}"
npm run build
npm run deploy

echo -e "\n${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Your application is now available at:${NC}"
echo -e "${GREEN}https://tesyy.github.io/dapp-project${NC}"
echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Visit your application URL"
echo -e "2. Connect your MetaMask wallet to Sepolia testnet"
echo -e "3. Test the application functionality"
echo -e "${YELLOW}=========================================${NC}" 