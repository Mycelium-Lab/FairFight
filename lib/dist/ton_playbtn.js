let mainMenuContent = document.querySelector(".ton__menu-content");
let gameMenuContent = document.querySelector("#open_game");
// let mainMenuSMM = document.querySelector(".ton__menu-smm");

let 
    faqBtn = document.querySelector("#about_link"),
    backBtn = document.querySelector("#back_button");

document.querySelector("#p2p_opener").onclick = openGameP2P;
document.querySelector("#f2p_opener").onclick = openGameF2P;

backBtn.onclick = openMainMenu;

function openMainMenu() {
    mainMenuContent.style.display = "flex";
    gameMenuContent.style.display = "none";
    
    faqBtn.style.display = "flex";
    backBtn.style.display = "none";
}

function openGameP2P() {
    mainMenuContent.style.display = "none";
    gameMenuContent.style.display = "flex";

    faqBtn.style.display = "none";
    backBtn.style.display = "block";
}

function openGameF2P() {
    mainMenuContent.style.display = "none";
    gameMenuContent.style.display = "flex";
    
    faqBtn.style.display = "none";
    backBtn.style.display = "block";
}
