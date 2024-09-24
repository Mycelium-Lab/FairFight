
import { JoyStick } from './game/joystick.js';

const mobileAndTabletCheck = () => {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

$(document).ready(async function () {
    try {
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
        const fullScreen = () => {
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
        window.fullScreen = fullScreen
        const openFullScreenBtn = document.querySelector('#open-fullscreen-btn')
        openFullScreenBtn.addEventListener('click', fullScreen)
        const closeFullScreenBtn = document.querySelector('#close-fullscreen-btn')
        closeFullScreenBtn.addEventListener('click', fullScreen)
        let isMobile = mobileAndTabletCheck()
        const btnJump = document.querySelector('#jump-btn')
        const btnAttack = document.querySelector('#attack-btn')
        const btnLeft = document.querySelector('#left-btn')
        const btnRight = document.querySelector('#right-btn')
        if (isMobile) {
            fullScreen()
            btnAttack.style.display = ''
            const joystick = new JoyStick({
                radius: 40,
                x: 156,
                y: 335,
                inner_radius: 20,
                mouse_support: isMobile ? false : true
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
            const body = document.querySelector('body');
            const joystickBase = document.querySelector('#joystick-base')
            const joystickControl = document.querySelector('#joystick-control')
            // Flexible moving of joystick
            body.addEventListener('touchstart', function(event) {
                let touches = event.touches;
    
                if (touches.length > 0) {
                    let touch = touches[0];
                    let x = touch.clientX;
                    let y = touch.clientY;
                    if (touch.clientX < window.innerWidth / 2) {
                        joystickBase.style.left = `${parseInt(x) + joystick.radius}px`
                        joystickBase.style.top = `${parseInt(y)}px`
                        joystick.x = parseInt(x) + joystick.radius * 2
                        joystick.y = parseInt(y) + joystick.radius
                        joystickControl.style.left = `${parseInt(x) + joystick.inner_radius*3}px`
                        joystickControl.style.top = `${parseInt(y) + joystick.inner_radius}px`
                    }
                }
            });
              
            document.querySelector('#canvas-parent').style.display = 'block'
            const controlKeysModal = document.querySelector('#control_keys_mobile_modal')
            const closeControlKeysModal = document.querySelector('#close_control_keys_mobile_modal')
            closeControlKeysModal.addEventListener('click', () => {
                controlKeysModal.style.display = 'none'
            })
        }
        console.log('here')
    } catch (error) {
        console.log(error)
    }
})