// src/components/Header.js
import React from 'react';

const Header = ({ connectWallet, account }) => (
  <header>
    <h1>DeFi Lending Platform</h1>
    <button onClick={connectWallet}>
      {account ? `Connected: ${account}` : 'Connect Wallet'}
    </button>
  </header>
);

export default Header;