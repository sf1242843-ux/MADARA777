const Canvas = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "bank",
    aliases: ["register", "identity", "dep", "withdraw", "resetbank"],
    version: "1.0",
    author: "ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: "Bank & Identity System",
    category: "economy",
    guide: `
/register - Register account
/identity - Show ID card
/deposit [amount] - Deposit money
/withdraw [amount] - Withdraw money
/resetbank @mention - Admin reset bank`
  },

  onStart: async function ({ api, event, args, usersData }) {
    const userID = event.senderID;
    const user = await usersData.get(userID);

    const command = event.body.split(" ")[0].slice(1).toLowerCase();

    // -------------------- REGISTER --------------------
    if (command === "register") {
      if (user.bankRegistered)
        return api.sendMessage("❌ You are already registered!", event.threadID);

      await usersData.set(userID, {
        bankRegistered: true,
        bankBalance: 1000,
        money: 0,
        exp: 0,
        name: user.name || "Unknown",
        gender: user.gender || "Unknown"
      });

      return api.sendMessage(
        `✅ BANK REGISTRATION SUCCESSFUL!\n🏦 Starting Balance: 1000\nNow you can use /identity`,
        event.threadID
      );
    }

    // -------------------- IDENTITY CARD --------------------
    if (command === "identity") {
      if (!user.bankRegistered)
        return api.sendMessage("❌ You are not registered! Use /register first.", event.threadID);

      // Canvas image
      const canvas = Canvas.createCanvas(600, 350);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#1e1e1e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Card border
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 6;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      // Text
      ctx.fillStyle = "#fff";
      ctx.font = "28px Arial";
      ctx.fillText("🪪 IDENTITY CARD", 180, 50);

      ctx.font = "22px Arial";
      ctx.fillText(`Name: ${user.name}`, 50, 120);
      ctx.fillText(`UID: ${userID}`, 50, 160);
      ctx.fillText(`Gender: ${user.gender}`, 50, 200);
      ctx.fillText(`Wallet: ${user.money}`, 50, 240);
      ctx.fillText(`Bank: ${user.bankBalance}`, 50, 280);
      ctx.fillText(`EXP: ${user.exp}`, 50, 320);

      // Save image
      const imagePath = path.join(__dirname, "identity_card.png");
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(imagePath, buffer);

      return api.sendMessage(
        { body: "🖼️ Here is your identity card:", attachment: fs.createReadStream(imagePath) },
        event.threadID
      );
    }

    // -------------------- DEPOSIT --------------------
    if (command === "deposit") {
      if (!user.bankRegistered)
        return api.sendMessage("❌ You are not registered! Use /register first.", event.threadID);

      const amount = parseInt(args[0]);
      if (!amount || amount <= 0) return api.sendMessage("❌ Invalid amount!", event.threadID);
      if (user.money < amount) return api.sendMessage("❌ Not enough money in wallet!", event.threadID);

      await usersData.set(userID, {
        money: user.money - amount,
        bankBalance: user.bankBalance + amount
      });

      return api.sendMessage(`✅ Deposited ${amount} to bank!`, event.threadID);
    }

    // -------------------- WITHDRAW --------------------
    if (command === "withdraw") {
      if (!user.bankRegistered)
        return api.sendMessage("❌ You are not registered! Use /register first.", event.threadID);

      const amount = parseInt(args[0]);
      if (!amount || amount <= 0) return api.sendMessage("❌ Invalid amount!", event.threadID);
      if (user.bankBalance < amount) return api.sendMessage("❌ Not enough money in bank!", event.threadID);

      await usersData.set(userID, {
        money: user.money + amount,
        bankBalance: user.bankBalance - amount
      });

      return api.sendMessage(`✅ Withdrawn ${amount} from bank!`, event.threadID);
    }

    // -------------------- ADMIN RESET --------------------
    if (command === "resetbank") {
      const adminIDs = ["123456789"]; // 👈 Replace with admin UID(s)
      if (!adminIDs.includes(userID)) return api.sendMessage("❌ You are not admin!", event.threadID);

      if (Object.keys(event.mentions).length === 0) return api.sendMessage("❌ Mention a user to reset!", event.threadID);

      const targetID = Object.keys(event.mentions)[0];
      await usersData.set(targetID, {
        bankRegistered: false,
        bankBalance: 0,
        money: 0,
        exp: 0
      });

      return api.sendMessage(`✅ Reset bank for user: ${targetID}`, event.threadID);
    }
  }
};
