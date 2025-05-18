#!/bin/bash

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}   DeFi Lending Platform Frontend Deploy  ${NC}"
echo -e "${YELLOW}=========================================${NC}"

# Build and deploy the frontend only
echo -e "\n${GREEN}Building and deploying the frontend...${NC}"
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