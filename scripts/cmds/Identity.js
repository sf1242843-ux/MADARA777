const axios = require("axios");

// ==== Player Database (in-memory) ====
const players = {
  // Example player IDs (Messenger PSID)
  "12345": { name: "John Doe", age: 16, level: 5, coins: 1500, role: "Warrior" },
  "67890": { name: "Alice", age: 17, level: 8, coins: 3200, role: "Mage" },
};

// ==== Functions ====

// Get player identity card
function getPlayerIdentity(playerID) {
  const player = players[playerID];
  if (!player) return "❌ Player not found!";

  return `
🛡️ PLAYER IDENTITY CARD 🛡️

• Name   : ${player.name}
• Age    : ${player.age}
• Level  : ${player.level}
• Role   : ${player.role}
• Coins  : 💰 ${player.coins}

✨ Keep playing and earn more coins!
`;
}

// Add coins to player
function addCoins(playerID, amount) {
  if (!players[playerID]) return false;
  players[playerID].coins += amount;
  return true;
}

// Remove coins from player
function removeCoins(playerID, amount) {
  if (!players[playerID]) return false;
  players[playerID].coins = Math.max(0, players[playerID].coins - amount);
  return true;
}

// ==== Messenger Bot Handler ====
async function handleMessage(sender_psid, received_message) {
  const text = received_message.text ? received_message.text.toLowerCase() : "";

  // Show identity card
  if (text === ".id" || text === ".profile") {
    const card = getPlayerIdentity(sender_psid);
    await sendTextMessage(sender_psid, card);
  }

  // Add coins (admin command example)
  else if (text.startsWith(".addcoins ")) {
    const amount = parseInt(text.split(" ")[1]);
    if (addCoins(sender_psid, amount)) {
      await sendTextMessage(sender_psid, `✅ Added 💰 ${amount} coins!`);
    } else {
      await sendTextMessage(sender_psid, "❌ Player not found!");
    }
  }

  // Remove coins (admin command example)
  else if (text.startsWith(".removecoins ")) {
    const amount = parseInt(text.split(" ")[1]);
    if (removeCoins(sender_psid, amount)) {
      await sendTextMessage(sender_psid, `✅ Removed 💰 ${amount} coins!`);
    } else {
      await sendTextMessage(sender_psid, "❌ Player not found!");
    }
  }
}

// ==== Send Message function ====
async function sendTextMessage(sender_psid, message) {
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

  const request_body = {
    recipient: { id: sender_psid },
    message: { text: message },
  };

  await axios.post(
    `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    request_body
  );
}

module.exports = {
  handleMessage,
  getPlayerIdentity,
  addCoins,
  removeCoins,
  players,
};
