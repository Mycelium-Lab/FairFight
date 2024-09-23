let mainMenuContent = document.querySelector(".ton__menu-content");
let gameMenuContent = document.querySelector(".opengame_content");
let newGameBtn = document.querySelector(".newgame_ton_btn");
// let mainMenuSMM = document.querySelector(".ton__menu-smm");

let 
    faqBtn = document.querySelector("#about_link"),
    backBtn = document.querySelector("#back_button");

let menuCharsPic = document.querySelector(".ton__menu-pic");

document.querySelector("#p2p_opener").onclick = openGameP2P;
document.querySelector("#f2p_opener").onclick = openGameF2P;

backBtn.onclick = openMainMenu;

function openMainMenu() {
    mainMenuContent.style.display = "flex";
    gameMenuContent.style.display = "none";
    
    newGameBtn.style.display = "none";
    faqBtn.style.display = "flex";
    backBtn.style.display = "none";

    menuCharsPic.setAttribute("src", "/media/game-ton-chars.png");
    menuCharsPic.classList.remove("next_step");

    document.querySelector(".wrapper__ton_container").style.backgroundPosition = "0 -5%";
    document.querySelector(".newgame_ton_btn").classList.remove("next_step");
    document.querySelector(".ton__content-inner").classList.remove("next_step");
}

function openGameP2P() {
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
}

function openGameF2P() {
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
}
