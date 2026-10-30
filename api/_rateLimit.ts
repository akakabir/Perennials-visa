// In-memory sliding window rate limiter with optional Upstash Redis fallback
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Periodically clean up expired keys
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    if (record.resetAt <= now) {
      memoryStore.delete(key);
    }
  }
}, 60000);

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  // If Upstash Redis is configured
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const sanitizedKey = `pv_rl:${key.replace(/[^a-zA-Z0-9_:-]/g, '_')}`;
      const res = await fetch(`${upstashUrl}/pipeline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${upstashToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([
          ['INCR', sanitizedKey],
          ['EXPIRE', sanitizedKey, windowSeconds]
        ])
      });

      if (res.ok) {
        const results = await res.json();
        const currentCount = results[0]?.result || 1;
        return {
          allowed: currentCount <= limit,
          remaining: Math.max(0, limit - currentCount)
        };
      }
    } catch (err) {
      console.warn('Upstash rate limit fallback to memory:', err);
    }
  }

  // Fallback to local in-memory sliding counter
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || record.resetAt <= now) {
    memoryStore.set(key, {
      count: 1,
      resetAt: now + windowSeconds * 1000
    });
    return { allowed: true, remaining: limit - 1 };
  }

  record.count += 1;
  return {
    allowed: record.count <= limit,
    remaining: Math.max(0, limit - record.count)
  };
}

export function getClientIp(req: any): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (forwarded) {
    const list = typeof forwarded === 'string' ? forwarded.split(',') : forwarded;
    return list[0].trim();
  }
  return req.socket?.remoteAddress || req.connection?.remoteAddress || '127.0.0.1';
}
