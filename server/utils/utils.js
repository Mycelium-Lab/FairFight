import { createHmac} from 'crypto'

export function calcAmountWithDecimals(amount, decimals) {
    return parseInt(amount) / 10**parseInt(decimals)
}

export function checkSignatureTG (token, hash, checkString) {
    const secretKey = createHmac( "sha256", "WebAppData" ).update( token ).digest();
    const hmac = createHmac( "sha256", secretKey ).update( checkString ).digest( "hex" );
    return hmac === hash
}