const Redis = require('ioredis');
const config = require('../config');

// Redis 클라이언트 생성
const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) return null; // 3회 실패 후 포기
    return Math.min(times * 200, 2000);
  }
});

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis error:', err.message);
});

// === 캐시 헬퍼 함수들 ===

const DEFAULT_TTL = 300; // 5분 (초)

/**
 * 캐시에서 가져오기. 없으면 fetcher 실행 후 저장.
 * @param {string} key - 캐시 키
 * @param {Function} fetcher - 캐시 미스 시 실행할 async 함수
 * @param {number} ttl - TTL (초), 기본 300
 */
async function cacheGet(key, fetcher, ttl = DEFAULT_TTL) {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error('Redis GET error:', err.message);
    // Redis 실패 시 DB에서 직접 가져감 (graceful degradation)
  }

  const data = await fetcher();

  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (err) {
    console.error('Redis SETEX error:', err.message);
  }

  return data;
}

/**
 * 특정 패턴의 캐시 무효화
 * @param {string} pattern - 글로브 패턴 (예: "cases:*")
 */
async function cacheInvalidate(pattern) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error('Redis invalidate error:', err.message);
  }
}

/**
 * 단일 키 삭제
 */
async function cacheDel(key) {
  try {
    await redis.del(key);
  } catch (err) {
    console.error('Redis DEL error:', err.message);
  }
}

module.exports = {
  redis,
  cacheGet,
  cacheInvalidate,
  cacheDel
};
