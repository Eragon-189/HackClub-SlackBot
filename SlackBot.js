require("dotenv").config();

const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.BOT_TOKEN,
  appToken: process.env.APP_TOKEN,
  socketMode: true
});

app.command("/mb-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});
app.command("/mb-help", async ({ command, ack, respond }) => {
  await ack();
  await respond({ text: "Here are the available commands:\n- `/mb-ping`: Check the bot's latency\n- `/mb-help`: Show this help message" });
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();