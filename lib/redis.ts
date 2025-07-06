import Redis from 'ioredis';

// Redis client configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

// Create Redis client instance
export const redisClient = new Redis(redisConfig);

// Handle Redis connection events
redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

/**
 * Set rate limit for an IP
 */
export async function setRateLimit(key: string, limit: number, window: number): Promise<void> {
  const multi = redisClient.multi();
  
  // Increment the counter for this IP
  multi.incr(key);
  
  // Set expiry if this is a new key
  multi.expire(key, window);
  
  await multi.exec();
}

/**
 * Get current rate limit count for an IP
 */
export async function getRateLimit(key: string): Promise<number> {
  const count = await redisClient.get(key);
  return parseInt(count || '0', 10);
}

/**
 * Clear rate limit for an IP
 */
export async function clearRateLimit(key: string): Promise<void> {
  await redisClient.del(key);
}
