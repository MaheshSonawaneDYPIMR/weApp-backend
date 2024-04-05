import dotenv from "dotenv"
import {connectDB} from "./db/index.js"

import session from 'express-session';
import MongoStore from 'connect-mongo';

import {app} from "./app.js"

dotenv.config({
    path: "./.env"
});

connectDB().then(()=>{
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})

let store = new MongoStore({
    mongoUrl: process.env.MONGO_URI,
    collection: "sessions"
 });
 
  // session config
 
  app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: store,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
  }))