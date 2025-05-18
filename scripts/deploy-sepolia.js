const hre = require("hardhat");

async function main() {
  console.log("Deploying DecentralizedLending contract to Sepolia...");

  // Get the contract factory
  const DecentralizedLending = await hre.ethers.getContractFactory("DecentralizedLending");
  
  // Deploy the contract
  const lending = await DecentralizedLending.deploy();
  
  // Wait for deployment to complete
  await lending.waitForDeployment();
  
  const contractAddress = await lending.getAddress();
  
  console.log(`DecentralizedLending deployed to: ${contractAddress}`);
  console.log("Transaction hash:", lending.deploymentTransaction().hash);
  
  console.log("\nVerification command:");
  console.log(`npx hardhat verify --network sepolia ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 