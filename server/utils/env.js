import dotenv from 'dotenv'

//Loads environment variables once, from a configurable location.
//
//The signing keys and the TON mnemonic live in this file. Keeping it inside the
//repository root means any file-read bug in the web server is a full key
//compromise, so deployments should set ENV_FILE to a path outside the served
//tree. Defaults to ./.env so existing local setups keep working.
dotenv.config(process.env.ENV_FILE ? { path: process.env.ENV_FILE } : {})

export default process.env
