export function calcAmountWithDecimals(amount, decimals) {
    return parseInt(amount) / 10**parseInt(decimals)
}