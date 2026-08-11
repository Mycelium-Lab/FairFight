//Run with: node server/utils/validation.test.mjs
//No test runner is wired up for the server, so this is deliberately dependency-free.
import path from 'path'
import { isValidAddress, isValidChainId, isValidImageType, safeJoin } from './validation.js'

const base = path.join(process.cwd(), 'media/characters')
let failed = 0
const check = (name, got, want) => {
    const ok = got === want
    if (!ok) failed++
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (got ${JSON.stringify(got)})`)
}

//typeofimage selects a directory name, so only the variants mixing.js writes are allowed.
check('typeofimage traversal rejected', isValidImageType('../../..'), false)
check('typeofimage null byte rejected', isValidImageType('main\0'), false)
check('typeofimage main accepted', isValidImageType('main'), true)
check('typeofimage preview accepted', isValidImageType('preview'), true)
check('typeofimage rival accepted', isValidImageType('rival'), true)

//address and chainid are interpolated into the filename.
check('address traversal rejected', isValidAddress('../../../../.env', 1), false)
check('address valid EVM accepted', isValidAddress('0x' + 'a'.repeat(40), 1), true)
check('address wrong length rejected', isValidAddress('0x' + 'a'.repeat(39), 1), false)
check('address non-string rejected', isValidAddress(undefined, 1), false)
check('TON address accepted on chain 0', isValidAddress('EQDeOj6G99zk7tZIxrnetZkzaAlON2YZj0aymn1SdTayohvZ', 0), true)
check('TON traversal rejected on chain 0', isValidAddress('../../.env', 0), false)
check('EVM address rejected on chain 0', isValidAddress('0x' + 'a'.repeat(40), 0), false)

check('chainid traversal rejected', isValidChainId('../..'), false)
check('chainid valid accepted', isValidChainId('42161'), true)
check('chainid negative rejected', isValidChainId('-1'), false)

//safeJoin is the backstop if a caller forgets to validate.
check('safeJoin blocks relative escape', safeJoin(base, '../../..', 'x.png'), null)
check('safeJoin blocks absolute escape', safeJoin(base, '/etc/passwd'), null)
check('safeJoin blocks dotdot in filename', safeJoin(base, 'players_main', '../../../.env'), null)
check('safeJoin allows legitimate path', typeof safeJoin(base, 'players_main', 'a_1.png'), 'string')
check('safeJoin result stays under base', (safeJoin(base, 'players_main', 'a_1.png') || '').startsWith(base), true)

//The shape of the original /getcharacterimage exploit.
check('full exploit chain blocked', safeJoin(base, 'players_../../..', '../../.env_1.png'), null)

console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`)
process.exit(failed === 0 ? 0 : 1)
