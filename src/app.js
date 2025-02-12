import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'
const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credential:true
}))
app.use(cookieParser())
app.use(express.json({limit:"16kb"}));
app.use(express.static("public"));
app.use(express.urlencoded({
    limit:"16kb",
    extended:true
}))

import userRouter from './Routes/user.routes.js'

app.use("/api/v1/user",userRouter);

app.all("*", (req, res) => {
    res.status(404).json({
      status: "Fail",
      message: "Route not found",
    });
  });

export {app}

app.use((err, req, res, next) => {
    res.json({
      success: false,
      error: err.message,
    });
  });