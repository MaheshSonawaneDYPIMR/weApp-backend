
import { Redis } from "ioredis";



let redisClient;

(async () => {
  console.log("I am here",process.env.REDIS_HOST,process.env.REDIS_PORT,process.env.REDIS_PASSWORD);

  redisClient = new Redis({
     host: "192.168.1.104",
     port: "6379",
     password:"14377774449992",
     db:"0",
  });

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

export {redisClient}

