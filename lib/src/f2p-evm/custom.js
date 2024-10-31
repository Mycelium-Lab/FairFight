let mainMenuContent = document.querySelector(".ton__menu-content");
let gameMenuContent = document.querySelector(".opengame_content");
let newGameBtn = document.querySelector(".newgame_ton_btn");
const f2p_checker = document.querySelector('#f2p_checker')
const games_checker = document.querySelector('#games_checker')
const opengames_empty = document.querySelector('#opengames-empty')
const opengames = document.querySelector('#opengames')
const pastgames = document.querySelector('#pastgames')

const games_checker_f2p = document.querySelector('#games_checker-f2p')
const opengames_empty_f2p = document.querySelector('#opengames-empty-f2p-evm')
const opengames_f2p = document.querySelector('#opengames-f2p-evm')
const pastgames_f2p = document.querySelector('#pastgames-f2p-evm')
// let mainMenuSMM = document.querySelector(".ton__menu-smm");
const totalPrizePool = document.querySelector("#total-prize-pool-element");
const yourDepositElement = document.querySelector("#your-deposit-element");
const tokenF2PDivider = document.querySelector("#tokens-divider");
const tokensF2P = document.querySelector("#tokens-newgame-modal");

let 
    faqBtn = document.querySelector("#about_link"),
    backBtn = document.querySelector("#back_button"),
    disconnectBtn = document.querySelector("#disconnect");

let menuCharsPic = document.querySelector(".ton__menu-pic");

// console.log(document.querySelector("#p2p_opener"))

document.querySelector("#p2p_opener").onclick = openGameP2P;
document.querySelector("#f2p_opener").onclick = openGameF2P;

let connectTonBtn = document.querySelector("#connect");
let f2pBalanceBtn = document.querySelector("#f2p_balance");

backBtn.onclick = openMainMenu;

document.querySelector('#opengames-f2p-btn').addEventListener('click', () => {
    opengames_f2p.style.display = ''
    pastgames_f2p.style.display = 'none'
})
document.querySelector('#pastgames-f2p-btn').addEventListener('click', () => {
    pastgames_f2p.style.display = ''
    opengames_f2p.style.display = 'none'
})

function openMainMenu() {
    mainMenuContent.style.display = "flex";
    gameMenuContent.style.display = "none";
    // connectTonBtn.style.display = "";
    f2pBalanceBtn.style.display = "none";
    disconnectBtn.style.display = 'flex';
    
    newGameBtn.style.display = "none";
    faqBtn.style.display = "flex";
    backBtn.style.display = "none";

    menuCharsPic.setAttribute("src", "/media/game-ton-chars.png");
    menuCharsPic.classList.remove("next_step");

    document.querySelector(".wrapper__ton_container").style.backgroundPosition = "0 -5%";
    document.querySelector(".newgame_ton_btn").classList.remove("next_step");
    document.querySelector(".ton__content-inner").classList.remove("next_step");

    // Switching tabname to default after quiting back to main menu
    document.querySelector("#games_checker #opengames-btn").click();
    document.querySelector("#games_checker-f2p #opengames-f2p-btn").click();
}

function openGameP2P() {
    f2p_checker.checked = false
    totalPrizePool.style.display = ''
    yourDepositElement.style.display = ''
    tokenF2PDivider.style.display = ''
    tokensF2P.style.display = ''
    mainMenuContent.style.display = "none";
    gameMenuContent.style.display = "flex";

    newGameBtn.style.display = "block";
    faqBtn.style.display = "none";
    backBtn.style.display = "block";
    
    menuCharsPic.setAttribute("src", "/media/game-ton-chars-alt.png");
    menuCharsPic.classList.add("next_step");

    document.querySelector(".wrapper__ton_container").style.backgroundPosition = "0 -50%";
    document.querySelector(".newgame_ton_btn").classList.add("next_step");
    document.querySelector(".ton__content-inner").classList.add("next_step");
    games_checker.style.display = ''
    // opengames_empty.style.display = ''
    opengames.style.display = ''
    pastgames.style.display = 'none'
    // btnMobile.style.display = ''
    games_checker_f2p.style.display = 'none'
    // opengames_empty_f2p.style.display = 'none'
    opengames_f2p.style.display = 'none'
    pastgames_f2p.style.display = 'none'
}

function openGameF2P() {
    connectTonBtn.style.display = "none";
    f2pBalanceBtn.style.display = "";
    f2p_checker.checked = true
    totalPrizePool.style.display = 'none'
    yourDepositElement.style.display = 'none'
    tokenF2PDivider.style.display = 'none'
    tokensF2P.style.display = 'none'
    mainMenuContent.style.display = "none";
    gameMenuContent.style.display = "flex";
    disconnectBtn.style.display = 'none';
    
    newGameBtn.style.display = "block";
    faqBtn.style.display = "none";
    backBtn.style.display = "block";
    
    menuCharsPic.setAttribute("src", "/media/game-ton-chars-alt.png");
    menuCharsPic.classList.add("next_step");

    document.querySelector(".wrapper__ton_container").style.backgroundPosition = "0 -50%";
    document.querySelector(".newgame_ton_btn").classList.add("next_step");
    document.querySelector(".ton__content-inner").classList.add("next_step");
    // btnMobileF2P.style.display = 'none'
    games_checker.style.display = 'none'
    // opengames_empty.style.display = 'none'
    opengames.style.display = 'none'
    pastgames.style.display = 'none'
    // btnMobile.style.display = 'none'
    games_checker_f2p.style.display = ''
    // opengames_empty_f2p.style.display = ''
    opengames_f2p.style.display = ''
    pastgames_f2p.style.display = 'none'
}


let firstContent = document.querySelector(".about__content_first");
let firstButton = document.querySelector(".about__btn_next");

let secondContent = document.querySelector(".about__content_next");
let secondButton = document.querySelector(".about__btn_control_keys");

let thirdContent = document.querySelector(".about__content_control_keys");

document.querySelector("#about_link").onclick = () => {
    document.querySelector("#about_modal").style.display = "flex";

    firstContent.style.display = "block";
    firstButton.style.display = "block";
    
    secondContent.style.display = "none";
    secondButton.style.display = "none";
};

document.querySelector("#about_modal").onclick = e => {
    if (e.target.classList.contains("modal")) {
        document.querySelector("#about_modal").style.display = "none";

        firstContent.style.display = "block";
        secondContent.style.display = "none";
        thirdContent.style.display = "none";
    }
};
document.querySelector("#close-modal-window-about").onclick = e => {
    document.querySelector("#about_modal").style.display = "none";
    firstContent.style.display = "block";
    secondContent.style.display = "none";
    thirdContent.style.display = "none";
};


firstButton.onclick = () => {
    firstContent.style.display = "none";
    firstButton.style.display = "none";
    
    secondContent.style.display = "block";
    secondButton.style.display = "block";
}

secondButton.onclick = () => {
    secondContent.style.display = "none";
    secondButton.style.display = "none";

    thirdContent.style.display = "block";
}
