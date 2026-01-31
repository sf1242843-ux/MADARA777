const cooldown = new Map();

module.exports = {
  name: "risk",
  aliases: ["double", "allin", "highrisk", "gamble"],
  description: "Double your coins or lose them!",
  
  execute: async (api, event, args, usersData) => {
    try {
      const userId = event.senderID;
      const waitTime = 5000; // 5 seconds cooldown

      // ✅ Cooldown check
      if (cooldown.has(userId)) {
        const timeLeft = cooldown.get(userId) - Date.now();
        if (timeLeft > 0) {
          return api.sendMessage(
            `⏳ Please wait ${Math.ceil(timeLeft / 1000)} seconds before playing again.`,
            event.threadID,
            event.messageID
          );
        }
      }

      // ✅ Validate bet amount
      const bet = parseInt(args[0]);
      if (!args[0] || isNaN(bet) || bet <= 0) {
        return api.sendMessage(
          "⚠️ Usage: <command> <amount>\nExample: /risk 1000",
          event.threadID,
          event.messageID
        );
      }

      // ✅ Get user data safely
      let user = await usersData.get(userId);
      if (!user) {
        user = { money: 0 };
        await usersData.set(userId, user);
      }

      if (user.money < bet) {
        return api.sendMessage(
          "❌ You don't have enough coins!",
          event.threadID,
          event.messageID
        );
      }

      cooldown.set(userId, Date.now() + waitTime);

      // ⭐ Game logic (45% chance to win)
      const win = Math.random() < 0.45;

      let resultMsg;
      if (win) {
        user.money += bet;
        resultMsg = `🔥 YOU WON!\n💰 +${bet} coins`;
      } else {
        user.money -= bet;
        resultMsg = `💀 YOU LOST!\n💸 -${bet} coins`;
      }

      await usersData.set(userId, user);

      // ✅ Send clean result message
      return api.sendMessage(
`🎲 RISK GAME 🎲
━━━━━━━━━━━━━━
${resultMsg}

🏦 Balance: ${user.money} coins
⏱️ Cooldown: 5 seconds
💡 Use aliases: /double, /allin, /highrisk, /gamble`,
        event.threadID,
        event.messageID
      );

    } catch (error) {
      console.error(error);
      return api.sendMessage(
        "⚠️ Oops! Something went wrong. Try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
