module.exports = {
  name: "bank",
  aliases: ["bk"],
  description: "Bank system (deposit, withdraw, transfer, balance)",
  cooldowns: 5,

  execute: async (api, event, args, usersData) => {
    const { threadID, senderID, mentions } = event;

    // Get user data
    let user = await usersData.get(senderID);
    if (!user) {
      user = { money: 0, bank: 0 };
      await usersData.set(senderID, user);
    }

    const sub = args[0];

    // BALANCE
    if (!sub || sub === "balance") {
      return api.sendMessage(
        `🏦 BANK INFO\n\n💵 Wallet: ${user.money}\n🏦 Bank: ${user.bank}`,
        threadID
      );
    }

    // DEPOSIT
    if (sub === "deposit") {
      const amount = parseInt(args[1]);
      if (!amount || amount <= 0)
        return api.sendMessage("❌ Usage: /bank deposit <amount>", threadID);

      if (amount > user.money)
        return api.sendMessage("❌ You don't have enough wallet money.", threadID);

      user.money -= amount;
      user.bank += amount;
      await usersData.set(senderID, user);

      return api.sendMessage(
        `✅ Deposit Successful!\n\n💵 -${amount}\n🏦 Bank Balance: ${user.bank}`,
        threadID
      );
    }

    // WITHDRAW
    if (sub === "withdraw") {
      const amount = parseInt(args[1]);
      if (!amount || amount <= 0)
        return api.sendMessage("❌ Usage: /bank withdraw <amount>", threadID);

      if (amount > user.bank)
        return api.sendMessage("❌ Not enough money in bank.", threadID);

      user.bank -= amount;
      user.money += amount;
      await usersData.set(senderID, user);

      return api.sendMessage(
        `✅ Withdraw Successful!\n\n💵 +${amount}\n🏦 Bank Balance: ${user.bank}`,
        threadID
      );
    }

    // TRANSFER
    if (sub === "transfer") {
      const mentionID = Object.keys(mentions)[0];
      const amount = parseInt(args[2]);

      if (!mentionID || !amount || amount <= 0)
        return api.sendMessage(
          "❌ Usage: /bank transfer @user <amount>",
          threadID
        );

      if (amount > user.bank)
        return api.sendMessage("❌ Not enough money in bank.", threadID);

      let target = await usersData.get(mentionID);
      if (!target) {
        target = { money: 0, bank: 0 };
      }

      user.bank -= amount;
      target.bank += amount;

      await usersData.set(senderID, user);
      await usersData.set(mentionID, target);

      return api.sendMessage(
        `✅ Transfer Successful!\n\n🏦 Sent ${amount} to ${mentions[mentionID]}`,
        threadID
      );
    }

    // UNKNOWN
    return api.sendMessage(
      "❌ Commands:\n/bank balance\n/bank deposit <amount>\n/bank withdraw <amount>\n/bank transfer @user <amount>",
      threadID
    );
  }
};
