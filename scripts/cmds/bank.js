const fs = require("fs");
const path = require("path");
const { createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "bank",
    version: "1.5",
    description: "Bank system with registration, VIP cards, loans, animated richest list, and bank card images",
    guide: {
      en: "{pn}Bank:\n- Register\n- Deposit\n- Withdraw\n- Balance\n- Interest\n- Transfer\n- Richest\n- Loan\n- PayLoan"
    },
    category: "💰 Economy",
    countDown: 15,
    role: 0,
    author: "sheikh fahim"
  },

  onStart: async function ({ args, message, event, api, usersData }) {
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);

    const userMoney = await usersData.get(event.senderID, "money");
    const user = parseInt(event.senderID);
    const info = await api.getUserInfo(user);
    const username = info[user].name;

    const bankDataPath = 'scripts/cmds/bankData.json';
    if (!fs.existsSync(bankDataPath)) fs.writeFileSync(bankDataPath, JSON.stringify({}), "utf8");
    const bankData = JSON.parse(fs.readFileSync(bankDataPath, "utf8"));

    const command = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);
    const recipientUID = parseInt(args[2]);

    // ---------------- Registration ----------------
    if (command === "register") {
      if (bankData[user]) return message.reply("❌ You already have a bank account!");
      bankData[user] = {
        bank: 0,
        lastInterestClaimed: Date.now(),
        vip: false,
        loan: 0,
        loanPayed: true,
        loanJailUntil: null
      };
      fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
      return message.reply("✅ Bank account created! Card: Standard 💳");
    }

    // ---------------- Ensure user is registered ----------------
    if (!bankData[user]) return message.reply(`❌ You don’t have a bank account yet. Type "${p}bank register"`);

    // ---------------- Loan Jail Check ----------------
    if (bankData[user].loanJailUntil && Date.now() < bankData[user].loanJailUntil && !bankData[user].loanPayed) {
      const remaining = bankData[user].loanJailUntil - Date.now();
      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      return message.reply(`⛓️ You are in loan jail! Repay your loan first. Time left: ${hours}h ${minutes}m`);
    }

    // ---------------- Auto VIP ----------------
    if (bankData[user].bank >= 1e9 && !bankData[user].vip) {
      bankData[user].vip = true;
      fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
    }

    let bankBalance = bankData[user].bank || 0;
    const cardType = bankData[user].vip ? "💎 VIP Card" : "💳 Standard Card";

    // ---------------- Commands ----------------
    switch (command) {
      // Deposit
      case "deposit":
        if (!amount || amount <= 0) return message.reply("❌ Enter a valid amount to deposit.");
        if (bankBalance >= 1e104) return message.reply("❌ Your bank is full.");
        if (userMoney < amount) return message.reply("❌ Not enough money.");
        bankData[user].bank += amount;
        await usersData.set(event.senderID, { money: userMoney - amount });
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
        return message.reply(`✅ Deposited $${amount}`);

      // Withdraw
      case "withdraw":
        if (!amount || amount <= 0) return message.reply("❌ Enter a valid amount to withdraw.");
        if (userMoney >= 1e104) return message.reply("❌ Your wallet is full.");
        if (amount > bankBalance) return message.reply("❌ Not enough balance.");
        bankData[user].bank -= amount;
        await usersData.set(event.senderID, { money: userMoney + amount });
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
        return message.reply(`✅ Withdrew $${amount}`);

      // Balance + Bank Card Image
      case "balance":
        const formattedBalance = formatNumberWithFullForm(bankBalance);
        const cardPath = await generateBankCard({ username, balance: formattedBalance, vip: bankData[user].vip });
        message.reply(`╔════ஜ۩۞۩ஜ═══╗
Bank Balance: $${formattedBalance}
Card: ${cardType}
╚════ஜ۩۞۩ஜ═══╝`);
        api.sendMessage({ attachment: fs.createReadStream(cardPath) }, event.threadID);
        break;

      // Interest
      case "interest":
        const interestRate = 0.001;
        const lastClaimed = bankData[user].lastInterestClaimed || 0;
        const now = Date.now();
        const diffSeconds = (now - lastClaimed) / 1000;
        if (diffSeconds < 86400) {
          const rem = Math.ceil(86400 - diffSeconds);
          const h = Math.floor(rem / 3600), m = Math.floor((rem % 3600) / 60);
          return message.reply(`❌ Can claim interest in ${h}h ${m}m`);
        }
        if (bankBalance <= 0) return message.reply("❌ No money to earn interest");
        const earned = bankBalance * (interestRate / 970) * diffSeconds;
        bankData[user].bank += earned;
        bankData[user].lastInterestClaimed = now;
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
        return message.reply(`✅ Earned interest: $${formatNumberWithFullForm(earned)}`);

      // Transfer
      case "transfer":
        if (!amount || amount <= 0) return message.reply("❌ Enter valid amount");
        if (!recipientUID || !bankData[recipientUID]) return message.reply("❌ Recipient not found");
        if (recipientUID === user) return message.reply("❌ Cannot transfer to yourself");
        if (amount > bankBalance) return message.reply("❌ Not enough balance");
        bankData[user].bank -= amount;
        bankData[recipientUID].bank += amount;
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
        return message.reply(`✅ Transferred $${amount} to UID: ${recipientUID}`);

      // Richest (animated)
      case "richest":
        const top = Object.entries(bankData).sort(([,a],[,b]) => b.bank - a.bank).slice(0,10);
        const lines = await Promise.all(top.map(async ([id,data], i) => {
          const name = await usersData.getName(id);
          return `[${i+1}. ${name} - $${formatNumberWithFullForm(data.bank)}]`;
        }));
        message.reply("╔════ஜ۩۞۩ஜ═══╗\nTop 10 richest:");
        for (let line of lines) {
          await new Promise(r => setTimeout(r, 600));
          message.reply(line);
        }
        message.reply("╚════ஜ۩۞۩ஜ═══╝");
        break;

      // Loan
      case "loan":
        const maxLoan = 100_000_000;
        const currLoan = bankData[user].loan || 0;
        if (!amount || amount > maxLoan) return message.reply(`❌ Max loan: $${maxLoan}`);
        if (!bankData[user].loanPayed && currLoan > 0) return message.reply(`❌ Repay $${currLoan} first`);
        bankData[user].loan = currLoan + amount;
        bankData[user].loanPayed = false;
        bankData[user].loanJailUntil = Date.now() + 24*60*60*1000;
        bankData[user].bank += amount;
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
        return message.reply(`✅ Loan $${amount} taken. Repay in 24h or go to jail`);

      // PayLoan
      case "payloan":
        const loanBal = bankData[user].loan || 0;
        if (!amount || amount <= 0) return message.reply("❌ Enter valid amount");
        if (loanBal <= 0) return message.reply("❌ No pending loan");
        if (amount > loanBal) return message.reply(`❌ Cannot pay more than $${loanBal}`);
        if (amount > userMoney) return message.reply(`❌ Not enough money`);
        bankData[user].loan -= amount;
        if (bankData[user].loan === 0) {
          bankData[user].loanPayed = true;
          bankData[user].loanJailUntil = null;
        }
        await usersData.set(event.senderID, { money: userMoney - amount });
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
        return message.reply(`✅ Paid $${amount}. Remaining loan: $${bankData[user].loan}`);

      default:
        return message.reply("❌ Commands: Register, Deposit, Withdraw, Balance, Interest, Transfer, Richest, Loan, PayLoan");
    }
  }
};

