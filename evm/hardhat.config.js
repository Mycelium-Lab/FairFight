require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()
require("@openzeppelin/hardhat-upgrades");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    goerli: {
      url: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      chainId: 5,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  solidity: "0.8.16",
};
