module.exports = {
  config: {
    name: "rules",
    version: "1.1",
    author: "sheikh fahim",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Group rules"
    },
    longDescription: {
      en: "Show group rules and warning system"
    },
    category: "group",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    const rulesText = `
📜 𝗚𝗥𝗢𝗨𝗣 𝗥𝗨𝗟𝗘𝗦 📜

1️⃣ No bad language  
2️⃣ No spam in group  
3️⃣ Respect all members  
4️⃣ No religious or political fights  
5️⃣ Follow admin instructions  
6️⃣ No fake news  

⚠️ 𝗪𝗔𝗥𝗡𝗜𝗡𝗚 𝗦𝗬𝗦𝗧𝗘𝗠 ⚠️
🔹 1st mistake = Warning  
🔹 2nd mistake = Final Warning  
🔹 After 2 warnings → Admin will be mentioned  
🔹 Then member will be removed from group 🚫

✅ Be friendly & stay active  
💖 Thank you
    `;

    return message.reply(rulesText);
  }
};
