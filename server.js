// importing dependencies
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Pusher from "pusher";
import mongoMessages from "./MessageModel.js";

// app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1529307",
  key: "cd7d628b56aad27b9052",
  secret: "1b565392b8713ead213f",
  cluster: "ap2",
  useTLS: true
});

// middlewares
app.use(express.json());
app.use(cors());

// db config
const mongoURI =
  "mongodb+srv://admin:admin@cluster0.j6rg9ct.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(mongoURI);

mongoose.connection.once("open", () => {
  console.log("DB connected");

  const changeStream = mongoose.connection.collection("messages").watch();
  changeStream.on("change", (change) => {
    pusher.trigger("messages", "newMessage", {
      change: change,
    });
  });
});

// api routes
app.get("/", (req, res) => res.status(200).send("hello world"));

app.post("/save/message", (req, res) => {
  const dbMessage = req.body;

  mongoMessages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.get("/retreive/conversation", (req, res) => {
  mongoMessages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      data.sort((b, a) => {
        return a.timestamp - b.timestamp;
      });
      res.status(201).send(data);
    }
  });
});

// listen
app.listen(port, () => console.log(`listening on localhost:${port}`));
