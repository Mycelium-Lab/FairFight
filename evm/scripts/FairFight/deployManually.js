const { ethers } = require("hardhat");
const TransparentUpgradeableProxy = require('@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json');
const ProxyAdmin = require('@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json');

async function main() {
  const [acc1, acc2] = await ethers.getSigners();
  const chain = await ethers.provider.getNetwork();
  const chainid = chain.chainId;

  // Сначала создайте основной контракт "FairFight"
  const FairFight = await ethers.getContractFactory("FairFight");
  const fairFightImplementation = await FairFight.deploy({ nonce: await acc1.getTransactionCount() });

  await fairFightImplementation.deployed();

  console.log(`FairFight implementation deployed to ${fairFightImplementation.address}`);
  // Разверните proxyAdmin контракт
  const proxyAdmin = await ethers.getContractFactory(ProxyAdmin.abi, ProxyAdmin.bytecode, acc1);
  const proxyAdminInstance = await proxyAdmin.deploy({ nonce: await acc1.getTransactionCount() }); // acc1.address - это адрес администратора прокси

  await proxyAdminInstance.deployed();

  console.log(`ProxyAdmin deployed to ${proxyAdminInstance.address}`);

  // Затем создайте прокси-контракт
  const proxy = await ethers.getContractFactory(TransparentUpgradeableProxy.abi, TransparentUpgradeableProxy.bytecode, acc1);

  // Разверните прокси-контракт с указанием proxyAdmin контракта в качестве администратора
  const fairFightProxy = await proxy.deploy(
    fairFightImplementation.address, // Адрес основного контракта
    proxyAdminInstance.address, // Адрес proxyAdmin контракта
    [],
    { nonce: await acc1.getTransactionCount() }
  );

  await fairFightProxy.deployed();

  console.log("Proxy deployed to ", fairFightProxy.address);

  const fairFightInstance = new ethers.Contract(
    fairFightProxy.address,
    FairFight.interface,
    acc1
  );

  // Вызовите initializer функцию с необходимыми параметрами
  const initializeTx = await fairFightInstance.initialize(
    acc1.address, // signer
    10, // max rounds
    '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4', // fee address
    500, // fee
    ethers.utils.parseEther("0.0002"), // min amount for one round
    2, // max players
    { nonce: await acc1.getTransactionCount() }
  );

  await initializeTx.wait();
  console.log("Initialized");

  console.log(
    `FairFight proxy deployed to ${fairFightProxy.address} on chain ${chainid}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
