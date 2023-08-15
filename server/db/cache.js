import redis from "redis"
import dotenv from 'dotenv'
dotenv.config()

const cacheClient = () => redis.createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
})

export default cacheClient

