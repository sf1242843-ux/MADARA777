const cooldown = new Map();

module.exports = {
  name: "coinflip",
  aliases: ["flip"],
  description: "Flip a coin and bet your money",

  execute: async (api, event, args, usersData) => {
    const userID = event.senderID;
    const now = Date.now();

    // cooldown 5s
    if (cooldown.has(userID)) {
      const timeLeft = ((cooldown.get(userID) + 5000 - now) / 1000).toFixed(1);
      if (timeLeft > 0)
        return api.sendMessage(
          `⏳ Cooldown! Wait ${timeLeft}s`,
          event.threadID
        );
    }

    const choice = args[0]?.toLowerCase();
    const bet = parseInt(args[1]);

    if (!["heads", "tails"].includes(choice))
      return api.sendMessage(
        "⚠️ Use: /coinflip <heads/tails> <amount>",
        event.threadID
      );

    if (!bet || bet <= 0)
      return api.sendMessage("❌ Bet must be a valid number!", event.threadID);

    let user = (await usersData.get(userID)) || { money: 0, streak: 0 };

    if (user.money < bet)
      return api.sendMessage("❌ Not enough balance!", event.threadID);

    cooldown.set(userID, now);

    const result = Math.random() < 0.5 ? "heads" : "tails";
    let message = `🪙 COIN FLIP RESULT: ${result.toUpperCase()}\n`;

    if (choice === result) {
      const winAmount = bet;
      user.money += winAmount;
      user.streak = (user.streak || 0) + 1;
      message += `🎉 YOU WON!\n💸 +${winAmount}\n🔥 Streak: ${user.streak}`;
    } else {
      user.money -= bet;
      user.streak = 0;
      message += `💀 YOU LOST!\n💸 -${bet}\n🔥 Streak reset to 0`;
    }

    await usersData.set(userID, user);

    message += `\n💰 Balance: ${user.money}`;

    api.sendMessage(message, event.threadID);
  }
};
