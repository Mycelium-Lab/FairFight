async function main() {
    const signer = await hre.ethers.getSigner()
    const Game = await hre.ethers.getContractFactory("Game");
    // const fair = await Fair.deploy(
    //   '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4', //wallet
    //   300,  //3% fee to wallet
    //   10,  //second to finish game
    //   30,   //userGamesToReturnNumber
    // );
    const game = Game.attach('0x64BB70e1e2f776D95dE00676D8332e6aD5217195')
    await game.changeSigner('0xD32a4f0dFE804D10c6cC4fAA87cfdBDAE915A2E0')
    .then(() => {
        console.log(`Done`)
    })
}

main()
.catch((err) => console.error(err))

