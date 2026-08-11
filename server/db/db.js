import pg from "pg"
import '../utils/env.js'

const pgClient = () => new pg.Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB
})

export default pgClient