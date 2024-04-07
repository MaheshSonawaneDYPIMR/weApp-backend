import express from 'express';
import { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';

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
  urlencoded({
    extended: true,
    limit: "16kb",
  })
);
app.use(session({
  secret: 'asjfhskjdncxvknikdjh',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 86400000 } // Set session expiration to 24 hours (in milliseconds)
}));
app.use(express.static("public"));

app.use(cookieParser());



//setting of the routers
import healthChecker from "./routes/healthCheck.routes.js";
import userRouter from "./routes/user.routes.js";
import questionsRouter from "./routes/questions.routes.js"

app.use("/api/v1/healthCheck", healthChecker);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/question",questionsRouter)

export { app };
