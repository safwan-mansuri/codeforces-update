require('dotenv').config()
const cron = require('node-cron');
const axios = require('axios');
const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

const sendMessage = async (contestToday) => {
  let msg = '';
  contestToday.forEach(element => {
    msg += `You have contest ${element.name}\n`;
  })
  const resp = await client.messages.create({
    body: msg,
    from: process.env.TWILIO_NUMBER,
    to: process.env.TWILIO_MYNUMBER
  })
  return resp;
}

const filterContest = async (contestLists) => {
  const contestToday = [];
  contestLists.result.forEach(element => {
    const contestHour = parseInt(element.relativeTimeSeconds/3600);
    if(Math.abs(contestHour) <= 12) {
      contestToday.push({name: element.name});
    }
  });
  return contestToday;
}

const callContest = async () => {
  const url = 'https://codeforces.com/api/contest.list';
  const codeforcesResponse = await axios.get(url);
  const contestLists = codeforcesResponse.data;
  const contestToday = await filterContest(contestLists);
  const twilioResponse = await sendMessage(contestToday);
  console.log(twilioResponse);
}

const start = () => {
  try {
    cron.schedule('42 19 * * *', callContest);
  } catch(err) {
    console.log('error sending message ', err);
  }
}

start()
