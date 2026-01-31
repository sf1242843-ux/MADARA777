const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "bank",
    version: "1.2",
    description: "Deposit or withdraw money from the bank and earn interest",
    guide: {
      vi: "",
      en: "{pn}Bank:\nInterest - Balance\n - Withdraw \n- Deposit \n- Transfer \n- Richest"
    },
    category: "💰 Economy",
    countDown: 15,
    role: 0,
    author: "Loufi | SiAM | Samuel\n\nModified: Shikaki"
  },
  onStart: async function ({ args, message, event, api, usersData }) {
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);

    const userMoney = await usersData.get(event.senderID, "money");
    const user = parseInt(event.senderID);
    const info = await api.getUserInfo(user);
    const username = info[user].name;

 const bankDataPath = 'scripts/cmds/bankData.json';

if (!fs.existsSync(bankDataPath)) {
  const initialBankData = {};
  fs.writeFileSync(bankDataPath, JSON.stringify(initialBankData), "utf8");
}

const bankData = JSON.parse(fs.readFileSync(bankDataPath, "utf8"));

if (!bankData[user]) {
  bankData[user] = { bank: 0, lastInterestClaimed: Date.now() };
  fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
}


  bankBalance = bankData[user].bank || 0;

  const command = args[0]?.toLowerCase();
  const amount = parseInt(args[1]);
  const recipientUID = parseInt(args[2]);

    switch (command) {
case "deposit":
  if (isNaN(amount) || amount <= 0) {
    return message.reply("╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏Please enter a valid amount to deposit 🔁•\n\n╚════ஜ۩۞۩ஜ═══╝");
  }


  if (bankBalance >= 1e104) {
    return message.reply("╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏You cannot deposit money when your bank balance is already at $1e104 ✖️•\n\n╚════ஜ۩۞۩ஜ═══╝");
  }

  if (userMoney < amount) {
    return message.reply("╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏You don't have the required amount to deposit ✖️•\n\n╚════ஜ۩۞۩ஜ═══╝");
  }

  bankData[user].bank += amount;
  await usersData.set(event.senderID, {
    money: userMoney - amount
  });
fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");

  return message.reply(`╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏Successfully deposited $${amount} into your bank account ✅•\n\n╚════ஜ۩۞۩ஜ═══╝`);
break;


case "withdraw":
  const balance = bankData[user].bank || 0;

  if (isNaN(amount) || amount <= 0) {
    return message.reply("╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏Please enter the correct amount to withdraw 😪•\n\n╚════ஜ۩۞۩ஜ═══╝");
  }

  if (userMoney >= 1e104) {
    return message.reply("╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏You cannot withdraw money when your balance is already at 1e104 😒•\n\n╚════ஜ۩۞۩ஜ═══╝");
  }

  if (amount > balance) {
    return message.reply("╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏The requested amount is greater than the available balance in your bank account 🗿•\n\n╚════ஜ۩۞۩ஜ═══╝");
  }

  // Continue with the withdrawal if the userMoney is not at 1e104
  bankData[user].bank = balance - amount;
  await usersData.set(event.senderID, {
    money: userMoney + amount
  });
fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
  return message.reply(`╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏Successfully withdrew $${amount} from your bank account ✅•\n\n╚════ஜ۩۞۩ஜ═══╝`);
  break;


case "balance":
  const formattedBankBalance = parseFloat(bankBalance);
  if (!isNaN(formattedBankBalance)) {
    return message.reply(`╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏Your bank balance is: $${formatNumberWithFullForm(formattedBankBalance)}\n\n╚════ஜ۩۞۩ஜ═══╝`);
  } else {
    return message.reply("╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏Error: Your bank balance is not a valid number 🥲•\n\n╚════ஜ۩۞۩ஜ═══╝");
  }
  break;



case "interest":
  const interestRate = 0.001; // 0.1% daily interest rate
  const lastInterestClaimed = bankData[user].lastInterestClaimed || 0;

  const currentTime = Date.now();
  const timeDiffInSeconds = (currentTime - lastInterestClaimed) / 1000;

  if (timeDiffInSeconds < 86400) {
    // If it's been less than 24 hours since the last interest claim
    const remainingTime = Math.ceil(86400 - timeDiffInSeconds);
    const remainingHours = Math.floor(remainingTime / 3600);
    const remainingMinutes = Math.floor((remainingTime % 3600) / 60);

    return message.reply(`╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏You can claim interest again in ${remainingHours} hours and ${remainingMinutes} minutes 😉•\n\n╚════ஜ۩۞۩ஜ═══╝`);
  }

  const interestEarned = bankData[user].bank * (interestRate / 970) * timeDiffInSeconds;

  if (bankData[user].bank <= 0) {
        return message.reply("╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏You don't have any money in your bank account to earn interest 💸🥱•\n\n╚════ஜ۩۞۩ஜ═══╝");
  }

  bankData[user].lastInterestClaimed = currentTime;
  bankData[user].bank += interestEarned;

fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");


return message.reply(`╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏You have earned interest of $${formatNumberW
