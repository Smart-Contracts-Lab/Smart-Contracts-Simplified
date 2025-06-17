require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    holesky: {
      url: process.env.ALCHEMY_API_KEY,
      chainId: 17000,
      accounts: [ process.env.PRIVATE_KEY ]
    }
  }
};
