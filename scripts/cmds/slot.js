// ==========================
// SLOT SYSTEM + BANK MANAGER
// ==========================

const cooldowns = new Map();

module.exports = {
  config: {
    name: "slot",
    version: "9.0",
    author: "Gemini × GPT-5",
    countDown: 3, // 3 second cooldown for slot
    role: 0,
    shortDescription: { en: "🍉 Food Slot Machine" },
    longDescription: { en: "Spin the slot machine and manage your unlimited bank." },
    category: "game",
  },

  langs: {
    en: {
      invalid_amount: "⚠️ | Enter a valid bet amount.",
      not_enough_money: "💸 | Insufficient balance.",
      spinning: "Final Spin! 🎰\n[ %1 | %2 | %3 ]",
      win: "You won %1$💗! Your luck is shining today!\n[ %2 | %3 | %4 ]",
      jackpot: "🎉 JACKPOT! You won %1$💖\n[ %2 | %3 | %4 ]",
      lose: "You lost %1$😢. Better luck next time!\n[ %2 | %3 | %4 ]",

      // BANK COMMANDS
      invalid_command: "⚠️ | Usage: /bank <set|add|reset|view> <amount>",
      invalid_bank_amount: "⚠️ | Please provide a valid number.",
      success_set: "✅ Your bank balance is now set to %1$",
      success_add: "✅ Added %1$ to your bank. New balance: %2$",
      success_reset: "✅ Your bank balance has been reset to $0.",
      success_view: "💰 Your current bank balance is %1$",
    },
  },

  // ====================
  // SLOT MACHINE LOGIC
  // ====================
  onStart: async function ({ args, message, event, usersData, getLang, api }) {
    const { senderID } = event;
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) return message.reply(getLang("invalid_amount"));

    const user = await usersData.get(senderID);
    if (bet > user.money) return message.reply(getLang("not_enough_money"));

    // 3-second cooldown
    const now = Date.now();
    if (cooldowns.has(senderID) && now - cooldowns.get(senderID) < 3000) {
      return message.reply("⏳ Please wait 3 seconds between spins.");
    }
    cooldowns.set(senderID, now);

    const fruits = ["🍎", "🍋", "🍊", "🍒", "🥝"];

    // Smooth spinning animation
    let msg = await message.reply(getLang("spinning", pick(fruits), pick(fruits), pick(fruits)));
    for (let i = 0; i < 3; i++) {
      await sleep(500);
      await api.editMessage(
        getLang("spinning", pick(fruits), pick(fruits), pick(fruits)),
        msg.messageID
      );
    }

    // Controlled win/loss
    let result, winAmount, type;
    const random = Math.random();

    if (random < 0.02) { // Jackpot ~2%
      const s = pick(fruits);
      result = [s, s, s];
      winAmount = bet * 10;
      type = "jackpot";
    } else if (random < 0.2) { // Win ~18%
      const s = pick(fruits);
      let other;
      do { other = pick(fruits); } while (other === s);
      result = shuffle([s, s, other]);
      winAmount = bet * 2;
      type = "win";
    } else { // Loss ~80%
      do {
        result = [pick(fruits), pick(fruits), pick(fruits)];
      } while (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]);
      winAmount = -bet;
      type = "lose";
    }

    // Update balance
    await usersData.set(senderID, {
      money: user.money + winAmount,
      data: user.data,
    });

    await sleep(500);

    return api.editMessage(getLang(type, Math.abs(winAmount), ...result), msg.messageID);
  },

  // ====================
  // BANK COMMAND LOGIC
  // ====================
  onCallBank: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    if (!args[0]) return message.reply(getLang("invalid_command"));

    const subcommand = args[0].toLowerCase();
    const userData = await usersData.get(senderID);

    if (subcommand === "set") {
      const amount = parseInt(args[1]);
      if (isNaN(amount) || amount < 0) return message.reply(getLang("invalid_bank_amount"));
      await usersData.set(senderID, { money: amount, data: userData.data });
      return message.reply(getLang("success_set", amount.toLocaleString()));

    } else if (subcommand === "add") {
      const amount = parseInt(args[1]);
      if (isNaN(amount) || amount <= 0) return message.reply(getLang("invalid_bank_amount"));
      const newBalance = userData.money + amount;
      await usersData.set(senderID, { money: newBalance, data: userData.data });
      return message.reply(getLang("success_add", amount.toLocaleString(), newBalance.toLocaleString()));

    } else if (subcommand === "reset") {
      await usersData.set(senderID, { money: 0, data: userData.data });
      return message.reply(getLang("success_reset"));

    } else if (subcommand === "view") {
      return message.reply(getLang("success_view", userData.money.toLocaleString()));

    } else {
      return message.reply(getLang("invalid_command"));
    }
  },
};

// ====================
// UTILITY FUNCTIONS
// ====================
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
      }
