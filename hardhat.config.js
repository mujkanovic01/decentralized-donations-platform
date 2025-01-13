require("@nomicfoundation/hardhat-toolbox");
const dotenv = require("dotenv");
dotenv.config({path: __dirname + '/.env'});
const { API_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: API_URL,
      accounts: [PRIVATE_KEY]
    }
  }
};