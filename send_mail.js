const nodemailer = require('nodemailer');
const csv = require('csvtojson');
require('dotenv').config();
const message = require('./message');
const subjects = require('./subjects');

const transporterArray = [];

const senderArray = [];

for (let key in process.env) {
  if (key.substring(0, 5) == 'EMAIL') {
    let index = key.split('EMAIL')[1];
    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
      port: 465,
      secure: true,
      auth: {
        user: process.env[key],
        pass: process.env['PASSWORD' + index],
      },
    });
    transporterArray.push(transporter);
    senderArray.push(process.env[key]);
  }
}

const currentPath = process.cwd();
const csvFilePath = currentPath + '/' + process.env.CSV_FILE_NAME;


async function sendEmails(transporter, sender, number_of_mails, start, jsonObj) {
  for (let i = start; i < start + number_of_mails; i++) {
    try {
      const randomNum = Math.floor(Math.random() * subjects.length);
      let subject = subjects[randomNum];

      let email = jsonObj[i].email;
      if (email != 'Nil' || email != '') {
        const info = await transporter.sendMail({
          from: sender,
          to: email,
          subject,
          html: message,
        });
        console.log(`Message sent from ${sender}`);
      }
    } catch (err) {
      console.log(err);
    }
  }
  transporter.close();
}

async function sendEmail() {
  const jsonObj = await csv().fromFile(csvFilePath);

  const mails_per_email = jsonObj.length / transporterArray.length;

  if (mails_per_email > 400) {
    mails_per_email = 400; // To be within safe limit of spamming
  }

  let i = 0, start = 0;
  for (let transporter of transporterArray) {
    sendEmails(transporter, senderArray[i], mails_per_email, start, jsonObj);
    i++;
    start += mails_per_email;
  }
}

sendEmail();
