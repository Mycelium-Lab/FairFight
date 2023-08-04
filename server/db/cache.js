import redis from "redis"

const cacheClient = () => redis.createClient({
    socket: {
        host: 'localhost',
        port: 6379
    }
})

export default cacheClient

