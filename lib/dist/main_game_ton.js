(()=>{"use strict";const e=document.querySelector("#game-action");var t=null,n=null;var o=function(e){this.radius=e.radius||50,this.inner_radius=e.inner_radius||this.radius/2,this.x=e.x||0,this.y=e.y||0,this.mouse_support=e.mouse_support,this.maxOffsetX=this.radius/2,this.maxOffsetY=this.radius/2,void 0===e.visible&&(e.visible=!0),e.visible&&this.__create_fullscreen_div()};o.prototype.left=!1,o.prototype.right=!1,o.prototype.up=!1,o.prototype.down=!1,o.prototype.__is_up=function(e,t){return!(t>=0||Math.abs(e)>2*Math.abs(t))},o.prototype.__is_down=function(e,t){return!(t<=0||Math.abs(e)>2*Math.abs(t))},o.prototype.__is_left=function(e,t){return!(e>=0||Math.abs(t)>2*Math.abs(e))},o.prototype.__is_right=function(e,t){return!(e<=0||Math.abs(t)>2*Math.abs(e))},o.prototype.__create_fullscreen_div=function(){null===t&&((t=document.createElement("div")).className="joystick",(n=t.style).background="rgba(255,255,255,0)",n.position="relative",n.top="0px",n.bottom="0px",n.left="0px",n.right="0px",n.margin="0px",n.padding="0px",n.borderWidth="0px",n.zIndex="200",e.appendChild(t)),this.div=t,this.base=document.createElement("span"),this.base.id="joystick-base",(n=this.base.style).width=2.5*this.radius+"px",n.height=2.5*this.radius+"px",n.position="absolute",n.top=this.y-this.radius+"px",t.style.top="-"+n.top,n.left=this.x-this.radius+"px",t.style.left="-"+n.left,n.borderRadius="50%",n.borderColor="rgba(255,124,6,0.3)",n.backgroundColor="rgba(255,255,255,0.3)",n.borderWidth="4px",n.borderStyle="solid",this.div.appendChild(this.base),this.control=document.createElement("span"),this.control.id="joystick-control",(n=this.control.style).width=2.9*this.inner_radius+"px",n.height=2.9*this.inner_radius+"px",n.position="absolute",n.top=this.y-this.inner_radius+"px",n.left=this.x-this.inner_radius+"px",n.borderRadius="50%",n.backgroundColor="rgba(255,255,255,0.3)",n.borderWidth="3px",n.borderColor="rgba(255,124,6,0.3)",n.borderStyle="solid",this.div.appendChild(this.control);var o=this;function i(e){e.preventDefault();var t=e.changedTouches?e.changedTouches[0]:e;if(o.mouse_support&&1!==t.buttons)return;const n=document.getElementById("joystick-base").getBoundingClientRect(),i=n.x+40,s=n.y+40;var r=t.clientX-i,l=t.clientY-s;r=Math.max(-o.maxOffsetX,Math.min(o.maxOffsetX,r)),l=Math.max(-o.maxOffsetY,Math.min(o.maxOffsetY,l)),o.control.style.left=o.x-o.inner_radius+r+"px",o.control.style.top=o.y-o.inner_radius+l+"px";var c=t.clientX-i,a=t.clientY-s;o.up=o.__is_up(c,a),o.down=o.__is_down(c,a),o.left=o.__is_left(c,a),o.right=o.__is_right(c,a)}function s(){o.left=!1,o.right=!1,o.up=!1,o.down=!1,o.control.style.top=o.y-o.inner_radius+"px",o.control.style.left=o.x-o.inner_radius+"px"}this.bind("touchmove",i),this.bind("touchstart",i),this.bind("touchend",s),this.mouse_support&&(this.bind("mousedown",i),this.bind("mousemove",i),this.bind("mouseup",s))},o.prototype.bind=function(e,t){this.base.addEventListener(e,t),this.control.addEventListener(e,t)},$(document).ready((async function(){try{function n(e){return e.preventDefault(),e.stopPropagation(),!1}document.querySelector("#canvas").addEventListener("touchmove",n);let i=!1;const s=()=>{document.exitFullscreen?document.exitFullscreen():document.webkitExitFullscreen?document.webkitExitFullscreen():document.msExitFullscreen?document.msExitFullscreen():window.webkitCancelFullScreen?window.webkitCancelFullScreen():document.webkitExitFullscreen&&document.webkitExitFullscreen()},r=()=>{var e=document.documentElement;try{console.log(`requestFullscreen: ${e.requestFullscreen}`),console.log(`mozRequestFullScreen: ${e.mozRequestFullScreen}`),console.log(`webkitRequestFullscreen: ${e.webkitRequestFullscreen}`),console.log(`msRequestFullscreen: ${e.msRequestFullscreen}`),console.log(`window.webkitRequestFullscreen: ${window.webkitRequestFullscreen}`),console.log(`webkitEnterFullscreen: ${e.webkitEnterFullscreen}`),e.requestFullscreen?e.requestFullscreen():e.mozRequestFullScreen?e.mozRequestFullScreen():e.webkitRequestFullscreen?e.webkitRequestFullscreen():e.msRequestFullscreen?e.msRequestFullscreen():window.webkitRequestFullscreen?window.webkitRequestFullscreen(e):e.webkitEnterFullscreen&&e.webkitEnterFullscreen()}catch(e){console.log(e)}},l=()=>{i?(s(),i=!1,document.querySelector("#open-fullscreen-btn").style.display="block",document.querySelector("#close-fullscreen-btn").style.display="none"):(r(),i=!0,document.querySelector("#open-fullscreen-btn").style.display="none",document.querySelector("#close-fullscreen-btn").style.display="block")};window.fullScreen=l,document.querySelector("#open-fullscreen-btn").addEventListener("click",l),document.querySelector("#close-fullscreen-btn").addEventListener("click",l);let c=(()=>{let e=!1;var t;return t=navigator.userAgent||navigator.vendor||window.opera,(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(t)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(t.substr(0,4)))&&(e=!0),e})();const a=document.querySelector("#jump-btn"),u=document.querySelector("#attack-btn"),d=document.querySelector("#left-btn"),p=document.querySelector("#right-btn");if(c){l(),u.style.display="";const m=new o({radius:40,x:156,y:335,inner_radius:20,mouse_support:!c});var e=new TouchEvent("touchstart",{bubbles:!0,cancelable:!0,view:window}),t=new TouchEvent("touchend",{bubbles:!0,cancelable:!0,view:window});function h(){try{requestAnimationFrame(h),m.up&&(a.dispatchEvent(e),d.dispatchEvent(t),p.dispatchEvent(t)),m.left&&(a.dispatchEvent(t),d.dispatchEvent(e),p.dispatchEvent(t)),m.right&&(a.dispatchEvent(t),d.dispatchEvent(t),p.dispatchEvent(e)),m.base&&(a.dispatchEvent(t),d.dispatchEvent(t),p.dispatchEvent(t))}catch(e){}}h(),document.querySelector("#canvas-parent").style.display="block";const b=document.querySelector("#control_keys_mobile_modal");document.querySelector("#close_control_keys_mobile_modal").addEventListener("click",(()=>{b.style.display="none"})),document.querySelector("#map_ton_btn").addEventListener("click",(()=>{window.showMinimap=!window.showMinimap}))}}catch(w){console.log(w)}}))})();