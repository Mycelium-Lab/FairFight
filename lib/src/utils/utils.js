export function compareID(a, b) {
    return a.ID - b.ID;
}

export function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = a.getMonth();
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    let minutes;
    if (min < 10) {
      minutes = `0${min}`
    }
    if (min == 0) {
      minutes = `00`
    }
    if (minutes == undefined) {
      minutes = min
    }
    var time = `${date < 10 ? '0'+ date : date}` + '.' + `${month < 10 ? '0' + month : month}` + '.' + year + ' ' + `${hour == 0 ? '0': hour}` + ':' + minutes;
    return time;
}

export const addressMaker = (address) => {
    return address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length);  
}

export function calcAmountWithDecimals(amount, decimals) {
    return amount / 10**parseInt(decimals)
}

export function calcAmountWithDecimalsBig(amount, decimals) {
    return amount * 10**parseInt(decimals)
}

export function createShortAddress(address) {
    return address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length);
}