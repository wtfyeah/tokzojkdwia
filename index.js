require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");

/* =======================
   CONFIG
======================= */

const BASE_API = "https://api.donutsmp.net";

/* =======================
   DISCORD CLIENT
======================= */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

/* =======================
   DONUTSMP API HELPER
======================= */

async function api(path) {
  const res = await fetch(`${BASE_API}${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.DONUT_API_KEY}`
    }
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

async function getPlayer(username) {
  const lookup = await api(`/v1/lookup/${username}`);
  const stats = await api(`/v1/stats/${username}`);

  return {
    lookup: lookup.result,
    stats: stats.result
  };
}

/* =======================
   EMBED BUILDER
======================= */

async function buildPlayerEmbed(username) {
  const { lookup, stats } = await getPlayer(username);

  const kd =
    Number(stats.deaths) === 0
      ? stats.kills
      : (Number(stats.kills) / Number(stats.deaths)).toFixed(2);

  return new EmbedBuilder()
    .setColor(0xffb000)
    .setAuthor({
      name: `${lookup.username} — DonutSMP`,
      iconURL: `https://mc-heads.net/avatar/${lookup.username}/128`
    })
    .setThumbnail(`https://mc-heads.net/avatar/${lookup.username}/128`)
    .addFields(
      {
        name: "💰 Economy",
        value:
          `Balance: **${stats.money} 🍩**\n` +
          `Sell: **${stats.money_made_from_sell}**\n` +
          `Shop: **${stats.money_spent_on_shop}**`,
        inline: true
      },
      {
        name: "⚔️ Combat",
        value:
          `Kills: **${stats.kills}**\n` +
          `Deaths: **${stats.deaths}**\n` +
          `K/D: **${kd}**`,
        inline: true
      },
      {
        name: "🧱 World",
        value:
          `Broken: **${stats.broken_blocks}**\n` +
          `Placed: **${stats.placed_blocks}**\n` +
          `Mobs: **${stats.mobs_killed}**`,
        inline: true
      },
      {
        name: "⏱️ Progress",
        value:
          `Playtime: **${stats.playtime}**\n` +
          `Shards: **${stats.shards}**`,
        inline: true
      }
    )
    .setFooter({
      text: `Rank: ${lookup.rank} | Location: ${lookup.location}`
    })
    .setTimestamp();
}

/* =======================
   SIMPLE ANTI-SPAM CACHE
======================= */

const recent = new Map();

/* =======================
   WEBHOOK LISTENER
======================= */

client.on("messageCreate", async message => {
  if (!message.webhookId) return;
  if (!message.content) return;

  const username = message.content.trim();
  if (!username) return;

  // anti-spam (30s)
  if (recent.has(username)) return;
  recent.set(username, true);
  setTimeout(() => recent.delete(username), 30000);

  try {
    await message.delete().catch(() => {});
    const embed = await buildPlayerEmbed(username);
    await message.channel.send({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    await message.channel.send("❌ Player not found or API error");
  }
});

/* =======================
   LOGIN
======================= */

client.login(process.env.DISCORD_TOKEN);

const http = require("http");

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("ok");
}).listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
