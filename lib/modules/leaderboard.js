const modalOpen = document.getElementById("leaderboard-modal-open")
const modal = document.getElementById("leaderboard_modal")
const sevenleaderBtn = document.getElementById('sevenleader-btn')
const sevenleaderList = document.getElementById('sevenleader')
const thirtyleaderBtn = document.getElementById('thirtyleader-btn')
const thirtyleaderList = document.getElementById('thirtyleader')
const sevenleaderTable = document.getElementById("sevenleader-table")
const thirtyleaderTable = document.getElementById("thirtyleader-table")
const spanAirDrop = document.getElementsByClassName("close_modal_window")[5]
thirtyleaderList.style.display = 'none'

modalOpen.onclick = async () => {
    modal.style.display = "block"
}

spanAirDrop.onclick = function () {
    modal.style.display = "none";
}

fetch('/leaderboard')
    .then(async (res) => {
        const data = await res.json()
        data.leaderboard.sort(function(a, b){
            return parseInt(b.games) - parseInt(a.games);
        });
        generateTable(sevenleaderList, true, data)
        generateTable(sevenleaderList, false, data)
    })
    .then(() => {
        $('#sevenleader-table').DataTable()
        $('#thirtyleader-table').DataTable()
    })
    .catch(err => console.error(err))

sevenleaderBtn.onclick = () => {
    thirtyleaderList.style.display = 'none'
    sevenleaderList.style.display = 'block'
}
thirtyleaderBtn.onclick = () => {
    sevenleaderList.style.display = 'none'
    thirtyleaderList.style.display = 'block'
}

function generateTable(appendTo, isSeven, data) {
    // creates a <table> element and a <tbody> element
    const tbl = document.getElementById(isSeven ? 'sevenleader-tablebody' : 'thirtyleader-tablebody');
    // const tblBody = document.createElement("tbody");
  
    const perion = isSeven ? 0 : 1
    const leaders = data.leaderboard.filter(v => v.perion === perion)

    for (let i = 0; i < leaders.length; i++) {

      // creates a table row
        const _row = document.createElement("tr");

        const position = document.createElement("td");
        const positionText = document.createTextNode(`${i+1}`);
        position.appendChild(positionText)

        const _walletAddress = leaders[i].address.slice(0, 6) + '...' + leaders[i].address.slice(leaders[i].address.length - 4, leaders[i].address.length)
        const address = document.createElement("td");
        const link = document.createElement("a")
        link.textContent = `${_walletAddress}`
        link.target = "_blank"
        link.rel = "noreferrer"
        link.href = `https://explorer.emerald.oasis.dev/address/${leaders[i].address}`
        address.appendChild(link)

        const games = document.createElement("td");
        const gamesText = document.createTextNode(`${leaders[i].games}`);
        games.appendChild(gamesText)

        const wins = document.createElement("td");
        const winsText = document.createTextNode(`${leaders[i].wins}`);
        wins.appendChild(winsText)

        const kills = document.createElement("td");
        const killsText = document.createTextNode(`${leaders[i].kills}`);
        kills.appendChild(killsText)

        const tokens = document.createElement("td");
        const tokensText = document.createTextNode(`${leaders[i].amountwon}`);
        tokens.appendChild(tokensText)

        _row.appendChild(position);
        _row.appendChild(address);
        _row.appendChild(games);
        _row.appendChild(wins);
        _row.appendChild(kills);
        _row.appendChild(tokens);

        tbl.appendChild(_row);

    }

    //   // add the row to the end of the table body
    //   tblBody.appendChild(_row);
    
  
    // // put the <tbody> in the <table>
    // tbl.appendChild(tblBody);
    // appendTo.appendChild(tbl);
    // // sets the border attribute of tbl to '2'
    // tbl.setAttribute("border", "2");
  }