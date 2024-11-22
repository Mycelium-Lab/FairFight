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

// fetch('/api/leaderboard/ton')
//     .then(async (res) => {
        // const data = await res.json()
        // console.log(data)
        const data = {
            "battleAllStatsMonth": [
                {
                    "player": "eqbfhrfdxervfjuftqyfsa-4vpfto4lrrjxfcwpysebxf0uh",
                    "total_kills": "16",
                    "total_deaths": "8",
                    "wins": "5",
                    "total_games": "11",
                    "amount_won": 0.0121176
                },
                {
                    "player": "eqdsjd_csee4yirs67cmyk6t9ud9y1ry09oxa9eo12v5dijj",
                    "total_kills": "8",
                    "total_deaths": "9",
                    "wins": "5",
                    "total_games": "5",
                    "amount_won": 0.016156800000000002
                },
                {
                    "player": "eqclaaeqx0zpuxatjuno4o0ysqfmifpck8duooeaeps_ysvu",
                    "total_kills": "3",
                    "total_deaths": "1",
                    "wins": "3",
                    "total_games": "4",
                    "amount_won": 0.0015147
                },
                {
                    "player": "eqdjysdtovrxck1g71zg5_htgvolo5arvirfppi8xz7oww6f",
                    "total_kills": "0",
                    "total_deaths": "0",
                    "wins": "0",
                    "total_games": "2",
                    "amount_won": 0
                }
            ],
            "battleAllStatsWeek": [
                {
                    "player": "eqdsjd_csee4yirs67cmyk6t9ud9y1ry09oxa9eo12v5dijj",
                    "total_kills": "1",
                    "total_deaths": "4",
                    "wins": "2",
                    "total_games": "2",
                    "amount_won": 0.008078400000000001
                },
                {
                    "player": "eqbfhrfdxervfjuftqyfsa-4vpfto4lrrjxfcwpysebxf0uh",
                    "total_kills": "5",
                    "total_deaths": "3",
                    "wins": "1",
                    "total_games": "2",
                    "amount_won": 0.0020196000000000003
                }
            ]
        }
        generateTable('sevenleader-tablebody', data.battleAllStatsWeek)
        generateTable('thirtyleader-tablebody', data.battleAllStatsMonth)
    // })
    // .then(() => {
        $('#sevenleader-table').DataTable()
        $('#thirtyleader-table').DataTable()
    // })
    // .catch(err => console.error(err))

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