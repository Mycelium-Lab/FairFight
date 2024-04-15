#!/bin/bash

# Определение пути к папке "evm"
evm_directory="./evm"
main_directory="./"

# Открываем новое окно терминала и переходим в папку "evm", запуская команду npx hardhat node
xfce4-terminal --command "cd $evm_directory && npx hardhat node" &

# Ждем некоторое время, чтобы убедиться, что первая команда запущена
sleep 5

# Открываем новое окно терминала, переходим в папку "evm" и запускаем несколько команд
xfce4-terminal --command "cd $evm_directory && npx hardhat run scripts/FairFight/deployWithTestToken.js --network testnet; npx hardhat run scripts/FairFight/mintTestToken.js --network testnet; npx hardhat run scripts/FairFight/NFT/deployTest.js --network testnet; npx hardhat run scripts/Lootbox/deployTest.js --network testnet" &

# Открываем новое окно терминала и переходим в папку "evm", запуская команду npm run dev:se
xfce4-terminal --command "cd $main_directory && npm run dev:se" &

# Открываем новое окно терминала и переходим в папку "evm", запуская команду npm run dev:si
xfce4-terminal --command "cd $main_directory && npm run dev:si" &
