const { upgrades, ethers } = require("hardhat")

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
async function main() {
    // const signer = await hre.ethers.getSigner()
    const Game = await hre.ethers.getContractFactory("GameV4");
    const game = Game.attach('0x09ED6f33Fb905883eb29Ca83f5E591a1DDB3fd25')
    Promise.all(
        [
            game.getChunkFinishedBattles(0, 10),
            game.getChunkFinishedBattles(1, 10),
            game.getChunkFinishedBattles(2, 10),
            game.getChunkFinishedBattles(3, 10),
            game.getChunkFinishedBattles(4, 10),
            game.getChunkFinishedBattles(5, 10),
            game.getChunkFinishedBattles(6, 10),
            game.getChunkFinishedBattles(7, 10),
            game.getChunkFinishedBattles(8, 10),
            game.getChunkFinishedBattles(9, 10),
            game.getChunkFinishedBattles(10, 10),
            game.getChunkFinishedBattles(11, 10),
            game.getChunkFinishedBattles(12, 10),
            game.getChunkFinishedBattles(13, 10),
            game.getChunkFinishedBattles(14, 10),
            game.getChunkFinishedBattles(15, 10),
            game.getChunkFinishedBattles(16, 10),
            game.getChunkFinishedBattles(17, 10),
            game.getChunkFinishedBattles(18, 10),
            game.getChunkFinishedBattles(19, 10),
            game.getChunkFinishedBattles(20, 10),
            game.getChunkFinishedBattles(21, 10),
            game.getChunkFinishedBattles(22, 10),
            game.getChunkFinishedBattles(23, 10),
            game.getChunkFinishedBattles(24, 10),
            game.getChunkFinishedBattles(25, 10),
            game.getChunkFinishedBattles(26, 10),
            game.getChunkFinishedBattles(27, 10),
            game.getChunkFinishedBattles(28, 10),
            game.getChunkFinishedBattles(29, 10),
            game.getChunkFinishedBattles(30, 10),
            game.getChunkFinishedBattles(31, 10),
            game.getChunkFinishedBattles(32, 10)
        ]
    )
    .then(v => {
        let addresses = []
        for (let i=0; i < v.length; i++) {
            for (let j = 0; j < v[i].length; j++) {
                addresses.push(v[i][j].player1)
                addresses.push(v[i][j].player2)
            }
        }
        return addresses
    })
    .then(v => {
        return v.filter(onlyUnique);
    })
    .then(async (unique) => {
        let busy = []
        for (let i = 0; i < unique.length; i++) {
            const isBusy = await game.currentlyBusy(unique[i])
            if (isBusy) {
                busy.push(unique[i])
            }
        }
        return busy
    })
    .then(async (busy) => {
        console.log(busy)
        for (let i = 0; i < busy.length; i++) {
            await game.changePlayerCurrentlyBusy(busy[i], false)
        }
        return busy
    })
    .then(async (busy) => {
        let _busy = []
        for (let i = 0; i < busy.length; i++) {
            const isBusy = await game.currentlyBusy(busy[i])
            console.log(isBusy, busy[i])
            if (isBusy) {
                _busy.push(busy[i])
            }
        }
        return _busy
    })
    .then((busy) => {
        console.log(busy)
    })
    // console.log(openBattles.length)
    // for (;;) {
    //     if (openBattles.length > 90) {
    //         openBattles = openBattles.filter(v => v.finished === false)
    //         break
    //     }
    // }
    // console.log(openBattles)
    // console.log(openBattles)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });