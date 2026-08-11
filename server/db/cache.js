import redis from "redis"
import '../utils/env.js'

//Was hardcoded to localhost:6379 while signalling/server.js read REDIS_HOST/REDIS_PORT,
//so the two processes could silently talk to different Redis instances.
const cacheClient = () => redis.createClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10)
    }
})

export default cacheClient

