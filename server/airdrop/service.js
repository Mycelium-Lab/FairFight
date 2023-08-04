import { checkIfAddressIsNotNew } from "../utils/airdropUtils.js";

//TODO: airdrop для мультичейна
export async function getAirDropSignature(address,typeOfWithdraw) {
    try {
        const isNotNew = await checkIfAddressIsNotNew(address)
        if (isNotNew) {
            const hashMessage = ethers.utils.solidityKeccak256(["uint160","uint160","string"], [airdropAddress, address, typeOfWithdraw])
            const sign = await signer.signMessage(ethers.utils.arrayify(hashMessage));
            const r = sign.substr(0, 66)
            const s = '0x' + sign.substr(66, 64);
            const v = parseInt("0x" + sign.substr(130,2));
            return {r, v, s}
        } else {
            return {r:'',v:'',s:''}
        }
    } catch (error) {
        console.error(error)
        return {r:'',v:'',s:''}
    }
}

export async function sendTokensFirstTime(req, res) {
    try {
        const alreadyGetFirstTokens = await airdropContract.alreadyGetFirstTokens(req.query.address)
        if (alreadyGetFirstTokens === false) {
            const sign = await getAirDropSignature(req.query.address, 'first')
            if (sign.r === '', sign.v === '', sign.s === '') {
                res.status(403).send('Insufficient wallet tx history')
            } else {
                await airdropContract.withdrawFirstTime(req.query.address, sign.r, sign.v, sign.s)
                    .then((tx) => tx.wait())
                    .then(() => {res.status(200).send('Success')})
                    .catch((err) => {
                        console.log(err)
                        res.status(500).send('Not success')
                    })
            }
        } else {
            res.status(403).send('Already get first tokens')
        }
    } catch (error) {
        console.log(error)
    }
}

export async function sendTokensSecondTime(req, res) {
    try {
        const alreadyGetPrizeTokens = await airdropContract.alreadyGetTokens(req.query.address)
        if (alreadyGetPrizeTokens === false) {
            const sign = await getAirDropSignature(req.query.address, 'second')
            if (sign.r === '', sign.v === '', sign.s === '') {
                res.status(403).send('Insufficient wallet tx history')
            } else {
                await airdropContract.withdraw(req.query.address, sign.r, sign.v, sign.s)
                    .then((tx) => tx.wait())
                    .then(() => {res.status(200).send('Success')})
                    .catch((err) => {
                        console.log(err)
                        if (err.error.reason && err.error.reason.includes('Not enough battles')) {
                            res.status(403).send('Not enough battles')
                        } else {
                            res.status(500).send('Not success')
                        }
                    })
            }
        } else {
            res.status(403).send('Already get prize tokens')
        }
    } catch (error) {
        console.log(error)
    }
}