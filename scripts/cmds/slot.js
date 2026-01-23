// =======================================
// SLOT + BANK + TOP RICHEST (INLINE TITLES)
// =======================================

const cooldowns = new Map();

// TOP 10 TITLES (ONLY)
const topTitles = [
  "👑 Jungle King",
  "🥈 Silver Tiger",
  "🥉 Bronze Lion",
  "🔥 Wild Beast",
  "🌴 Fruit Master",
  "🍍 Slot Hunter",
  "🐒 Jungle Player",
  "🍌 Lucky Monkey",
  "🌿 Rising Leaf",
  "⭐ New Blood"
];

module.exports = {
  config: {
    name: "slot",
    version: "13.0",
    author: "Gemini × GPT-5 (Final Slot Merge)",
    countDown: 3,
    role: 0,
    shortDescription: { en: "🍍 Jungle Slot Machine" },
    longDescription: { en: "Slot machine with jungle foods, mystery symbol, bank & top richest titles." },
    category: "game",
  },

  langs: {
    en: {
      invalid_amount: "⚠️ | Enter a valid bet amount.",
      not_enough_money: "💸 | Insufficient balance.",
      spinning: "Final Spin! 🎰\n[ %1 | %2 | %3 ]",
      win: "You won %1$ 💗\n[ %2 | %3 | %4 ]",
      jackpot: "🎉 JACKPOT! You won %1$ 💖\n[ %2 | %3 | %4 ]",
      lose: "You lost %1$ 😢\n[ %2 | %3 | %4 ]",

      invalid_command: "⚠️ | Usage: /bank <set|add|reset|view>",
      invalid_bank_amount: "⚠️ | Please provide a valid number.",
      success_set: "✅ Bank set to %1$",
      success_add: "✅ Added %1$. New balance: %2$",
      success_reset: "✅ Bank reset to $0.",
      success_view: "💰 Balance: %1$",
    },
  },

  // ====================
  // SLOT COMMAND
  // ====================
  onStart: async function ({ args, message, event, usersData, getLang, api }) {
    const { senderID } = event;
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0)
      return message.reply(getLang("invalid_amount"));

    const user = await usersData.get(senderID);
    if (bet > user.money)
      return message.reply(getLang("not_enough_money"));

    // Cooldown
    const now = Date.now();
    if (cooldowns.has(senderID) && now - cooldowns.get(senderID) < 3000)
      return message.reply("⏳ Wait 3 seconds between spins.");
    cooldowns.set(senderID, now);

    const fruits = [
      "🍌","🍍","🥭","🍉","🍎",
      "🍊","🍋","🍒","🥥","🥝",
      "🌽","🍠","🍐","❓"
    ];

    // Medium animation
    let msg = await message.reply(
      getLang("spinning", pick(fruits), pick(fruits), pick(fruits))
    );

    for (let i = 0; i < 5; i++) {
      await sleep(400);
      await api.editMessage(
        getLang("spinning", pick(fruits), pick(fruits), pick(fruits)),
        msg.messageID
      );
    }

    let result, winAmount, type;
    const r = Math.random();

    if (r < 0.02) {
      const s = pick(fruits.filter(f => f !== "❓"));
      result = [s, s, s];
      winAmount = bet * 10;
      type = "jackpot";
    } else if (r < 0.2) {
      const s = pick(fruits);
      let o;
      do { o = pick(fruits); } while (o === s);
      result = shuffle([s, s, o]);
      winAmount = bet * 2;
      type = "win";
    } else {
      do {
        result = [pick(fruits), pick(fruits), pick(fruits)];
      } while (
        result[0] === result[1] ||
        result[1] === result[2] ||
        result[0] === result[2]
      );
      winAmount = -bet;
      type = "lose";
    }

    // Resolve ❓
    result = result.map(v =>
      v === "❓" ? pick(fruits.filter(f => f !== "❓")) : v
    );

    await usersData.set(senderID, {
      money: user.money + winAmount,
      data: user.data,
    });

    await sleep(500);
    return api.editMessage(
      getLang(type, Math.abs(winAmount), ...result),
      msg.messageID
    );
  },

  // ====================
  // BANK COMMAND
  // ====================
  onCallBank: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    if (!args[0]) return message.reply(getLang("invalid_command"));

    const user = await usersData.get(senderID);
    const sub = args[0].toLowerCase();

    if (sub === "set") {
      const a = parseInt(args[1]);
      if (isNaN(a) || a < 0)
        return message.reply(getLang("invalid_bank_amount"));
      await usersData.set(senderID, { money: a, data: user.data });
      return message.reply(getLang("success_set", a.toLocaleString()));
    }

    if (sub === "add") {
      const a = parseInt(args[1]);
      if (isNaN(a) || a <= 0)
        return message.reply(getLang("invalid_bank_amount"));
      const total = user.money + a;
      await usersData.set(senderID, { money: total, data: user.data });
      return message.reply(
        getLang("success_add", a.toLocaleString(), total.toLocaleString())
      );
    }

    if (sub === "reset") {
      await usersData.set(senderID, { money: 0, data: user.data });
      return message.reply(getLang("success_reset"));
    }

    if (sub === "view") {
      return message.reply(
        getLang("success_view", user.money.toLocaleString())
      );
    }

    return message.reply(getLang("invalid_command"));
  },

  // ====================
  // TOP RICHEST COMMAND
  // ====================
  onCallTop: async function ({ message, usersData }) {
    const allUsers = await usersData.getAll();

    const sorted = allUsers
      .filter(u => typeof u.money === "number")
      .sort((a, b) => b.money - a.money)
      .slice(0, 10);

    let msg = "👑 TOP RICHEST USERS 👑\n━━━━━━━━━━━━━━\n";

    sorted.forEach((u, i) => {
      const name = u.name || "Unknown";
      const money = formatMoney(u.money);
      const title = topTitles[i] || "";
      msg += `${i + 1}. ${name} - ${money} ${title}\n`;
    });

    return message.reply(msg);
  },
};

// ====================
// UTILITIES
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

function formatMoney(amount) {
  if (amount >= 1e9) return (amount / 1e9).toFixed(2) + "B";
  if (amount >= 1e6) return (amount / 1e6).toFixed(2) + "M";
  if (amount >= 1e3) return (amount / 1e3).toFixed(2) + "K";
  return amount.toString();
        }
