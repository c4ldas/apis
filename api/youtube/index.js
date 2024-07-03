const express = require("express");
const router = express.Router();
// const { Innertube } = require("youtubei.js");

// Index page
router.get("/", async (req, res) => {
  res.render(__dirname + "/index.ejs");
});

// Search video ID information
router.get("/search/:search", async (req, res) => {
  const videoId = req.params.search;
  const type = req.query.type || "json";
  const url = `https://www.youtube.com/oembed?url=www.youtube.com/watch?v=${videoId}&format=json`;

  try {    
    const data = await getVideoData(url, videoId, type);
    res.status(200).send(data);
    
  } catch (error) {
    // console.log("Error in router.get /search/:search: ", error);
    res.status(200).send(`Request failed.`);
  }
});

// Get user channel information
router.get("/:username", async (req, res) => {
  const username = req.params.username;
  const key = process.env.YOUTUBE_KEY;
  // const innerTube = await Innertube.create(/* options */);
  const url = "https://youtube.googleapis.com/youtube/v3/channels";

  const id = await getChannelByHandle(username);
  const channelInfo = id != 0 ? await getChannelById(id, url, key) : { items: [] };
  
  const results = await channelInfo.items[0] || {
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



async function getVideoData(url, videoId, type) {
  try {
    const dataRequest = await fetch(url);
    const data = await dataRequest.json();

    if(type == "json") {
      const { title, author_name, author_url, thumbnail_url } = data;
      return { title, author_name, author_url, thumbnail_url, video_url: `https://youtu.be/${videoId}` };
    }
    return (`${data.title} - https://youtu.be/${videoId}`);

  } catch (error) {
    // console.error(error);
    if(type == "json") {
      return { 
        error: {
          message: "Request Failed. Please check the video ID is correct or try again later.",
          video_id: `${videoId}`,
          code: 400
        }
      }
    }
    return `Request failed. Please check the video ID is correct or try again later. Video ID: ${videoId}`;
  }

};


async function getChannelByHandle(username) {
  try {
    const html = await (
      await fetch(`https://youtube.com/${username}`)
    ).text();
    // const channelId = html.match(/(?<=channelId(":"|"\scontent="))[^"]+/g)[0];
    const channelId = html.match(
      /itemprop="url"\s*href="https:\/\/www\.youtube\.com\/channel\/([^"]+)"/,
    )[1];
    // console.log("Channel ID: ", channelId);
    return channelId;

    // Using Youtubei.js library
    // const resolved = await innerTube.resolveURL(`https://youtube.com/${username}`);
    // console.log("Resolved:", resolved)
    // return resolved.payload.browseId;
  } catch (error) {
    // console.log(error)
    // const errorMessage = JSON.parse(error.info);
    // console.log("Youtube: ", errorMessage.error.message);
    return 0;
  }
}


async function getChannelById(id, url, key) {
  try {
    const info = await (await fetch(`${url}?part=id,snippet&id=${id}&key=${key}`)).json();
    // console.log("Info: ", info)
    return await info;
    
  } catch (error) {
    // console.log("Catch get ChannelById Youtube: ", error);
    return 0;
  }
}

module.exports = router;
