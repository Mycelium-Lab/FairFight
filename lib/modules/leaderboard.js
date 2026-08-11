// Leaderboard modal, shared by both lobbies. The page declares its chain family on
// <body data-chain>; index.html predates the attribute, so EVM is the default.
const chains = {
    evm: {
        multiplayerPeriods: true,
        rankBy: 'games',
        explorerAddressUrl: (player) => `https://explorer.arbitrum.io/address/${player}`,
        load: loadEvm,
    },
    tvm: {
        multiplayerPeriods: false,
        rankBy: 'wins',
        // The settlement writer lower-cases players before INSERT and TON addresses are
        // case-significant, so the stored form does not resolve on an explorer.
        explorerAddressUrl: null,
        load: loadTon,
    },
}
const chain = chains[document.body.dataset.chain === 'tvm' ? 'tvm' : 'evm']

/*
LEADERBOARD PERIODS:
0 - week
1 - month
2 - weekMultiplayers
3 - monthMultiplayers
*/
const tabs = [
    {period: 0, btn: 'sevenleader-btn', list: 'sevenleader', body: 'sevenleader-tablebody', table: 'sevenleader-table'},
    {period: 1, btn: 'thirtyleader-btn', list: 'thirtyleader', body: 'thirtyleader-tablebody', table: 'thirtyleader-table'},
    {period: 2, btn: 'sevenleader-multi-btn', list: 'sevenleader-multi', body: 'sevenleader-multi-tablebody', table: 'sevenleader-multi-table', multiplayer: true},
    {period: 3, btn: 'thirtyleader-multi-btn', list: 'thirtyleader-multi', body: 'thirtyleader-multi-tablebody', table: 'thirtyleader-multi-table', multiplayer: true},
].filter(tab => chain.multiplayerPeriods || !tab.multiplayer)

const modal = document.getElementById("leaderboard_modal")
const modalOpen = document.getElementById("tournaments-btn")
const modalAdaptiveOpen = document.getElementById('menu-tournaments-btn-ton')
// The leaderboard modal's close span is the 6th on both pages and carries no id.
const closeBtn = document.getElementsByClassName("close_modal_window")[5]

showTab(null)
modal.style.display = "none"

const openModal = () => {
    showTab(tabs[0])
    modal.style.display = "flex"
    modal.style.alignItems = "center";
}
modalOpen.onclick = openModal
modalAdaptiveOpen.onclick = openModal

closeBtn.onclick = function () {
    modal.style.display = "none";
}

for (const tab of tabs) {
    document.getElementById(tab.btn).onclick = () => showTab(tab)
}

try {
    const leaders = await chain.load()
    // Stable sort over every period at once: filtering below keeps the order per tab.
    leaders.sort((a, b) => parseInt(b[chain.rankBy]) - parseInt(a[chain.rankBy]))
    for (const tab of tabs) {
        generateTable(tab.body, leaders.filter(v => v.period === tab.period))
        $('#' + tab.table).DataTable()
    }
} catch (err) {
    console.error(err)
}

function showTab(shown) {
    for (const tab of tabs) {
        document.getElementById(tab.list).style.display = tab === shown ? 'block' : 'none'
    }
}

async function loadEvm() {
    let network = 42161
    if (window.location.search.includes('network')) {
        const params = new URLSearchParams(window.location.search)
        network = params.get('network')
    }
    const res = await fetch('/leaderboard' + `?chainid=${network}`)
    const data = await res.json()
    return data.leaderboard.map(v => ({
        period: v.period,
        player: v.player,
        games: v.games,
        wins: v.wins,
        amountWon: v.amountwon,
        kills: v.kills,
        deaths: v.deaths,
    }))
}

async function loadTon() {
    const res = await fetch('/leaderboard/ton')
    const data = await res.json()
    // /leaderboard/ton pre-buckets by period and names its SQL aggregates differently.
    const normalize = (rows, period) => rows.map(v => ({
        period: period,
        player: v.player,
        games: v.total_games,
        wins: v.wins,
        amountWon: v.amount_won,
        kills: v.total_kills,
        deaths: v.total_deaths,
    }))
    return [
        ...normalize(data.battleAllStatsWeek, 0),
        ...normalize(data.battleAllStatsMonth, 1),
    ]
}

function generateTable(id, leaders) {
    const tbl = document.getElementById(id);
    for (let i = 0; i < leaders.length; i++) {
        const _row = document.createElement("tr");

        _row.appendChild(cell(`${i+1}`));
        _row.appendChild(addressCell(leaders[i].player));
        _row.appendChild(cell(`${leaders[i].games}`));
        _row.appendChild(cell(`${leaders[i].wins}`));
        _row.appendChild(cell(Number(leaders[i].amountWon).toFixed(2)));
        _row.appendChild(cell(`${leaders[i].kills}`));
        _row.appendChild(cell(`${leaders[i].deaths}`));

        tbl.appendChild(_row);
    }
}

function cell(text) {
    const td = document.createElement("td");
    td.appendChild(document.createTextNode(text))
    return td
}

function addressCell(player) {
    const td = document.createElement("td");
    const link = document.createElement("a")
    link.textContent = player.slice(0, 6) + '...' + player.slice(player.length - 4, player.length)
    link.target = "_blank"
    link.rel = "noreferrer"
    if (chain.explorerAddressUrl) link.href = chain.explorerAddressUrl(player)
    td.appendChild(link)
    return td
}
