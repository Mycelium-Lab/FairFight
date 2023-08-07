#!/bin/bash

# Определение пути к папке "evm"
evm_directory="./evm"
main_directory="./"

# Открываем новое окно терминала и переходим в папку "evm", запуская команду npx hardhat node
gnome-terminal -- bash -c "cd $evm_directory && npx hardhat node" &

# Ждем некоторое время, чтобы убедиться, что первая команда запущена
sleep 5

# Открываем новое окно терминала, переходим в папку "evm" и запускаем несколько команд
gnome-terminal -- bash -c "cd $evm_directory && npx hardhat run scripts/FairFight/deployWithTestToken.js --network testnet; npx hardhat run scripts/FairFight/mintTestToken.js --network testnet; npx hardhat run scripts/FairFight/NFT/deployTest.js --network testnet" &

# Ждем некоторое время
sleep 5

# Открываем новое окно терминала и переходим в папку "evm", запуская команду npm run dev:se
gnome-terminal -- bash -c "cd $main_directory && npm run dev:se" &

# Ждем некоторое время
sleep 5

# Открываем новое окно терминала и переходим в папку "evm", запуская команду npm run dev:si
gnome-terminal -- bash -c "cd $main_directory && npm run dev:si" &
