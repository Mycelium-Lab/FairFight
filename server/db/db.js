import pg from "pg"
import dotenv from 'dotenv'
dotenv.config()

const pgClient = () => new pg.Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB
})

export default pgClient