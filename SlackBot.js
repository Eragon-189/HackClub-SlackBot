require("dotenv").config();
const axios = require("axios");
const { default: ModelClient, isUnexpected } = require("@azure-rest/ai-inference");
const { AzureKeyCredential } = require("@azure/core-auth");
const { App } = require("@slack/bolt");

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const model = "deepseek/DeepSeek-V3-0324";

const app = new App({//define the app with the tokens and socket mode
  token: process.env.BOT_TOKEN,
  appToken: process.env.APP_TOKEN,
  socketMode: true
});
app.error((error) => {
  console.error("Error in Slack app:", error);
});

//add command listeners for the bot(ping)
app.command("/eb-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Latency: ${latency}ms` });
});
//add command listeners for the bot(help)
app.command("/eb-help", async ({ command, ack, respond }) => {
  await ack();
  await respond({ text: "Here are the available commands:\n- `/mb-ping`: Check the bot's latency\n- `/mb-help`: Show this help message\n- `/mb-ai`: Interact with the AI" });
});
//add command listeners for the bot(echo)
app.command("/eb-echo", async ({ command, ack, respond }) => {
  await ack();
  const text = command.text;
  await respond({ text: `${text}` });
});
//ai command listener for the bot, this will send the prompt to the azure endpoint and return the response from the model
app.command("/eb-ai", async ({ command, ack, respond }) => {
  await ack();
  const prompt = command.text.toLowerCase();
  let out;

  try {
    const response = await axios.post(
      endpoint,
      {
        messages: [
          {role: "user", content: prompt }
        ],
        temperature: 0.5,
        top_p: 1.0,
        max_tokens: 1000,
        model: model
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }
    );

    out = response.data.choices[0].message.content;
  } catch (error) {
    if (error.response) {
      console.error("Error response:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
    out = `Sorry, there was an error processing your request.(Error: ${error.response.data})`;
  }

  await respond({ text: `${out}` });
});

(async () => {
  await app.start();
  console.log("Running!");
})();