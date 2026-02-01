module.exports = {
  config: {
    name: "top",
    version: "7.0",
    author: "sheikh fahim (Ultra Pro Edit)",
    role: 0,
    shortDescription: {
      en: "Ultra Live Rich Leaderboard"
    },
    category: "group",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, usersData, event }) {
    try {
      let lastRanks = {}; // track previous ranks for live emojis

      async function sendLeaderboard() {
        const allUsers = await usersData.getAll();
        const sortedUsers = allUsers
          .map(user => ({
            id: user.userID,
            name: user.name || "Unknown",
            money: Number(user.money) || 0
          }))
          .sort((a, b) => b.money - a.money);

        const top15 = sortedUsers.slice(0, 15);

        // Format money
        function formatMoney(num) {
          const units = ["", "K", "M", "B", "T", "Q"];
          let i = 0;
          while (num >= 1000 && i < units.length - 1) {
            num /= 1000;
            i++;
          }
          return num % 1 === 0 ? num + units[i] : num.toFixed(1) + units[i];
        }

        // Animated Progress Bar
        function animatedBar(current, next, length = 10) {
          if (!next || next <= current) return "🔥".repeat(length);
          const percent = Math.min(current / next, 1);
          const filled = Math.round(percent * length);
          const emojis = ["⚡","💸","🔥"];
          let bar = "";
          for (let i = 0; i < length; i++) {
            bar += i < filled ? emojis[i % emojis.length] : "░";
          }
          return bar;
        }

        // Badges
        function getBadge(index) {
          if (index === 0) return "👑✨";
          if (index === 1) return "🥈💫";
          if (index === 2) return "🥉🌟";
          if (index >= 3 && index <= 9) return "💎";
          return "✨";
        }

        // Build leaderboard with movement emojis
        const board = top15.map((user, index) => {
          const badge = getBadge(index);
          const crown = index === 0 ? "🔥 THE RICHEST 🔥\n" : "";
          const nextMoney = sortedUsers[index - 1]?.money || user.money;
          const bar = index === 0 ? "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥" : animatedBar(user.money, nextMoney);

          let movement = "➡️";
          if (lastRanks[user.id] != null) {
            if (lastRanks[user.id] > index) movement = "🔼";
            else if (lastRanks[user.id] < index) movement = "🔽";
          }
          lastRanks[user.id] = index;

          return `${badge} ${user.name} ${movement}
💰 ${formatMoney(user.money)}
Progress: [${bar}]
${crown}`;
        }).join("\n");

        // User rank display
        const yourIndex = sortedUsers.findIndex(u => u.id === event.senderID);
        let yourRankText = "";

        if (yourIndex !== -1) {
          const you = sortedUsers[yourIndex];
          const nextMoney = sortedUsers[yourIndex - 1]?.money || you.money;
          let progressToTop15 = "";
          if (yourIndex >= 15) {
            const top15Money = top15[top15.length - 1].money;
            const needed = top15Money - you.money;
            progressToTop15 = `💡 Money to reach top 15: ${needed > 0 ? formatMoney(needed) : "0"}`;
          }
          const miniBar = animatedBar(you.money, nextMoney);
          yourRankText =
`━━━━━━━━━━━━━━━━━━
🧑 YOUR RANK: #${yourIndex + 1} ${yourIndex === 0 ? "👑✨" : ""}
💵 Balance: ${formatMoney(you.money)}
Progress to next: [${miniBar}]
${progressToTop15}
━━━━━━━━━━━━━━━━━━`;
        }

        const msg =
`🌟━━━━━━━━━━━━━━━━🌟
      ULTRA LIVE RICH LIST
🌟━━━━━━━━━━━━━━━━🌟

${board}
${yourRankText}

💡 Tip: Keep grinding, stay flashy! ⚡🔥💸`;

        message.reply(msg);
      }

      // Initial send
      await sendLeaderboard();

      // Refresh every 15 seconds
      const interval = setInterval(sendLeaderboard, 15000);

      // Optional: stop after 5 mins
      setTimeout(() => clearInterval(interval), 5 * 60 * 1000);

    } catch (error) {
      console.error(error);
      message.reply("❌ Live leaderboard failed to load.");
    }
  }
};
