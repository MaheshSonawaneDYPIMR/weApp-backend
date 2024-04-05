import express from 'express';
import { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();


app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);
app.use(express.static("public"));

app.use(cookieParser());



//setting of the routers
import healthChecker from "./routes/healthCheck.routes.js";
import userRouter from "./routes/user.routes.js";


app.use("/api/v1/healthCheck", healthChecker);
app.use("/api/v1/user", userRouter);

export { app };
