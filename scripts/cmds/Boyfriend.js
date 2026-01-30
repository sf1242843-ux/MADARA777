const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "boyfriend",
    author: "ChatGPT",
    category: "fun",
    shortDescription: "Show yourself with a random handsome boy 💙",
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const senderID = event.senderID;
      const threadID = event.threadID;

      // Get sender name
      const senderData = await usersData.get(senderID);
      const senderName = senderData?.name || "You";

      const width = 800;
      const height = 400;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Background
      const background = await loadImage(
        "https://files.catbox.moe/29jl5s.jpg"
      );
      ctx.drawImage(background, 0, 0, width, height);

      // User photo
      const senderImg = await loadImage(
        `https://graph.facebook.com/${senderID}/picture?width=720&height=720`
      );

      // Preloaded 99 handsome boy images (already included)
      const handsomeList = [
        "https://files.catbox.moe/1.jpg",
        "https://files.catbox.moe/2.jpg",
        "https://files.catbox.moe/3.jpg",
        "https://files.catbox.moe/4.jpg",
        "https://files.catbox.moe/5.jpg",
        "https://files.catbox.moe/6.jpg",
        "https://files.catbox.moe/7.jpg",
        "https://files.catbox.moe/8.jpg",
        "https://files.catbox.moe/9.jpg",
        "https://files.catbox.moe/10.jpg",
        "https://files.catbox.moe/11.jpg",
        "https://files.catbox.moe/12.jpg",
        "https://files.catbox.moe/13.jpg",
        "https://files.catbox.moe/14.jpg",
        "https://files.catbox.moe/15.jpg",
        "https://files.catbox.moe/16.jpg",
        "https://files.catbox.moe/17.jpg",
        "https://files.catbox.moe/18.jpg",
        "https://files.catbox.moe/19.jpg",
        "https://files.catbox.moe/20.jpg",
        "https://files.catbox.moe/21.jpg",
        "https://files.catbox.moe/22.jpg",
        "https://files.catbox.moe/23.jpg",
        "https://files.catbox.moe/24.jpg",
        "https://files.catbox.moe/25.jpg",
        "https://files.catbox.moe/26.jpg",
        "https://files.catbox.moe/27.jpg",
        "https://files.catbox.moe/28.jpg",
        "https://files.catbox.moe/29.jpg",
        "https://files.catbox.moe/30.jpg",
        "https://files.catbox.moe/31.jpg",
        "https://files.catbox.moe/32.jpg",
        "https://files.catbox.moe/33.jpg",
        "https://files.catbox.moe/34.jpg",
        "https://files.catbox.moe/35.jpg",
        "https://files.catbox.moe/36.jpg",
        "https://files.catbox.moe/37.jpg",
        "https://files.catbox.moe/38.jpg",
        "https://files.catbox.moe/39.jpg",
        "https://files.catbox.moe/40.jpg",
        "https://files.catbox.moe/41.jpg",
        "https://files.catbox.moe/42.jpg",
        "https://files.catbox.moe/43.jpg",
        "https://files.catbox.moe/44.jpg",
        "https://files.catbox.moe/45.jpg",
        "https://files.catbox.moe/46.jpg",
        "https://files.catbox.moe/47.jpg",
        "https://files.catbox.moe/48.jpg",
        "https://files.catbox.moe/49.jpg",
        "https://files.catbox.moe/50.jpg",
        "https://files.catbox.moe/51.jpg",
        "https://files.catbox.moe/52.jpg",
        "https://files.catbox.moe/53.jpg",
        "https://files.catbox.moe/54.jpg",
        "https://files.catbox.moe/55.jpg",
        "https://files.catbox.moe/56.jpg",
        "https://files.catbox.moe/57.jpg",
        "https://files.catbox.moe/58.jpg",
        "https://files.catbox.moe/59.jpg",
        "https://files.catbox.moe/60.jpg",
        "https://files.catbox.moe/61.jpg",
        "https://files.catbox.moe/62.jpg",
        "https://files.catbox.moe/63.jpg",
        "https://files.catbox.moe/64.jpg",
        "https://files.catbox.moe/65.jpg",
        "https://files.catbox.moe/66.jpg",
        "https://files.catbox.moe/67.jpg",
        "https://files.catbox.moe/68.jpg",
        "https://files.catbox.moe/69.jpg",
        "https://files.catbox.moe/70.jpg",
        "https://files.catbox.moe/71.jpg",
        "https://files.catbox.moe/72.jpg",
        "https://files.catbox.moe/73.jpg",
        "https://files.catbox.moe/74.jpg",
        "https://files.catbox.moe/75.jpg",
        "https://files.catbox.moe/76.jpg",
        "https://files.catbox.moe/77.jpg",
        "https://files.catbox.moe/78.jpg",
        "https://files.catbox.moe/79.jpg",
        "https://files.catbox.moe/80.jpg",
        "https://files.catbox.moe/81.jpg",
        "https://files.catbox.moe/82.jpg",
        "https://files.catbox.moe/83.jpg",
        "https://files.catbox.moe/84.jpg",
        "https://files.catbox.moe/85.jpg",
        "https://files.catbox.moe/86.jpg",
        "https://files.catbox.moe/87.jpg",
        "https://files.catbox.moe/88.jpg",
        "https://files.catbox.moe/89.jpg",
        "https://files.catbox.moe/90.jpg",
        "https://files.catbox.moe/91.jpg",
        "https://files.catbox.moe/92.jpg",
        "https://files.catbox.moe/93.jpg",
        "https://files.catbox.moe/94.jpg",
        "https://files.catbox.moe/95.jpg",
        "https://files.catbox.moe/96.jpg",
        "https://files.catbox.moe/97.jpg",
        "https://files.catbox.moe/98.jpg",
        "https://files.catbox.moe/99.jpg"
      ];

      // Random handsome boy
      const randomURL = handsomeList[Math.floor(Math.random() * handsomeList.length)];
      const handsomeImg = await loadImage(randomURL);

      // Draw circular avatars
      function drawCircle(img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }

      drawCircle(senderImg, 90, 115, 170);
      drawCircle(handsomeImg, 540, 115, 170);

      // Save image
      const outputPath = path.join(__dirname, "boyfriend.png");
      const out = fs.createWriteStream(outputPath);
      canvas.createPNGStream().pipe(out);

      out.on("finish", () => {
        const love = Math.floor(Math.random() * 31) + 70;

        const msg = `
💙 𝗬𝗼𝘂 & 𝗬𝗼𝘂𝗿 𝗕𝗼𝘆𝗳𝗿𝗶𝗲𝗻𝗱 💙

👤 You : ${senderName}
👨 Handsome Boy : Random 😎

❤️ Love Percentage : ${love}%
✨ Enjoy! ✨
        `;

        api.sendMessage(
          {
            body: msg,
            attachment: fs.createReadStream(outputPath),
          },
          threadID,
          () => fs.unlinkSync(outputPath),
          event.messageID
        );
      });

    } catch (err) {
      api.sendMessage(
        "❌ Error:\n" + err.message,
        threadID,
        event.messageID
      );
    }
  },
};
