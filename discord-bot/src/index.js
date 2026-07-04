require("dotenv").config();
const { Client, GatewayIntentBits, Events } = require("discord.js");
const axios = require("axios");
const { io } = require("socket.io-client");

const BACKEND_URL = process.env.BACKEND_URL || "http://server:5000";
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const ALERT_CHANNEL_ID = process.env.ALERT_CHANNEL_ID;
const PREFIX = "!";

const api = axios.create({ baseURL: `${BACKEND_URL}/api`, timeout: 5000 });

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});


function humanizeStatus(status) {
  const lines = status.rooms.map((r) => {
    const bits = [];
    if (r.fans.total > 0) bits.push(`${r.fans.on} fan${r.fans.on === 1 ? "" : "s"} ON`);
    if (r.lights.total > 0) bits.push(`${r.lights.on} light${r.lights.on === 1 ? "" : "s"} ON`);
    const summary = r.fans.on === 0 && r.lights.on === 0 ? "all off" : bits.join(", ");
    return `**${r.room}**: ${summary}`;
  });
  return `${lines.join("\n")}\n\nTotal power right now: **${status.totalPower}W**`;
}

function humanizeRoom(roomPayload) {
  const { room, devices } = roomPayload;
  const on = devices.filter((d) => d.status);
  if (on.length === 0) return `**${room}** — everything's off right now. 👍`;
  const details = on.map((d) => `${d.name} (${d.watt}W)`).join(", ");
  return `**${room}** — ON: ${details}. That's ${on.length} of ${devices.length} devices running.`;
}

function humanizeUsage(power) {
  return `Total power right now: **${power.totalPower}W**. Today's estimated usage: **${power.estimatedUsageTodayKWh} kWh**.`;
}


client.once(Events.ClientReady, (c) => {
  console.log(`[discord-bot] logged in as ${c.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const [command, ...args] = message.content.slice(PREFIX.length).trim().split(/\s+/);

  try {
    if (command === "status") {
      const { data } = await api.get("/status");
      await message.reply(humanizeStatus(data));
    } else if (command === "room") {
      const roomArg = args[0];
      if (!roomArg) {
        await message.reply("Usage: `!room <drawing|work1|work2>`");
        return;
      }
      const { data } = await api.get(`/rooms/${encodeURIComponent(roomArg)}`);
      await message.reply(humanizeRoom(data));
    } else if (command === "usage") {
      const { data } = await api.get("/power");
      await message.reply(humanizeUsage(data));
    }
  } catch (err) {
    const notFound = err.response && err.response.status === 404;
    await message.reply(
      notFound
        ? `Couldn't find that room. Try \`drawing\`, \`work1\`, or \`work2\`.`
        : `Hmm, couldn't reach the office backend right now. Try again in a bit.`
    );
    console.error(`[discord-bot] command '${command}' failed:`, err.message);
  }
});


function connectAlertStream() {
  const socket = io(BACKEND_URL, { reconnectionDelay: 2000 });

  socket.on("connect", () => console.log("[discord-bot] connected to backend socket for alerts"));
  socket.on("alertCreated", async (alert) => {
    if (!ALERT_CHANNEL_ID) return;
    try {
      const channel = await client.channels.fetch(ALERT_CHANNEL_ID);
      await channel.send(`⚠️ ${alert.message}`);
    } catch (err) {
      console.error("[discord-bot] failed to post alert to channel:", err.message);
    }
  });
}

client.login(DISCORD_TOKEN).catch((err) => {
  console.error("[discord-bot] failed to log in:", err.message);
  process.exit(1);
});
connectAlertStream();
