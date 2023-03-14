const { ethers } = require("hardhat")
require('dotenv').config()
async function main() {
    let timestamps = []
    let providerEthereum = new ethers.providers.EtherscanProvider("homestead")
    let providerOptimism = new ethers.providers.EtherscanProvider("optimism")
    let historyEthereum = await providerEthereum.getHistory('0xA841a2a238Fa48D1C409D95E64c3F08d8Dd5DdA7')
    let historyOptimism = await providerOptimism.getHistory('0xA841a2a238Fa48D1C409D95E64c3F08d8Dd5DdA7')
    timestamps.push(historyEthereum[0] !== undefined ? historyEthereum[0].timestamp: 0)
    timestamps.push(historyOptimism[0] !== undefined ? historyOptimism[0].timestamp: 0)
    let historyBinance = await fetch(
                `https://api.bscscan.com/api?module=account&action=txlist&address=0x13d5BF04B0D393e0D026126bBDD44fC33e9A7555&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${process.env.BSCSCAN_API_KEY}`
            ).then(res => res.json()).catch(err => {return {result: []}})
    let historyPolygon = await fetch(
                `https://api.polygonscan.com/api?module=account&action=txlist&address=0x13d5BF04B0D393e0D026126bBDD44fC33e9A7555&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${process.env.POLYGONSCAN_API_KEY}`
            ).then(res => res.json()).catch(err => {return {result: []}})
    timestamps = [
        ...timestamps, 
        ...historyBinance.result.map(v => parseInt(v.timeStamp)), 
        ...historyPolygon.result.map(v => parseInt(v.timeStamp))
    ]
    console.log(Math.min.apply(null, timestamps.filter(Boolean)))
    // await fetch(
    //     `https://api.bscscan.com/api?module=account&action=txlist&address=0x13d5BF04B0D393e0D026126bBDD44fC33e9A7555&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${process.env.BSCSCAN_API_KEY}`
    // ).then(async (res) => {
    //     const result = (await res.json()).result
    //     timestamps.push(result[0] !== undefined ? result[0].timeStamp : 0)
    //     console.log(Math.min.apply(null, timestamps.filter(Boolean)))
    // }).catch(err => {
    //     console.err(err)
    //     console.log(Math.min.apply(null, timestamps.filter(Boolean)))
    // })
}

main().catch((error) => {
    console.error(error);
});
  