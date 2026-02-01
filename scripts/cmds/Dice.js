module.exports = {
  name: "dice",
  description: "Roll the dice: normal or high-risk mode, track your stats!",

  // Cooldown map per user
  cooldowns: new Map(),

  execute: async (api, event, args, usersData) => {
    const userId = event.senderID;

    // Fetch or initialize user data
    let user = await usersData.get(userId) || {
      money: 0,
      diceStats: { played: 0, wins: 0, losses: 0, profit: 0 }
    };

    // /dice stats command
    if (args[0] && args[0].toLowerCase() === "stats") {
      const stats = user.diceStats;
      return api.sendMessage(
        `📊 Dice Stats:
🎲 Games Played: ${stats.played}
✅ Wins: ${stats.wins}
❌ Losses: ${stats.losses}
💰 Profit: ${stats.profit}`,
        event.threadID
      );
    }

    // Check cooldown
    const now = Date.now();
    const lastRoll = module.exports.cooldowns.get(userId) || 0;
    const cooldownTime = 5000; // 5 seconds

    if (now - lastRoll < cooldownTime) {
      const remaining = ((cooldownTime - (now - lastRoll)) / 1000).toFixed(1);
      return api.sendMessage(`⏳ Please wait ${remaining}s before rolling again.`, event.threadID);
    }
    module.exports.cooldowns.set(userId, now);

    // Determine high-risk
    let highRisk = false;
    let betArg = args[0];
    if (args[0] && args[0].toLowerCase() === "high") {
      highRisk = true;
      betArg = args[1];
    }

    const bet = parseInt(betArg);
    if (!bet || bet <= 0)
      return api.sendMessage("⚠️ Invalid amount!", event.threadID);

    if (user.money < bet)
      return api.sendMessage("❌ Not enough coins!", event.threadID);

    // Roll dice
    const dice = Math.floor(Math.random() * 6) + 1;
    const diceEmojis = ["⚀","⚁","⚂","⚃","⚄","⚅"];
    const diceEmoji = diceEmojis[dice - 1];

    let resultText;
    let won = false;
    let amountChange = 0;

    if (highRisk) {
      if (dice >= 4 && dice <= 5) {
        amountChange = bet * 2;
        user.money += amountChange;
        resultText = `🎲 DICE ROLL: ${diceEmoji}
🔥 HIGH-RISK WIN! You earned +${amountChange} coins!`;
        won = true;
      } else if (dice === 6) {
        amountChange = bet * 5;
        user.money += amountChange;
        resultText = `🎲 DICE ROLL: ${diceEmoji} (6)
💥 MEGA JACKPOT! You won +${amountChange} coins!`;
        won = true;
      } else {
        amountChange = -bet;
        user.money -= bet;
        resultText = `🎲 DICE ROLL: ${diceEmoji}
💀 HIGH-RISK LOSE! You lost -${bet} coins.`;
      }
    } else {
      if (dice >= 4) {
        amountChange = dice === 6 ? bet * 2 : bet;
        user.money += amountChange;
        resultText = `🎲 DICE ROLL: ${diceEmoji}
${dice === 6 ? "💥 JACKPOT!" : "🔥 WIN!"} You ${dice === 6 ? "won double" : "earned"} +${amountChange} coins.`;
        won = true;
      } else {
        amountChange = -bet;
        user.money -= bet;
        resultText = `🎲 DICE ROLL: ${diceEmoji}
💀 LOSE! You lost -${bet} coins.`;
      }
    }

    // Update stats
    user.diceStats.played += 1;
    if (won) user.diceStats.wins += 1;
    else user.diceStats.losses += 1;
    user.diceStats.profit += amountChange;

    // Save user data
    await usersData.set(userId, user);

    // Send result
    api.sendMessage(`${resultText}\n💰 Balance: ${user.money}`, event.threadID);
  }
};
