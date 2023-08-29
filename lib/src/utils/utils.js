import { maps } from "../../modules/maps.js";

export function compareID(a, b) {
    return a.ID - b.ID;
}

export function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = a.getMonth() + 1;
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

export function shortFloat(value) {
  if (!Number.isInteger(value)) {
    let valueAsString = value.toFixed(10)
    return parseFloat(valueAsString)
  }
  return value
}

export const getMap = (ID) => {
  return maps.find(m => m.id === ID)
}

export const InventoryTypes = {
  CHARACTERS: "characters",
  WEAPONS: 'weapons',
  ARMORS: 'armors',
  BOOTS: 'boots'
}

export const ActionTypes = {
  TAKEOFF: 'TAKEOFF',
  TAKEON: 'TAKEON'
}

export const WalletTypes = {
  INJECTED: 'injected',
  WALLET_CONNECT: 'wallet_connect'
}

export const getAccountFromLocalStorage = () => {
  return localStorage.getItem('account')
}

export const getWalletTypeFromLocalStorage = () => {
  return localStorage.getItem('wallet_type')
}

export const addOnlyWalletToLocalStorage = (account) => {
  localStorage.setItem('account', account)
}

export const addWalletToLocalStorage = (account, wallet_type) => {
  localStorage.setItem('account', account)
  localStorage.setItem('wallet_type', wallet_type)
}

export const removeWalletFromLocalStorage = () => {
  localStorage.removeItem('account')
  localStorage.removeItem('wallet_type')
}

export const changeErrMessage = (err) => {
  console.log(err.message)
  if (err.message.includes('insufficient allowance')) {
      return 'Insufficient allowance'
  }
  if (err.message.includes("transfer amount exceeds balance")) {
      return `Token transfer amount exceeds balance`
  }
  return 'Something went wrong'
}