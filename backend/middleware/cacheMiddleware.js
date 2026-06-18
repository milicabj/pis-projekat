const redis = require("../cache/redisClient");

const cache = (keyPrefix) => async (req, res, next) => {
  const key = `${keyPrefix}:${req.originalUrl}`;

  const cached = await redis.get(key);
  if (cached) {
    res.set("X-Cache", "HIT");
    return res.json(JSON.parse(cached));
  }

  res.set("X-Cache", "MISS");

  const originalJson = res.json.bind(res);
  res.json = async (data) => {
    await redis.setex(key, 60, JSON.stringify(data));
    return originalJson(data);
  };

  next();
};

module.exports = cache;
