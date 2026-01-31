module.exports = {
  config: {
    name: "top",
    version: "3.0",
    author: "sheikh fahim (Ultra Pro Edit)",
    role: 0,
    shortDescription: {
      en: "Ultra Rich Leaderboard"
    },
    category: "group",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, usersData, event }) {
    try {
      const allUsers = await usersData.getAll();

      // Clean + Safe data
      const sortedUsers = allUsers
        .map(user => ({
          id: user.userID,
          name: user.name || "Unknown",
          money: Number(user.money) || 0
        }))
        .sort((a, b) => b.money - a.money);

      const top15 = sortedUsers.slice(0, 15);

      // Number Formatter (pro version)
      function formatMoney(num) {
        const units = ["", "K", "M", "B", "T", "Q"];
        let i = 0;

        while (num >= 1000 && i < units.length - 1) {
          num /= 1000;
          i++;
        }

        return num % 1 === 0
          ? num + units[i]
          : num.toFixed(1) + units[i];
      }

      const medals = ["👑", "🥈", "🥉"];

      // Leaderboard text
      const board = top15.map((user, index) => {
        const icon = medals[index] || `✨ ${index + 1}.`;
        const crownLine = index === 0 ? "🔥 THE RICHEST 🔥\n" : "";

        return `${icon} ${user.name}
💰 ${formatMoney(user.money)}
${crownLine}`;
      }).join("\n");

      // Find user's rank
      const yourIndex = sortedUsers.findIndex(
        u => u.id === event.senderID
      );

      let yourRankText = "";

      if (yourIndex !== -1) {
        const you = sortedUsers[yourIndex];

        yourRankText =
`━━━━━━━━━━━━━━━━━━
🧑 YOUR RANK: #${yourIndex + 1}
💵 Balance: ${formatMoney(you.money)}
━━━━━━━━━━━━━━━━━━`;
      }

      const msg =
`👑━━━━━━━━━━━━━━━━👑
      ULTRA RICH LIST
👑━━━━━━━━━━━━━━━━👑

${board}
${yourRankText}

💡 Tip: Stay active, earn more, dominate the top!`;

      message.reply(msg);

    } catch (error) {
      console.error(error);
      message.reply("❌ Leaderboard failed to load.");
    }
  }
};
