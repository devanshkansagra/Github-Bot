const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const discordRoutes = require("./routes/discordRoutes");
const githubRoutes = require("./routes/githubRoutes");
const client = require('./bot');

const app = express();

const corsOptions = {
  origin: "http://api.github.com/",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

dotenv.config({ path: "./.env" });

const DB = process.env.DATABASE;

mongoose
  .connect(DB)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.log(error);
  });

client.once('ready', () => {
  console.log("Client is ready");
})

app.use("/discord", discordRoutes);
app.use("/github", githubRoutes);

app.get("/", (req, res) => {
  res.send("Hello world");
});

module.exports = app;
