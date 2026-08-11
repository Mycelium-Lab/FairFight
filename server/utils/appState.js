import './env.js'

export const appState = process.env.APP_STATE || 'test'

export const appStateTypes = {
    test: 'test',
    prod: 'prod'
}