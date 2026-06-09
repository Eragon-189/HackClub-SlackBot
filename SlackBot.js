require("dotenv").config();
const axios = require("axios");

const { default: ModelClient, isUnexpected } = require("@azure-rest/ai-inference");
const { AzureKeyCredential } = require("@azure/core-auth");
const { App } = require("@slack/bolt");

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";

const app = new App({//define the app with the slack tokens and socket mode
  token: process.env.BOT_TOKEN,
  appToken: process.env.APP_TOKEN,
  socketMode: true
});
app.error((error) => {
  console.error("Error in Slack app:", error);
});
async function AI(myPrompt, myModel) {
try {
  const client = ModelClient(
    endpoint,
    new AzureKeyCredential(token),
  );

  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        { role:"system", content: "Answer everything as best you can." },
        { role:"user", content: myPrompt }
      ],
      temperature: 0.8,
      top_p: 0.1,
      max_tokens: 2048,
      model: myModel
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

function CorrectModelName(model) {//check if model is valid and return correct model name for azure endpoint


if (model === "ds-v3" || model === "deepseek-v3") {//make model abrv into model name for azure endpoint 
    model = "deepseek/DeepSeek-V3-0324"
  }else if (model === "ms-3.1" || model === "mistral-small-3.1") {
    model = "mistral-ai/mistral-small-2503"

  }else if (model === "mm-3" || model === "mistral-medium-3") {
    model = "mistral-ai/mistral-medium-2505"
    
  }else{//not valid model retun error
    model = ""
  }
  return model  
}

//add command listeners for the bot(ping)
app.command("/eb-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  console.log("Ping command received");
  const latency = Date.now() - start;
  await respond({ text: `Latency: ${latency}ms` });
});
//add command listeners for the bot(help)
app.command("/eb-help", async ({ command, ack, respond }) => {
  await ack();// return the list of commands and their descriptions
  await respond({ text: "Here are the available commands:\n- `/mb-help`: Show this help message\n- `/mb-help`: Check the bot's latency \n- `/mb-ai`: Interact with the AI models deepseek v3(ds-v3), mistral small 3.1(ms-3.1), or mistral medium 3(mm-3)." });
});
//add command listeners for the bot(echo)
app.command("/eb-echo", async ({ command, ack, respond }) => {
  await ack();
  console.log("Echo command received with text:", command.text);
  const text = command.text;
  await respond({ text: `${text}` });//return text input
});
//ai command listener for the bot, this will send the prompt to the azure endpoint and return the response from the model
app.command("/eb-ai", async ({ command, ack, respond }) => {
  await ack();
  const input = command.text.toLowerCase();

  const temp = input.split(" | ")// split prompt and model

  const model = temp[0]//set values for model
  const prompt = temp[1]//set values for prompt

  const correctModel = CorrectModelName(model)//check if model is valid and get correct model name for azure endpoint

  const out = await AI(prompt, correctModel);//send prompt and model to AI function and return response
  await respond({ text: `${out}` });//return response from model to slack

});

(async () => {
  await app.start();//start slack bot
  console.log("Running!");//output so that you know its running
})();