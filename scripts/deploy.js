   // scripts/deploy.js
   const hre = require("hardhat");

   async function main() {
     const [deployer] = await hre.ethers.getSigners();
     console.log("Deploying contracts with the account:", deployer.address);

     const Lending = await hre.ethers.getContractFactory("DecentralizedLending");
     const lending = await Lending.deploy();
     await lending.waitForDeployment(); // Use waitForDeployment instead of deployed

     const lendingAddress = await lending.getAddress();
     console.log("Lending contract deployed to:", lendingAddress);
   }

   main()
     .then(() => process.exit(0))
     .catch((error) => {
       console.error(error);
       process.exit(1);
     });