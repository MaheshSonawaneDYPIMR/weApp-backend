import { Redis } from "ioredis";

let redisClient;

(async () => {
  console.log(
    "I am here",
    process.env,
    process.env.REDIS_PORT,
    process.env.REDIS_PASSWORD
  );
if(!redisClient){
  redisClient = new Redis("rediss://red-cohtjjgl5elc73cu1m5g:iNmcXbzNfmFgNFqhFOycV8Jkz803XlFZ@oregon-redis.render.com:6379");
}
  

  redisClient.on("error", (error) => console.error(`Error: ${error.message}`));

  // Connect to Redis server
  try {
    await redisClient.connect();
    console.log("Redis client connected successfully.");
    // You can start using the redisClient for your operations here
  } catch (error) {
    console.error(`Error connecting to Redis: ${error.message}`);
    // Handle connection error gracefully
  }
})();

export { redisClient };
