const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
// const { Innertube } = require("youtubei.js");

router.get("/", async (req, res) => {
  res.render(__dirname + "/index.ejs");
});

router.get("/:username", async (req, res) => {
  const username = req.params.username;
  const key = process.env.YOUTUBE_KEY;
  // const innerTube = await Innertube.create(/* options */);
  const urlChannel = "https://youtube.googleapis.com/youtube/v3/channels";

  const id = await getChannelByHandle(username);
  const channelInfo = id != 0 ? await getChannelById(id) : { items: [] };

  async function getChannelByHandle(username) {
    try {
      const html = await(await fetch(`https://youtube.com/${username}`)).text()
      // const channelId = html.match(/(?<=channelId(":"|"\scontent="))[^"]+/g)[0];
      const channelId = html.match(/itemprop="url"\s*href="https:\/\/www\.youtube\.com\/channel\/([^"]+)"/)[1]
      console.log("Channel ID: ", channelId);
      return channelId;    

      // Using Youtubei.js library
      //const resolved = await innerTube.resolveURL(`https://youtube.com/${username}`);
      // console.log("Resolved:", resolved)
      // return resolved.payload.browseId;
    } catch (error) { 
      // console.log(error)
      // const errorMessage = JSON.parse(error.info);
      // console.log("Youtube: ", errorMessage.error.message);
      return 0;
    }
  }

  async function getChannelById(id) {
    try {
      const info = await (await fetch(`${urlChannel}?part=id,snippet&id=${id}&key=${key}`)).json();
      return await info;
    } catch (error) {
      // console.log("Youtube: ", error);
      return 0;
    }
  }

  const results = channelInfo.items[0] || {
    snippet: {
      publishedAt: null,
      channelId: null,
      title: null,
      description: null,
      thumbnails: {
        medium: {
          url: "https://www.c4ldas.com.br/api/youtube/not-found.png",
        },
      },
    },
  };
  const { title, description, publishedAt, thumbnails } = results.snippet;

  res.status(200).json({ channelId: id, title, description, publishedAt, thumbnails });
});

module.exports = router;
