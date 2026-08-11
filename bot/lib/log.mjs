// Logging for the sparring bot.
//
// The bot doubles as a teaching tool for the match protocol, so every socket
// frame is printed with its direction: `-->` is something the bot sent to the
// signalling server, `<--` is something the server sent back. Anything without
// an arrow is the bot narrating its own decisions.

const useColour = process.stdout.isTTY && !process.env.NO_COLOR

const paint = (code, s) => (useColour ? `[${code}m${s}[0m` : s)
const dim = s => paint('2', s)
const bold = s => paint('1', s)
const red = s => paint('31', s)
const green = s => paint('32', s)
const yellow = s => paint('33', s)
const blue = s => paint('34', s)
const magenta = s => paint('35', s)
const cyan = s => paint('36', s)

function stamp() {
    const d = new Date()
    const pad = (n, w = 2) => `${n}`.padStart(w, '0')
    return dim(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`)
}

// SDP blobs and ICE candidates are hundreds of bytes of noise in a terminal, so
// payloads get flattened and clipped. The full object is still one `--verbose`
// away when a protocol bug needs the detail.
function shorten(value, limit) {
    if (value === undefined) return ''
    let text
    try {
        text = typeof value === 'string' ? value : JSON.stringify(value)
    } catch {
        text = String(value)
    }
    if (text === undefined) return ''
    text = text.replace(/\s+/g, ' ')
    return text.length > limit ? `${text.slice(0, limit - 1)}…` : text
}

export function createLogger({ verbose = false, quiet = false } = {}) {
    const limit = verbose ? 4000 : 220
    const write = line => { if (!quiet) console.log(line) }

    return {
        verbose,
        // A line the dev is meant to act on.
        step: msg => write(`${stamp()} ${bold(msg)}`),
        info: msg => write(`${stamp()} ${msg}`),
        note: msg => write(`${stamp()} ${dim(msg)}`),
        warn: msg => write(`${stamp()} ${yellow('warn')}  ${msg}`),
        error: msg => console.error(`${stamp()} ${red('error')} ${msg}`),
        ok: msg => write(`${stamp()} ${green('ok')}    ${msg}`),
        // Frames the bot emitted.
        sent: (event, payload) => write(`${stamp()} ${cyan('-->')} ${bold(event)} ${dim(shorten(payload, limit))}`),
        // Frames the server pushed at the bot.
        recv: (event, payload) => write(`${stamp()} ${magenta('<--')} ${bold(event)} ${dim(shorten(payload, limit))}`),
        // Connection-level chatter.
        wire: msg => write(`${stamp()} ${blue('wire')}  ${msg}`),
        raw: line => write(line),
        blank: () => write('')
    }
}
