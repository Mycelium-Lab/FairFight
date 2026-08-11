// Match-page DOM chrome: the fullscreen toggle and the on-screen joystick.
// Both blocks existed verbatim in index_game.js and index_game_ton.js; this is a
// move, not a rewrite.

import { JoyStick } from './joystick.js';

let fullScreenOpen = false;

const closeFullScreen = () => {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    } else if (window.webkitCancelFullScreen) {
        window.webkitCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}

const openFullScreen = () => {
    var element = document.documentElement; // например, весь документ
    try {
        console.log(`requestFullscreen: ${element.requestFullscreen}`)
        console.log(`mozRequestFullScreen: ${element.mozRequestFullScreen}`)
        console.log(`webkitRequestFullscreen: ${element.webkitRequestFullscreen}`)
        console.log(`msRequestFullscreen: ${element.msRequestFullscreen}`)
        console.log(`window.webkitRequestFullscreen: ${window.webkitRequestFullscreen}`)
        console.log(`webkitEnterFullscreen: ${element.webkitEnterFullscreen}`)
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) { // для Firefox
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { // для Chrome, Safari и Opera
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { // для Internet Explorer
            element.msRequestFullscreen();
        } else if (window.webkitRequestFullscreen) {
            window.webkitRequestFullscreen(element);
        } else if (element.webkitEnterFullscreen) {
            element.webkitEnterFullscreen()
        }
    } catch (error) {
        console.log(error)
    }
}

// lib/game/main.js:339 calls this off the F key via window.fullScreen, so the
// entry has to publish it on window before the engine boots.
export const fullScreen = () => {
    if (!fullScreenOpen) {
        openFullScreen()
        fullScreenOpen = true
        document.querySelector('#open-fullscreen-btn').style.display = 'none'
        document.querySelector('#close-fullscreen-btn').style.display = 'block'
    } else {
        closeFullScreen()
        fullScreenOpen = false
        document.querySelector('#open-fullscreen-btn').style.display = 'block'
        document.querySelector('#close-fullscreen-btn').style.display = 'none'
    }
}

export function wireFullscreenButtons() {
    const openFullScreenBtn = document.querySelector('#open-fullscreen-btn')
    openFullScreenBtn.addEventListener('click', fullScreen)
    const closeFullScreenBtn = document.querySelector('#close-fullscreen-btn')
    closeFullScreenBtn.addEventListener('click', fullScreen)
}

export function installJoystick() {
    const btnJump = document.querySelector('#jump-btn')
    const btnAttack = document.querySelector('#attack-btn')
    const btnLeft = document.querySelector('#left-btn')
    const btnRight = document.querySelector('#right-btn')
    btnAttack.style.display = ''
    const joystick = new JoyStick({
        radius: 40,
        x: 156,
        y: 335,
        inner_radius: 20,
        mouse_support: false
    })
    var touchstartEvent = new TouchEvent("touchstart", {
        bubbles: true,
        cancelable: true,
        view: window
    })
    var touchendEvent = new TouchEvent("touchend", {
        bubbles: true,
        cancelable: true,
        view: window
    })
    function check() {
        try {
            requestAnimationFrame( check )

            if ( joystick.up ) {
                btnJump.dispatchEvent(touchstartEvent)
                btnLeft.dispatchEvent(touchendEvent)
                btnRight.dispatchEvent(touchendEvent)
            }
            if ( joystick.left ) {
                btnJump.dispatchEvent(touchendEvent)
                btnLeft.dispatchEvent(touchstartEvent)
                btnRight.dispatchEvent(touchendEvent)
            }
            if ( joystick.right ) {
                btnJump.dispatchEvent(touchendEvent)
                btnLeft.dispatchEvent(touchendEvent)
                btnRight.dispatchEvent(touchstartEvent)
            }
            if ( joystick.base ) {
                btnJump.dispatchEvent(touchendEvent)
                btnLeft.dispatchEvent(touchendEvent)
                btnRight.dispatchEvent(touchendEvent)
            }
        } catch (error) {

        }
    }
    check()
}
