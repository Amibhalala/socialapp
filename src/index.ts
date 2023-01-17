import express, { Express } from "express";
import mongoose from "mongoose";
import todoRoutes from "./routes";
import bodyParser from "body-parser";
import cors from "cors";

const port: string | number = process.env.PORT || 8000;
const uri: string= String(process.env.MONGO_DB_URL);
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
import {requestRateLimiter} from "./middleware";
const app: Express = express();
app.use(cors())
app.use(bodyParser.json());
app.use(requestRateLimiter);
app.use(todoRoutes)
mongoose
  .connect(uri, {dbName:String(process.env.MONGO_DB),...options})
  .then(() =>
    app.listen(port, () =>
      console.log(`Server running on http://localhost:${port}`)
    )
  )
  .catch(error => {
    throw error
  })

module.exports = app;