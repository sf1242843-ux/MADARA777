📄 | Source code of "dice.js":

const dailyLimit = 15;

module.exports = {
  config: {
    name: "dice",
    version: "2.2",
    author: "xnil6x × Hussain",
    shortDescription: "🎲 Stylish Dice Game",
    longDescription: "Dice game with 40% win & 60% loss (Bank Connected)",
    category: "Game",
    guide: {
      en: "{p}dice <amount>"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { senderID, threadID } = event;
    const userData = await usersData.get(senderID);

    if (!userData || typeof userData.money !== "number") {
      return api.sendMessage("❌ 𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝗘𝗿𝗿𝗼𝗿!", threadID);
    }

    // 🕒 DAILY LIMIT
    const today = new Date().toDateString();
    const diceData = userData.data?.dice || { count: 0, date: today };

    if (diceData.date !== today) {
      diceData.count = 0;
      diceData.date = today;
    }

    if (diceData.count >= dailyLimit) {
      return api.sendMessage(
`╔════ ⛔ 𝗟𝗜𝗠𝗜𝗧 ════╗
❌ 𝗗𝗮𝗶𝗹𝘆 𝗟𝗶𝗺𝗶𝘁 𝗥𝗲𝗮𝗰𝗵𝗲𝗱
🎯 𝗠𝗮𝘅: 15 𝗧𝗶𝗺𝗲𝘀
╚══════════════════╝`,
        threadID
      );
    }

    const betAmount = parseInt(args[0]);
    if (isNaN(betAmount) || betAmount <= 0) {
      return api.sendMessage("⚠️ 𝗨𝘀𝗲: dice <amount>", threadID);
    }

    if (betAmount > userData.money) {
      return api.sendMessage(
`❌ 𝗟𝗼𝘄 𝗕𝗮𝗹𝗮𝗻𝗰𝗲
💰 ${formatMoney(userData.money)}`,
        threadID
      );
    }

    api.sendMessage(
`🎲 𝗗𝗜𝗖𝗘 𝗥𝗢𝗟𝗟𝗜𝗡𝗚...
⏳ 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁 5 𝘀𝗲𝗰𝗼𝗻𝗱𝘀`,
      threadID
    );

    setTimeout(async () => {
      const chance = Math.random();
      let diceRoll, winAmount, text;

      if (chance < 0.6) {
        // ❌ LOSS 60%
        diceRoll = Math.floor(Math.random() * 2) + 1;
        winAmount = -betAmount;

        text =
`╔════ 🎲 𝗗𝗜𝗖𝗘 ════╗
🎯 𝗥𝗼𝗹𝗹𝗲𝗱: ${diceRoll}
💔 𝗬𝗼𝘂 𝗟𝗼𝘀𝘁
💸 -${formatMoney(betAmount)}
╚══════════════════╝`;

      } else {
        // ✅ WIN 40%
        diceRoll = Math.floor(Math.random() * 4) + 3;

        if (diceRoll === 3) winAmount = betAmount * 2;
        else if (diceRoll === 4 || diceRoll === 5) winAmount = betAmount * 3;
        else winAmount = betAmount * 10;

        text =
`╔════ 🎲 𝗗𝗜𝗖𝗘 ════╗
🎯 𝗥𝗼𝗹𝗹𝗲𝗱: ${diceRoll}
🎉 𝗬𝗢𝗨 𝗪𝗜𝗡!
💰 +${formatMoney(winAmount)}
╚══════════════════╝`;
      }

      diceData.count++;

      await usersData.set(senderID, {
        money: userData.money + winAmount,
        data: {
          ...userData.data,
          dice: diceData
        }
      });

      return api.sendMessage(text, threadID);

    }, 5000);
  }
};

// 💰 MONEY FORMAT
function formatMoney(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toString();
     }
