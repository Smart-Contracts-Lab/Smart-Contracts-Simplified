# Smart Contracts Simplified: Ep. 3 - Smart Contracts Lab

This project is a simple demo that explains how a basic smart contract with Chainlink VRF works.  
**Episode 3** focuses on a lottery smart contract that uses Chainlink Verifiable Random Function (VRF) to draw a randomized winner.

## 🚀 Features

- Demonstrates a basic Chainlink VRF smart contract
- Integrates with Hardhat for local blockchain simulation
- Simple frontend to interact with the contract

## 📦 Setup Instructions

Follow these steps to run the project locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kalu-Bru/Lottery.git
   cd Lottery
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a .env file in the parent directory and add a variable KEY_HASH of "0x" followed by a 64 characters hash ([generate random hash](https://www.browserling.com/tools/random-hex))**
   ```bash
   KEY_HASH="0xYOUR_GENERATED_HASH"
   ```
   
4. **Compile the contract**
   ```bash
   npx hardhat compile
   ```

5. **Start the app**
   ```bash
   node src/app
   ```

6. **In a separate terminal, start the local Hardhat node**
   ```bash
   cd Lottery
   npx hardhat node
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) and follow the instructions in the UI.

## 🧪 Tech Stack

- Node.js
- Hardhat
- Solidity
- JavaScript / EJS / CSS

## 📄 License

MIT License

## 🧹 Cleanup Instructions

Once you're done exploring the demo and want to remove everything:

### 1. Remove the cloned repository folder

From the parent directory where you cloned the project:
```bash
rm -rf Lottery
```


### 2. Uninstall globally installed dependencies (if any)

If you installed anything globally (optional), you can remove it like this:

```bash
npm uninstall -g hardhat
```

### 3. (Optional) Clear local node modules and lock file first

If you want to clean up without deleting the repo folder:

```bash
rm -rf node_modules package-lock.json
```

## ⚠️ Disclaimer

The smart contracts provided in this repository are simplified examples created for educational and demonstration purposes only. They are designed to run on a local blockchain node and are not intended for deployment to mainnet or handling real funds. Please do not use these contracts as-is in production environments. If you wish to experiment with smart contracts, always do so on a testnet and perform thorough testing and audits before considering any real-world use.
