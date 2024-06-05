const express = require("express"); // Express server
const app = express();
const cors = require("cors");
const fetch = require("node-fetch");
app.use(express.json());
app.use(cors());
app.set("view engine", "ejs");

// Blocking access for *.js files, except the frontend ones
app.use("/*.js", (req, res, next) => {
  const exceptionList = ["puuid.js", "verify.js", "index_front.js"];

  // Extract the filename from the request path
  const requestedFile = req.originalUrl.split("/").pop();

  // Check if the requested file is in the exception list
  if (exceptionList.includes(requestedFile)) {
    return next();
  }
  // If not in the exception list, deny access
  res.status(403).send("Forbidden");
});

app.use(express.static(__dirname));

// Database things
app.use("/api/database", require("./api/database"));

// Spotify things
app.use("/api/spotify", require("./api/spotify"));
app.use("/api/spotify/login", require("./api/spotify/login"));
app.use("/api/spotify/callback", require("./api/spotify/callback"));
app.use("/api/spotify/musica", require("./api/spotify/musica"));

// Steam things
app.use("/api/steam", require("./api/steam"));
app.use("/api/steam/game", require("./api/steam/game"));

// Valorant things
app.use("/api/valorant", require("./api/valorant"));
app.use("/api/valorant/rank", require("./api/valorant/rank"));
app.use("/api/valorant/schedule", require("./api/valorant/schedule"));
app.use("/api/valorant/history", require("./api/valorant/history"));

// Twitch things
app.use("/api/twitch", require("./api/twitch"));
app.use("/api/twitch/prediction", require("./api/twitch/prediction"));
app.use("/api/twitch/callback", require("./api/twitch/callback"));
app.use("/api/twitch/login", require("./api/twitch/login"));

// TFT things
app.use("/api/tft", require("./api/tft"));
app.use("/api/tft/rank", require("./api/tft/rank"));

// LOL things
app.use("/api/lol", require("./api/lol"));
app.use("/api/lol/rank", require("./api/lol/rank"));

// Youtube things
app.use("/api/youtube", require("./api/youtube"));

// Home page
app.get("/", async (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Home page
app.get("/old", async (req, res) => {
  res.sendFile(__dirname + "/index_old.html");
});

app.get("/api", async (req, res) => {
  res.redirect("../");
});

// Google robot verification
app.get("/robots.txt", async (req, res) => {
  res.sendFile(__dirname + "/robots.txt");
});

// Discord domain verification
app.get("/.well-known/discord", async (req, res) => {
  res.sendFile(__dirname + "/discord.txt")
})

app.post("/spell", async (req, res) => {
  console.log(req.body);
  console.log(typeof req.body);
  res.status(200).json(req.body);
});

// app.get('/teste', async (req, res) => {
//   const message = "hello, how are you?"
//   const seconds = 5
//     setTimeout( () => {
//     res.send(message)
//   }, seconds * 1000)
// })

// Starting server
const listener = app.listen(process.env.PORT, () => {
  console.log("Listening on port " + listener.address().port);

  // Starting my other repository seapi every 5 minutes
  setInterval(async () => {
    // fetch('https://seapi.c4ldas.com.br/ping')
    fetch("https://teste.spellfiretv.repl.co");
  }, 300000);
});
