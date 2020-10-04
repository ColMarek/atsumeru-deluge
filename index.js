require("dotenv").config();
const fastify = require("fastify")();
const path = require("path");
const dayjs = require("dayjs");
dayjs.extend(require("dayjs/plugin/relativeTime"));
const axios = require("axios").default;
const fs = require("fs");
const parseTorrent = require("parse-torrent");

const port = process.env.PORT || 3000;
const delugePassword = process.env.DELUGE_PASSWORD;
const delugeAddress = process.env.DELUGE_ADDRESS;
let cookie = "";

const { AtsumeruCore } = require("atsumeru-core");
const atsumeruCore = new AtsumeruCore(".");

fastify.addHook("onRequest", (req, _reply, done) => {
  console.log(`${req.raw.method} ${req.raw.url}`);
  done();
});

fastify.register(require("point-of-view"), {
  engine: {
    ejs: require("ejs")
  },
  root: path.join(__dirname, "views")
});

fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/public/" // optional: default '/'
});

fastify.get("/", async (_req, reply) => {
  let feed = await atsumeruCore.getFeedWithDetail();
  feed = feed.map(f => ({
    ...f,
    formattedDate: dayjs.unix(f.date).fromNow(),
    onClick: `download("${f.link}")`
  }));
  reply.view("index.ejs", { feed, delugeAddress });
});

fastify.get("/api/feed", async () => {
  const feedDetail = await atsumeruCore.getFeedWithDetail();
  return feedDetail;
});

fastify.post("/api/torrent", async request => {
  const link = JSON.parse(request.body).link;
  const magnet = await getTorrentMagnet(link);

  const res = await axios.post(
    delugeAddress,
    {
      id: 1,
      method: "core.add_torrent_magnet",
      params: [magnet, {}]
    },
    {
      headers: {
        cookie,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      withCredentials: true
    }
  );

  return res.data;
});

fastify.get("/api/deluge", async () => {
  const res = await axios.post(
    delugeAddress,
    {
      id: 1,
      method: "web.update_ui",
      params: [[], []]
    },
    {
      headers: {
        cookie,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      withCredentials: true
    }
  );

  return res.data;
});

fastify.listen(port, "0.0.0.0", function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});

getCookie();

async function getCookie() {
  const res = await axios.post(
    delugeAddress,
    {
      id: 1,
      method: "auth.login",
      params: [delugePassword]
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      withCredentials: true
    }
  );

  cookie = res.headers["set-cookie"][0];
}

async function getTorrentMagnet(link) {
  console.log(`Fetching torrent file '${link}'`);
  const response = await axios({ method: "GET", url: link, responseType: "stream" });

  return new Promise(resolve => {
    const tempTorrentPath = "./temp.torrent";
    console.log(`Saving temporary torrent to ${tempTorrentPath}`);
    const stream = response.data.pipe(fs.createWriteStream(tempTorrentPath));
    stream.on("finish", () => {
      const torrentData = parseTorrent(fs.readFileSync(tempTorrentPath));
      fs.unlinkSync(tempTorrentPath);
      console.log("Deleted temporary torrent");
      const magnetUri = parseTorrent.toMagnetURI(torrentData);
      resolve(magnetUri);
    });
  });
}
