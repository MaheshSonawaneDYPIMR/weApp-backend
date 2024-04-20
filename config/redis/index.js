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
  redisClient = new Redis("redis://red-cohm85tjm4es739ba6u0:6379");
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
