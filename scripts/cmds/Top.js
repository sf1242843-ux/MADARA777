module.exports = {
  config: {
    name: "top",
    version: "13.0-ultra-mega",
    author: "Sheikh Fahim (Ultra Infinite Mega God-Level Designs)",
    role: 0,
    shortDescription: { en: "Ultimate Infinite God-Tier Leaderboard" },
    category: "group",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message, usersData, event }) {
    try {
      const users = await usersData.getAll();

      const list = users.map(u => ({
        id: u.userID,
        name: u.name || "Unknown",
        money: Number(u.money) || 0,
        level: Math.max(1, Number(u.level) || 1)
      })).sort((a, b) => b.money - a.money);

      const top10 = list.slice(0, 10);
      const globalWealth = list.reduce((a,b)=>a+b.money,0);

      // ===== UTILITIES =====
      function formatMoney(n){
        if(n>=1e12) return (n/1e12).toFixed(2)+"T";
        if(n>=1e9) return (n/1e9).toFixed(2)+"B";
        if(n>=1e6) return (n/1e6).toFixed(2)+"M";
        if(n>=1e3) return (n/1e3).toFixed(1)+"K";
        return n.toString();
      }

      function progressBar(level,maxLevel=10){
        const ratio = Math.min(level/maxLevel,1);
        const total = 10;
        const filled = Math.max(1,Math.round(ratio*total));
        const empty = total-filled;
        const bars = [
          "█▓▒░","🟩🟦🟥🟨","★☆✨💫","🌈🟦🟧🟥🟨","🟦🟦🟩🟨","▓▒░░░","💫✨💎","🟩🟩🟦🟦"
        ];
        const style = bars[Math.floor(Math.random()*bars.length)];
        let bar="";
        for(let i=0;i<filled;i++) bar+=style[Math.floor(Math.random()*style.length)];
        for(let i=0;i<empty;i++) bar+="░";
        return `[${bar}] ${Math.floor((filled/total)*100)}%`;
      }

      // ===== DESIGN LIBRARIES =====
      const topBorders=["╭─","╔═","◈","⊱","★","✨","⫸","▞▚","◉","✥","⸻","╒═","╓═","╔╦","╔╤","╔╥","╔≡","⊲","⊳","⫷","⫸"];
      const bottomBorders=["╰─╯","╚═╝","◈","⊰","★","✨","⫷","▞▚","◉","✥","⸻","╘═","╙═","╚╩","╚╧","╚╨","╚≡","⊲","⊳","⫷","⫸"];
      const dividers=["─","═","⸻","✥","★","⊱","✨","◈","⫸","▞▚","◉","◇","✦","➤","➥","❖","•","~","¤"];
      const soulQuotes=[
        "Stars shine brightest in the darkest night.",
        "Greatness grows silently.",
        "Consistency beats talent.",
        "Discipline creates legends.",
        "Rise slowly. Fall never.",
        "Patience is strength.",
        "Hustle in silence.",
        "Your effort defines you.",
        "Every step counts.",
        "Dreams demand hustle.",
        "Power is earned, not given.",
        "Legends are built daily.",
        "Effort over excuses.",
        "Silence is stronger than noise.",
        "Your grind speaks for itself.",
        "Believe and conquer.",
        "Strength comes from within.",
        "Focus fuels success.",
        "Victory belongs to the persistent.",
        "Your destiny awaits.",
        "Work like a titan.",
        "Stars envy your shine.",
        "Rise and shine endlessly.",
        "Your legacy starts today.",
        "Fortune favors the bold.",
        "Conquer quietly.",
        "Every struggle builds power.",
        "Your patience is your weapon.",
        "Master yourself first.",
        "Legends fear no night.",
        "Glory belongs to those who act.",
        "Dream. Hustle. Repeat.",
        "The climb is your story.",
        "Fear is your fuel.",
        "Chaos makes diamonds.",
        "Your focus is unmatched.",
        "Push limits daily.",
        "Rise with the sun.",
        "Endure and thrive.",
        "Power is in your discipline.",
        "Small steps, giant results.",
        "Your sweat writes history.",
        "Stars follow your path.",
        "Strength is quiet.",
        "Hustle beyond limits.",
        "Your grind never lies.",
        "Champion your destiny.",
        "Create your empire.",
        "Every moment matters.",
        "Shine when unseen."
      ];

      const titles=["🔱 OVERLORD","💎 MONARCH","⚡ LEGEND","🔥 WARLORD","🛡️ TITAN","🌌 CELESTIAL","🌟 SUPREME","🪐 COSMIC","⚡ SHADOW","💫 NOVA"];

      // ===== RANDOM DESIGN GENERATOR =====
      function randomDesign(u){
        const top = topBorders[Math.floor(Math.random()*topBorders.length)];
        const bottom = bottomBorders[Math.floor(Math.random()*bottomBorders.length)];
        const div = dividers[Math.floor(Math.random()*dividers.length)].repeat(6+Math.floor(Math.random()*12));
        return `
${top}${div}
${u.title} | ${u.name}
💰 ${u.money} | Lv ${u.level}
Progress: ${u.bar}
${bottom}${div}`;
      }

      // ===== BUILD TOP 10 BOARD =====
      let board = top10.map((u,i)=>{
        const title=titles[i]||`🏅 Rank ${i+1}`;
        return randomDesign({
          title,
          name:u.name,
          money:formatMoney(u.money),
          level:u.level,
          bar:progressBar(u.level)
        });
      }).join("\n");

      // ===== YOUR RANK =====
      const myIndex=list.findIndex(u=>u.id===event.senderID);
      let yourRank="";
      if(myIndex!==-1){
        const me=list[myIndex];
        yourRank=`
════════════════════════
👤 YOUR RANK
════════════════════════
Position: ${myIndex+1}
${me.name}
💰 ${formatMoney(me.money)}
🛡 Level ${me.level}
${progressBar(me.level)}
════════════════════════`;
      }

      // ===== RANDOM SOUL QUOTE =====
      const quote=soulQuotes[Math.floor(Math.random()*soulQuotes.length)];

      // ===== SEND LEADERBOARD =====
      message.reply(`
════════════════════════
🏆 ULTRA INFINITE GOD-TIER LEADERBOARD
🌐 Global Wealth: ${formatMoney(globalWealth)} | Server Status: 🟢 Stable
════════════════════════

${board}

${yourRank}

─── ʚ♡︎ɞ ───
${quote}
─── ʚ♡︎ɞ ───
💡 Stay active • Earn smart • Rise higher
`);
    } catch(err){
      console.error(err);
      message.reply("❌ Leaderboard failed.");
    }
  }
};
