var walletConnet = false;
var INPUT_CONTAINER_ID = "input";
var INFO_ID = "info";
var CANVAS_ID = "canvas";
console.log("asdf");
var connenct = false;
if (connenct) {
  $(document).ready(function () {
    document.getElementById("name").disabled = false;
    document.getElementById("inputName").disabled = false;
    document.getElementById("createGame").disabled = false;
    document.getElementById("connect").disabled = true;
  });
}
if (!window.location.search) {
  $(document).ready(function () {
    var walletConnet = document.getElementById("connect");
    walletConnet.addEventListener("click", async function () {
      connenct = true;
      console.log("asdfasdfasdf");
      document.getElementById("name").disabled = false;
      document.getElementById("inputName").disabled = false;
      document.getElementById("createGame").disabled = false;
      document.getElementById("connect").disabled = true;
      document
        .getElementById("name")
        .addEventListener("click", async function () {
          window.location.search = document.getElementById("inputName").value;
        });
        document
        .getElementById("createGame")
        .addEventListener("click", async function () {
          window.location.search =  Math.random().toString(16).slice(-10);
        });
    });
  });

  //   window.location.search = roomName || Math.random().toString(16).slice(-10);
} else {
  $(document).ready(function () {
    document.getElementById("start").style.display = "none"; // hide
    document.getElementById("info").style.display = "inline";
    document.getElementById("canvas").style.display = "inline"; //
  });
}

var roomName = window.location.search;
