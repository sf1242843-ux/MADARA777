// ==========================
// SLOT MACHINE BOT - slot.js
// ==========================

const cooldowns = new Map();

module.exports = {
  config: {
    name: "slot",
    version: "14.1",
    author: "Gemini × GPT-5 (fixed)",
    countDown: 3,
    role: 0,
    shortDescription: { en: "🍉 Jungle Food Slot Machine" },
    longDescription: { en: "Spin the slot machine and test your luck with jungle foods." },
    category: "game",
  },

  langs: {
    en: {
      invalid_amount: "⚠️ | Enter a valid bet amount.",
      not_enough_money: "💸 | Insufficient balance.",
      spinning: "Spinning... 🎰\n[ %1 | %2 | %3 ]",
      win: "You won %1$ 💗\n[ %2 | %3 | %4 ]",
      jackpot: "🎉 JACKPOT! You won %1$ 💖\n[ %2 | %3 | %4 ]",
      lose: "You lost %1$ 😢\n[ %2 | %3 | %4 ]",
      cooldown: "⏳ Please wait 3 seconds between spins."
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang, api }) {
    const senderID = event.senderID;
    const bet = parseInt(args[0]);

    if (!bet || bet <= 0)
      return message.reply(getLang("invalid_amount"));

    const user = await usersData.get(senderID);
    if (!user || bet > user.money)
      return message.reply(getLang("not_enough_money"));

    // Cooldown
    const now = Date.now();
    if (cooldowns.has(senderID) && now - cooldowns.get(senderID) < 3000)
      return message.reply(getLang("cooldown"));
    cooldowns.set(senderID, now);

    const fruits = [
      "🍎","🍋","🍊","🍒","🍍","🥭","🥥","🍇","🍉","🍌",
      "🥑","🍈","🍐","🍓","🍑","🍏","🥔","🥕","🌽","🍠",
      "🌶️","🥒","🥬","🍄","🫐","🫛","🥜","🌰","7️⃣"
    ];

    let reels = ["❓", "❓", "❓"];
    let msg = await message.reply(getLang("spinning", ...reels));

    const spinReel = async (index, times) => {
      for (let i = 0; i < times; i++) {
        reels[index] = pick(fruits);
        await api.editMessage(
          getLang("spinning", reels[0], reels[1], reels[2]),
          msg.messageID
        );
        await sleep(120);
      }
    };

    await Promise.all([
      spinReel(0, 6),
      spinReel(1, 8),
      spinReel(2, 10)
    ]);

    let result, winAmount, type;
    const r = Math.random();

    if (r < 0.01) {
      result = ["7️⃣", "7️⃣", "7️⃣"];
      winAmount = bet * 20;
      type = "jackpot";
    } else if (r < 0.03) {
      const s = pick(fruits);
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
      } while (new Set(result).size !== 3);
      winAmount = -bet;
      type = "lose";
    }

    await usersData.set(senderID, {
      money: user.money + winAmount,
      data: user.data,
    });

    await api.editMessage(
      getLang(type, Math.abs(winAmount), result[0], result[1], result[2]),
      msg.messageID
    );
  },
};

// Utils
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
