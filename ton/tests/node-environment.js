/**
 * Jest test environment shim.
 *
 * Node >= 22 exposes a `localStorage` global whose getter throws
 * `SecurityError: Cannot initialize local storage without a --localstorage-file path`.
 * jest-environment-node enumerates every global at module load time, so simply
 * importing it crashes the whole test suite on modern Node.
 *
 * Removing the global before jest-environment-node is loaded avoids the getter.
 * Nothing in this project uses Web Storage.
 */
for (const name of ['localStorage', 'sessionStorage']) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
    if (descriptor && descriptor.configurable) {
        delete globalThis[name];
    }
}

module.exports = require('jest-environment-node').default;
