const modalOpen = document.getElementById("tournaments-btn")
const modalAdaptiveOpen = document.getElementById('menu-tournaments-btn-ton')
const modal = document.getElementById("leaderboard_modal")
const sevenleaderBtn = document.getElementById('sevenleader-btn')
const sevenleaderList = document.getElementById('sevenleader')
const thirtyleaderBtn = document.getElementById('thirtyleader-btn')
const thirtyleaderList = document.getElementById('thirtyleader')
const sevenleaderTable = document.getElementById("sevenleader-table")
const thirtyleaderTable = document.getElementById("thirtyleader-table")
const spanAirDrop = document.getElementsByClassName("close_modal_window")[5]
thirtyleaderList.style.display = 'none'
sevenleaderList.style.display = 'none'
modal.style.display = "none"

// modal.style.alignItems = "center";

modalOpen.onclick = async () => {
    thirtyleaderList.style.display = 'none'
    sevenleaderList.style.display = 'block'
    modal.style.display = "flex"
    modal.style.alignItems = "center";
}

modalAdaptiveOpen.onclick = async () => {
    thirtyleaderList.style.display = 'none'
    sevenleaderList.style.display = 'block'
    modal.style.display = "flex"
    modal.style.alignItems = "center";
}

spanAirDrop.onclick = function () {
    modal.style.display = "none";
}

fetch('/leaderboard/ton')
    .then(async (res) => {
        const data = await res.json()
        generateTable('sevenleader-tablebody', data.battleAllStatsWeek)
        generateTable('thirtyleader-tablebody', data.battleAllStatsMonth)
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

function generateTable(id, leaders) {
    const tbl = document.getElementById(id);
    // const tblBody = document.createElement("tbody");
    leaders.sort(function(a, b){
        return parseInt(b.wins) - parseInt(a.wins);
    });
    for (let i = 0; i < leaders.length; i++) {

      // creates a table row
        const _row = document.createElement("tr");

        const position = document.createElement("td");
        const positionText = document.createTextNode(`${i+1}`);
        position.appendChild(positionText)

        const _walletAddress = leaders[i].player.slice(0, 6) + '...' + leaders[i].player.slice(leaders[i].player.length - 4, leaders[i].player.length)
        const address = document.createElement("td");
        const link = document.createElement("a")
        link.textContent = `${_walletAddress}`
        link.target = "_blank"
        link.rel = "noreferrer"
        // link.href = `https://explorer.arbitrum.io/address/${leaders[i].player}`
        address.appendChild(link)

        const games = document.createElement("td");
        const gamesText = document.createTextNode(`${leaders[i].total_games}`);
        games.appendChild(gamesText)

        const wins = document.createElement("td");
        const winsText = document.createTextNode(`${leaders[i].wins}`);
        wins.appendChild(winsText)
        
        const tokens = document.createElement("td");
        const tokensText = document.createTextNode(`${leaders[i].amount_won.toFixed(2)}`);
        tokens.appendChild(tokensText)

        const kills = document.createElement("td");
        const killsText = document.createTextNode(`${leaders[i].total_kills}`);
        kills.appendChild(killsText)

        const deaths = document.createElement("td");
        const deathsText = document.createTextNode(`${leaders[i].total_deaths}`);
        deaths.appendChild(deathsText)

        _row.appendChild(position);
        _row.appendChild(address);
        _row.appendChild(games);
        _row.appendChild(wins);
        _row.appendChild(tokens);
        _row.appendChild(kills);
        _row.appendChild(deaths);

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