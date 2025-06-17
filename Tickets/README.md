# Smart Contracts Simplified: Ep. 5 - Smart Contracts Lab

This project is a simple demo that explains how a basic smart contract to mint NFTs works.  
**Episode 5** focuses on a NFT ticket smart contract that mints tokens as tickets for events.

## 🚀 Features

- Demonstrates a basic NFT smart contract
- Integrates with Alchemy to use an external blockchain
- Utilizes Pinata to upload metadata
- Simple frontend to interact with the contract

## 📦 Setup Instructions

Follow these steps to run the project locally:

### 🔑 Environment & API keys (do this first)

- **Create an Alchemy account and add the Holesky testnet**  
  1. Sign up at https://www.alchemy.com/ (free tier is fine).  
  2. In the dashboard click **Create App**, choose **Ethereum** → **Holesky**.  
  3. Make sure to select "Holesky" under "Network" and copy the **Network URL** – this will be your `ALCHEMY_API_KEY`.

- **Create a Pinata account**  
  1. Sign up at https://www.pinata.cloud/.  
  2. Go to **API Keys** → **New Key**, select *Admin* scope.  
  3. Copy the **API Key** and **Secret Key** – these will be your `PINATA_API_KEY` and `PINATA_SECRET_API_KEY`.

- **Prepare a wallet private key**  
  1. Use MetaMask (or any Ethereum wallet), switch to the **Holesky** testnet.  
  2. Fund the wallet with test ETH from a [Holesky faucet](https://holesky-faucet.pk910.de/).  
  3. Export and copy the wallet **private key** – this will be your `PRIVATE_KEY`.

---

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kalu-Bru/Tickets.git
   cd Tickets
   ```
2. **Generate a `.env` file from the terminal**
   ```bash
   # Paste your own keys in place of the placeholders ↓
   cat <<'EOF' > .env
   PRIVATE_KEY=YOUR_PRIVATE_KEY
   PINATA_SECRET_API_KEY=YOUR_PINATA_SECRET_API_KEY
   PINATA_API_KEY=YOUR_PINATA_API_KEY
   ALCHEMY_API_KEY=YOUR_ALCHEMY_API_KEY
   EOF

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Compile the contract**
   ```bash
   npx hardhat compile
   ```

5. **Start the app**
   ```bash
   node src/app
   ```

6. **Open your browser**
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
rm -rf Tickets
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
