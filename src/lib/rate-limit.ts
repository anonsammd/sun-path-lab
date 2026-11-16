interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

// Clean expired records periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of loginAttempts.entries()) {
    if (now > record.resetAt) {
      loginAttempts.delete(ip);
    }
  }
}, 60 * 1000).unref();

export function checkLoginRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    return {
      allowed: true,
      remaining: MAX_ATTEMPTS,
      retryAfterSeconds: 0,
    };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - record.count,
    retryAfterSeconds: 0,
  };
}

export function recordFailedLogin(ip: string) {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
  } else {
    record.count += 1;
  }
}

export function clearLoginRateLimit(ip: string) {
  loginAttempts.delete(ip);
}
