document.querySelector("#ton_faq_open").onclick = () => {
    document.querySelector("#about_modal").style.display = "flex";

    firstContent.style.display = "block";
    firstButton.style.display = "block";
    
    secondContent.style.display = "none";
    secondButton.style.display = "none";
};

document.querySelector("#about_modal").onclick = e => {
    if (e.target.classList.contains("modal")) {
        document.querySelector("#about_modal").style.display = "none";  
    }
};

let firstContent = document.querySelector(".about__content_first");
let firstButton = document.querySelector(".about__btn_next");

firstButton.onclick = () => {
    firstContent.style.display = "none";
    firstButton.style.display = "none";
    
    secondContent.style.display = "block";
    secondButton.style.display = "block";
}

let secondContent = document.querySelector(".about__content_next");
let secondButton = document.querySelector(".about__btn_control_keys");

let thirdContent = document.querySelector(".about__content_control_keys");

secondButton.onclick = () => {
    secondContent.style.display = "none";
    secondButton.style.display = "none";

    thirdContent.style.display = "block";
}
