const modalOpen = document.getElementById("tournaments-btn")
const modal = document.getElementById("leaderboard_modal")
const sevenleaderBtn = document.getElementById('sevenleader-btn')
const sevenleaderList = document.getElementById('sevenleader')
const thirtyleaderBtn = document.getElementById('thirtyleader-btn')
const thirtyleaderList = document.getElementById('thirtyleader')
const sevenleaderMultiBtn = document.getElementById('sevenleader-multi-btn')
const sevenleaderMultiList = document.getElementById('sevenleader-multi')
const thirtyleaderMultiBtn = document.getElementById('thirtyleader-multi-btn')
const thirtyleaderMultiList = document.getElementById('thirtyleader-multi')
const sevenleaderTable = document.getElementById("sevenleader-table")
const thirtyleaderTable = document.getElementById("thirtyleader-table")
const spanAirDrop = document.getElementsByClassName("close_modal_window")[5]
thirtyleaderMultiList.style.display = 'none'
thirtyleaderList.style.display = 'none'
sevenleaderMultiList.style.display = 'none'
sevenleaderList.style.display = 'flex'
modal.style.display = "flex"

let network = 31337
if (window.location.search.includes('network')) {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  let networkID = params.network
  network = networkID
}

// modal.style.alignItems = "center";

modalOpen.onclick = async () => {
    thirtyleaderMultiList.style.display = 'none'
    thirtyleaderList.style.display = 'none'
    sevenleaderMultiList.style.display = 'none'
    sevenleaderList.style.display = 'block'
    modal.style.display = "flex"
    modal.style.alignItems = "center";
}

spanAirDrop.onclick = function () {
    modal.style.display = "none";
}

// fetch('/leaderboard' + `?chainid=${network}`)
//     .then(async (res) => {
        // const data = await res.json()
        const data = {
            leaderboard: [
                {
                    player: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
                    games: 2,
                    wins: 2,
                    amountwon: 3810,
                    period: 0,
                    chainid: 31337,
                    contract: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
                    kills: 2,
                    deaths: 0
                },
                {"player": "0x71be63f3384f5fb98995898a86b02fb2426c5788", "games": 1, "wins": 1, "amountwon": 0, "period": 3, "chainid": 31337, "contract": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", "kills": 0, "deaths": 1},
                {"player": "0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc", "games": 1, "wins": 1, "amountwon": 0, "period": 3, "chainid": 31337, "contract": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", "kills": 1, "deaths": 1},
                {"player": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", "games": 1, "wins": 1, "amountwon": 3810, "period": 3, "chainid": 31337, "contract": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", "kills": 1, "deaths": 0},
                {"player": "0x71be63f3384f5fb98995898a86b02fb2426c5788", "games": 2, "wins": 2, "amountwon": 0, "period": 1, "chainid": 31337, "contract": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", "kills": 0, "deaths": 2},
                {"player": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", "games": 2, "wins": 2, "amountwon": 3810, "period": 1, "chainid": 31337, "contract": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", "kills": 2, "deaths": 0},
                {"player": "0x71be63f3384f5fb98995898a86b02fb2426c5788", "games": 1, "wins": 1, "amountwon": 0, "period": 2, "chainid": 31337, "contract": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", "kills": 0, "deaths": 1},
                {"player": "0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc", "games": 1, "wins": 1, "amountwon": 0, "period": 2, "chainid": 31337, "contract": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", "kills": 1, "deaths": 1},
                {"player": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", "games": 1, "wins": 1, "amountwon": 3810, "period": 2, "chainid": 31337, "contract": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", "kills": 1, "deaths": 0},
                {"player": "0x71be63f3384f5fb98995898a86b02fb2426c5788", "games": 2, "wins": 2, "amountwon": 0, "period": 0, "chainid": 31337, "contract": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", "kills": 0, "deaths": 2},
            ]
            
        }
        data.leaderboard.sort(function(a, b){
            return parseInt(b.games) - parseInt(a.games);
        });
        generateTable(sevenleaderList, 0, data)
        generateTable(sevenleaderList, 1, data)
        generateTable(sevenleaderList, 2, data)
        generateTable(sevenleaderList, 3, data)
    // })
    // .then(() => {
        $('#sevenleader-table').DataTable()
        $('#thirtyleader-table').DataTable()
        $('#sevenleader-multi-table').DataTable()
        $('#thirtyleader-multi-table').DataTable()
    // })
    // .catch(err => console.error(err))

sevenleaderBtn.onclick = () => {
    thirtyleaderMultiList.style.display = 'none'
    thirtyleaderList.style.display = 'none'
    sevenleaderMultiList.style.display = 'none'
    sevenleaderList.style.display = 'block'
}
thirtyleaderBtn.onclick = () => {
    sevenleaderList.style.display = 'none'
    thirtyleaderList.style.display = 'block'
    sevenleaderMultiList.style.display = 'none'
    thirtyleaderMultiList.style.display = 'none'
}

sevenleaderMultiBtn.onclick = () => {
    thirtyleaderMultiList.style.display = 'none'
    thirtyleaderList.style.display = 'none'
    sevenleaderMultiList.style.display = 'block'
    sevenleaderList.style.display = 'none'
}
thirtyleaderMultiBtn.onclick = () => {
    sevenleaderList.style.display = 'none'
    thirtyleaderList.style.display = 'none'
    sevenleaderMultiList.style.display = 'none'
    thirtyleaderMultiList.style.display = 'block'
}

function generateTable(appendTo, period, data) {
    // creates a <table> element and a <tbody> element
    let id = 'sevenleader-tablebody'
    if (period == 1) id = 'thirtyleader-tablebody'
    if (period == 2) id = 'sevenleader-multi-tablebody'
    if (period == 3) id = 'thirtyleader-multi-tablebody'
    const tbl = document.getElementById(id);
    // const tblBody = document.createElement("tbody");
  
    const leaders = data.leaderboard.filter(v => v.period === period)

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
        link.href = `https://explorer.arbitrum.io/address/${leaders[i].player}`
        address.appendChild(link)

        const games = document.createElement("td");
        const gamesText = document.createTextNode(`${leaders[i].games}`);
        games.appendChild(gamesText)

        const wins = document.createElement("td");
        const winsText = document.createTextNode(`${leaders[i].wins}`);
        wins.appendChild(winsText)
        
        const tokens = document.createElement("td");
        const tokensText = document.createTextNode(`${leaders[i].amountwon}`);
        tokens.appendChild(tokensText)

        const kills = document.createElement("td");
        const killsText = document.createTextNode(`${leaders[i].kills}`);
        kills.appendChild(killsText)

        const deaths = document.createElement("td");
        const deathsText = document.createTextNode(`${leaders[i].deaths}`);
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