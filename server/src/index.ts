import express, { Express } from "express";
import { addPoll, clear, getResult, list, vote } from "./routes";
import bodyParser from "body-parser";

// Configure and start the HTTP server.
const port: number = 8088;
const app: Express = express();
app.use(bodyParser.json());
app.get("/api/result", getResult);
app.get("/api/list", list);
app.get("/api/clear", clear);
app.post("/api/add", addPoll);
app.post("/api/vote", vote);
app.listen(port, () => console.log(`Server listening on ${port}`));
