const Redis = require("ioredis");

let client = null;
let available = false;
let warningLogged = false;

const createClient = () => {
  client = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy: () => null
  });

  client.on("connect", () => {
    available = true;
    warningLogged = false;
    console.log("Redis povezan");
  });

  client.on("error", (err) => {
    available = false;
    if (!warningLogged) {
      console.warn(
        "Redis nije dostupan — keš isključen.",
        err.message || "Pokreni redis-server ili docker-compose."
      );
      warningLogged = true;
    }
  });

  client.connect().catch(() => {
    available = false;
  });
};

createClient();

const get = async (key) => {
  if (!available || !client) return null;
  try {
    return await client.get(key);
  } catch {
    available = false;
    return null;
  }
};

const setex = async (key, ttl, value) => {
  if (!available || !client) return;
  try {
    await client.setex(key, ttl, value);
  } catch {
    available = false;
  }
};

const del = async (key) => {
  if (!available || !client) return;
  try {
    await client.del(key);
  } catch {
    available = false;
  }
};

module.exports = {
  get,
  setex,
  del,
  isAvailable: () => available
};
