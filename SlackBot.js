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
async function AI(prompt) {
try {
  const client = ModelClient(
    endpoint,
    new AzureKeyCredential(token),
  );

  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        { role:"system", content: "Answer everything as best you can." },
        { role:"user", content: prompt }
      ],
      temperature: 0.8,
      top_p: 0.1,
      max_tokens: 2048,
      model: model
    }
  });
  console.log("Response from Azure endpoint:", response);
  const text = response.body.choices[0].message.content;
  console.log("output:", text);
  return text;
  } catch (error) {
    if (error.response) {
      console.error("Error response:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

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
  const out = await AI(prompt);
  await respond({ text: `${out}` });
});

(async () => {
  await app.start();
  console.log("Running!");
})();