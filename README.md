# MY SLACK BOT
A slackbot to help you(with ai) hosted on nest
<br>
## How to use
* open [this link](https://hackclub.enterprise.slack.com/archives/C0B8ZP1DZFV)
<br>
## Curent comands
* /mb-ping - returns latency between you and bot
* /mb-help - returns a list of all posible commands
* /mb-echo {text} - retruns the input{text}
* /mb-ai {model} | {promp} - API an ai and return its response
<br>
## How it works
uses Slack Bolt and webSocket to take in comands from slack. Then I used axios to API github models. I also used cron on nest to git pull weekly.

