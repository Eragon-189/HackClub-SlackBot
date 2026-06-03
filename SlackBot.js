require("dotenv").config();
const axios = require("axios");

const { App } = require("@slack/bolt");

const app = new App({//define the app with the tokens and socket mode
  token: process.env.BOT_TOKEN,
  appToken: process.env.APP_TOKEN,
  socketMode: true
});
//add command listeners for the bot(ping)
app.command("/mb-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});
//add command listeners for the bot(help)
app.command("/mb-help", async ({ command, ack, respond }) => {
  await ack();
  await respond({ text: "Here are the available commands:\n- `/mb-ping`: Check the bot's latency\n- `/mb-help`: Show this help message\n- `/mb-ai`: Interact with the AI" });
});
//add command listeners for the bot(echo)
app.command("/mb-echo", async ({ command, ack, respond }) => {
  await ack();
  const text = command.text;
  await respond({ text: `${text}` });
});
app.command("/mb-ai", async ({ command, ack, respond }) => {
  await ack();
  const out = "";
  const text = command.text.toLowerCase();
  const ai = text.split("-")[0];
  const prompt = text.split("-")[1];
  await respond({ text: `${out}` });
});

(async () => {
  await app.start();
  console.log("Running!");
})();