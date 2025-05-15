// src/ethereum.js
import { ethers } from 'ethers';

const contractAddress = '0x5fbdb2315678afecb367f032d93f642f64180aa3'; // Replace with actual contract address
const contractABI = [
  // Replace with actual contract ABI
];

export const connectWallet = async () => {
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    return { provider, signer, contract };
  } else {
    alert('Please install MetaMask!');
    return null;
  }
};