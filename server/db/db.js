import pg from "pg"
import '../utils/env.js'

//Host/port were previously omitted entirely, so this only ever worked against a
//Postgres on the libpq defaults. DB_HOST/DB_PORT keep local and container setups working.
const pgClient = () => new pg.Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB
})

export default pgClient