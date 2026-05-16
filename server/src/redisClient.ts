import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
            if (retries > 10) return new Error('Max retries reached');
            return Math.min(retries * 100, 3000);
        }
    }
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
};

export const clearCachePattern = async (pattern: string) => {
    try {
        if (!redisClient.isOpen) await connectRedis();
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log(`[Redis] Cleared ${keys.length} keys matching: ${pattern}`);
        }
    } catch (err) {
        console.error('Redis Clear Pattern Error:', err);
    }
}

export default redisClient;