// ---------------- Number Formatter ----------------
function formatNumberWithFullForm(number) {
  const fullForms = [
    "", "Thousand", "Million", "Billion", "Trillion", "Quadrillion",
    "Quintillion", "Sextillion", "Septillion", "Octillion", "Nonillion",
    "Decillion", "Undecillion", "Duodecillion", "Tredecillion",
    "Quattuordecillion", "Quindecillion", "Sexdecillion", "Septendecillion",
    "Octodecillion", "Novemdecillion", "Vigintillion", "Unvigintillion",
    "Googol",
    "Titanium", "Eternium", "Divinium", "Celestium", "Omnillion",
    "Apocalyptillion", "Infernium", "Aetherion", "Chronillion", "Infinity"
  ];
  let index = 0;
  if (number >= 1e120) return "++++++++";
  while (number >= 1000 && index < fullForms.length - 1) {
    number /= 1000;
    index++;
  }
  return `${number.toFixed(2)} ${fullForms[index]}`;
}

// ---------------- Bank Card Image Generator ----------------
async function generateBankCard({ username, balance, vip }) {
  const width = 800, height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  if (vip) {
    const grad = ctx.createLinearGradient(0,0,width,height);
    grad.addColorStop(0, "#FFD700");
    grad.addColorStop(1, "#FF8C00");
    ctx.fillStyle = grad;
  } else ctx.fillStyle = "#1E90FF";
  ctx.fillRect(0,0,width,height);

  // Border
  ctx.lineWidth = 10;
  ctx.strokeStyle = vip ? "#FFEA00" : "#FFFFFF";
  ctx.strokeRect(0,0,width,height);

  // Text
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 50px Sans-serif";
  ctx.fillText(vip ? "💎 VIP BANK CARD" : "💳 STANDARD BANK CARD", 50, 80);
  ctx.font = "bold 40px Sans-serif";
  ctx.fillText(`Name: ${username}`, 50, 200);
  ctx.font = "bold 45px Sans-serif";
  ctx.fillText(`Balance: $${balance}`, 50, 300);
  ctx.font = "bold 35px Sans-serif";
  ctx.fillText(`Card Type: ${vip ? "VIP 💎" : "Standard 💳"}`, 50, 400);

  // Glow effect
  if (vip) {
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 50;
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 5;
    ctx.strokeRect(5,5,width-10,height-10);
  }

  // Save
  const buffer = canvas.toBuffer("image/png");
  const cardPath = path.join(__dirname, `bankCard_${username}.png`);
  fs.writeFileSync(cardPath, buffer);
  return cardPath;
}2 Billion)
function formatNumberWithFullForm(number) {
  const fullForms = [
    "",
    "Thousand",
    "Million",
    "Billion",
    "Trillion",
    "Quadrillion",
    "Quintillion",
    "Sextillion",
    "Septillion",
    "Octillion",
    "Nonillion",
    "Decillion",
    "Undecillion",
    "Duodecillion",
    "Tredecillion",
    "Quattuordecillion",
    "Quindecillion",
    "Sexdecillion",
    "Septendecillion",
    "Octodecillion",
    "Novemdecillion",
    "Vigintillion",
    "Unvigintillion",
    "Duovigintillion",
    "Tresvigintillion",
    "Quattuorvigintillion",
    "Quinvigintillion",
    "Sesvigintillion",
    "Septemvigintillion",
    "Octovigintillion",
    "Novemvigintillion",
    "Trigintillion",
    "Untrigintillion",
    "Duotrigintillion",
    "Googol",
  ];

  // Calculate the full form of the number (e.g., Thousand, Million, Billion)
  let fullFormIndex = 0;
  while (number >= 1000 && fullFormIndex < fullForms.length - 1) {
    number /= 1000;
    fullFormIndex++;
  }

  // Format the number with two digits after the decimal point
  const formattedNumber = number.toFixed(2);

  // Add the full form to the formatted number
  return `${formattedNumber} ${fullForms[fullFormIndex]}`;
                      }
    
