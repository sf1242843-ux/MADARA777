// ==========================
// SLOT MACHINE BOT - slot.js
// ==========================

const cooldowns = new Map();

module.exports = {
  config: {
    name: "slot",
    version: "14.0",
    author: "Gemini × GPT-5",
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
      spinning: "Final Spin! 🎰\n[ %1 | %2 | %3 ]",
      win: "You won %1$💗!\n[ %2 | %3 | %4 ]",
      jackpot: "🎉 JACKPOT! You won %1$💖\n[ %2 | %3 | %4 ]",
      lose: "You lost %1$😢\n[ %2 | %3 | %4 ]",
      cooldown: "⏳ Please wait 3 seconds between spins."
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang, api }) {
    const { senderID } = event;
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0)
      return message.reply(getLang("invalid_amount"));

    const user = await usersData.get(senderID);
    if (!user || bet > user.money)
      return message.reply(getLang("not_enough_money"));

    // Cooldown check
    const now = Date.now();
    if (cooldowns.has(senderID) && now - cooldowns.get(senderID) < 3000)
      return message.reply(getLang("cooldown"));
    cooldowns.set(senderID, now);

    // Jungle / Exotic Foods + 7️⃣ Jackpot
    const fruits = [
      "🍎", "🍋", "🍊", "🍒", "🥝", "🍍", "🥭", "🥥", "🍇", "🍉",
      "🍌", "🥑", "🍈", "🍐", "🍓", "🍑", "🍏", "🥔", "🥕", "🌽",
      "🍠", "🌶️", "🥒", "🥬", "🍄", "🫐", "🫛", "🥜", "🌰", "🥝",
      "7️⃣"
    ];

    const mystery = "❓";
    const soundEmojis = ["🔔", "🎶", "💨"];

    // Initial mystery
    let reels = [mystery, mystery, mystery];
    let msg = await message.reply(
      `Final Spin! 🎰\n[ ${reels[0]} | ${reels[1]} | ${reels[2]} ]`
    );

    // Real-time reel spin
    const reelSpin = async (index, spins) => {
      for (let i = 0; i < spins; i++) {
        reels[index] = pick(fruits);
        const sound = soundEmojis[Math.floor(Math.random() * soundEmojis.length)];
        await api.editMessage(
          `Spinning... ${sound}\n[ ${reels[0]} | ${reels[1]} | ${reels[2]} ]`,
          msg.messageID
        );
        await sleep(150 + i * 30);
      }
    };

    await Promise.all([
      reelSpin(0, 8),
      reelSpin(1, 10),
      reelSpin(2, 12)
    ]);

    // Calculate result
    let result, winAmount, type;
    const random = Math.random();

    if (random < 0.01) { // 1% Jackpot 7️⃣
      result = ["7️⃣", "7️⃣", "7️⃣"];
      winAmount = bet * 20;
      type = "jackpot";
    } else if (random < 0.03) { // 2% Jackpot same any
      const s = pick(fruits);
      result = [s, s, s];
      winAmount = bet * 10;
      type = "jackpot";
    } else if (random < 0.2) { // Win two same
      const s = pick(fruits);
      let other;
      do { other = pick(fruits); } while (other === s);
      result = shuffle([s, s, other]);
      winAmount = bet * 2;
      type = "win";
    } else { // Lose
      do {
        result = [pick(fruits), pick(fruits), pick(fruits)];
      } while (new Set(result).size !== 3);
      winAmount = -bet;
      type = "lose";
    }

    // Update user balance
    await usersData.set(senderID, {
      money: user.money + winAmount,
      data: user.data,
    });

    // Final result with flashing jackpot effect
    if (type === "jackpot") {
      for (let i = 0; i < 6; i++) {
        const flashy = result.map(r => r + "✨");
        await api.editMessage(
          getLang(type, Math.abs(winAmount), ...flashy),
          msg.messageID
        );
        await sleep(300);
        await api.editMessage(
          getLang(type, Math.abs(winAmount), ...result),
          msg.messageID
        );
        await sleep(300);
      }
    } else {
      await sleep(500);
      await api.editMessage(
        getLang(type, Math.abs(winAmount), ...result),
        msg.messageID
      );
    }
  },
};

// Utilities
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
