require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/YOUR_API_KEY",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};