async function main() {
    const signer = await hre.ethers.getSigner()
    const Game = await hre.ethers.getContractFactory("Game");
    // const fair = await Fair.deploy(
    //   '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4', //wallet
    //   300,  //3% fee to wallet
    //   10,  //second to finish game
    //   30,   //userGamesToReturnNumber
    // );
    const game = Game.attach('0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0')
    await game.changeSigner('0xAb1F38D350729e74B22E14e3254BaC70A10cb9e1')
    .then(() => {
        console.log(`Done`)
    })
}

main()
.catch((err) => console.error(err))

