/*
 * Lobby chrome that has no chain in it.
 *
 * Everything here was written twice - once in the EVM entry and once in the TON
 * one - and the copies had drifted in small ways that nobody meant. The bet
 * totals were the worst of it: six near-copies of the same eight lines of
 * arithmetic, three of them in one file, differing only in a trailing space.
 */
import { shortFloat } from '../src/utils/utils.js'

export const isDesktop = window.innerWidth > 1024

/** The shared error modal. Both lobbies opened it by hand, identically. */
export const showError = (message) => {
    document.getElementById('error_modal').style.display = 'flex'
    document.getElementById('error_modal_text').textContent = message
}

/** The three create-game inputs, which both pages carry under the same ids. */
export const betForm = () => ({
    players: document.querySelector('#players-select-selected'),
    rounds: document.querySelector('#rounds-select-selected'),
    amount: document.getElementById('amountPerDeath'),
    mapId: () => document.querySelector('#map-select-selected').getAttribute('data-value'),
    roundsValue: () => document.querySelector('#rounds-select-selected').getAttribute('data-value'),
    playersValue: () => document.querySelector('#players-select-selected').getAttribute('data-value')
})

/**
 * The select widgets publish their choice as a `data-value` attribute rather
 * than an event, so the only way to hear about it is to watch the attribute.
 */
const onDataValue = (element, callback) => {
    new MutationObserver((mutations) => {
        mutations.forEach(async (mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-value') {
                await callback()
            }
        })
    }).observe(element, {attributes: true})
}

const setText = (element, text) => {
    element.textContent = text
    element.dataset.text = text
}

/**
 * Total prize pool and your deposit, recomputed whenever any of the three
 * inputs changes.
 *
 * `extra` is the part that is not arithmetic - on EVM it relabels the token and
 * re-reads the allowance to decide between "Create" and "Approve". It runs
 * after the totals, which is the order the EVM copy used, and only when the
 * form is complete, which is what all six copies did.
 *
 * The returned function recomputes on demand; callers use it to prime the
 * fields once the form has been populated from elsewhere.
 */
export const wireBetTotals = (form, extra) => {
    const totalPrizePool = document.getElementById('totalPrizePool')
    const yourDeposit = document.getElementById('yourDeposit')

    const filled = () =>
        form.roundsValue() != ''
        && form.amount.value != ''
        && form.playersValue() != ''

    const recompute = async () => {
        if (!filled()) {
            setText(totalPrizePool, '-')
            setText(yourDeposit, '-')
            return
        }
        const deposit = parseFloat(form.amount.value) * parseFloat(form.roundsValue())
        setText(totalPrizePool, `${shortFloat(deposit * parseInt(form.playersValue()))} `)
        setText(yourDeposit, `${shortFloat(deposit)}`)
        if (extra) await extra()
    }

    onDataValue(form.players, recompute)
    onDataValue(form.rounds, recompute)
    form.amount.addEventListener('input', recompute)
    return recompute
}

/**
 * Past-game rows open an info modal that re-renders the list into itself.
 *
 * The 300 ms delay is the original: the rows are appended asynchronously and
 * there is no signal for when the last one lands. Kept rather than fixed - the
 * fix belongs with the row builders, not here.
 */
export const wireInfoModal = (selector, rerender) => setTimeout(() => {
    try {
        const infoModal = document.getElementById('info_modal')
        document.querySelectorAll(selector).forEach((info) => {
            info.addEventListener('click', async (ev) => {
                infoModal.style.display = 'flex'
                localStorage.setItem('fight_id', ev.target.dataset.fight)
                await rerender()
            })
        })
    } catch (error) {
        console.log(error)
    }
}, 300)
