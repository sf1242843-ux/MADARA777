module.exports = {
  config: {
    name: "needbf",
    aliases: ["needbfimg", "needbfimage"],
    version: "1.0",
    author: "YourName",
    countDown: 5,
    role: 0,
    shortDescription: "Sends a random needbf image",
    longDescription: "This module sends a random image from the provided needbf image links.",
    category: "media",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    const links = [
      "https://files.catbox.moe/96jvmd.jpg",
      "https://files.catbox.moe/qfemmy.jpg",
      "https://files.catbox.moe/ihat6h.jpg",
      "https://files.catbox.moe/k86hc0.jpg",
      "https://files.catbox.moe/zdqcwu.jpg",
      "https://files.catbox.moe/wzpahl.jpg",
      "https://files.catbox.moe/6nym3g.jpg",
      "https://files.catbox.moe/tz0ahe.jpg",
      "https://files.catbox.moe/67yx9t.jpg",
      "https://files.catbox.moe/e4n4jg.jpg",
      "https://files.catbox.moe/nfjyxc.jpg",
      "https://files.catbox.moe/9vj6zo.jpg",
      "https://files.catbox.moe/ggxmf9.jpg",
      "https://files.catbox.moe/0uhcpz.jpg",
      "https://files.catbox.moe/gbisv8.jpg",
      "https://files.catbox.moe/5fas9b.jpg",
      "https://files.catbox.moe/izuyha.jpg",
      "https://files.catbox.moe/slxfew.jpg",
      "https://files.catbox.moe/miegtd.jpg",
      "https://files.catbox.moe/8y2uzn.jpg",
      "https://files.catbox.moe/e4n4jg.jpg",
      "https://files.catbox.moe/w01ext.jpg",
      "https://files.catbox.moe/o5z5qg.jpg",
      "https://files.catbox.moe/7o51yn.jpg",
      "https://files.catbox.moe/6i8ol0.jpg",
      "https://files.catbox.moe/7o51yn.jpg",
      "https://files.catbox.moe/w01ext.jpg",
      "https://files.catbox.moe/s1eulw.jpg",
      "https://files.catbox.moe/n8iye2.jpg",
      "https://files.catbox.moe/vj6xjg.jpg",
      "https://files.catbox.moe/kzdiz3.jpg",
      "https://files.catbox.moe/ogtz3b.jpg",
      "https://files.catbox.moe/limwls.jpg",
      "https://files.catbox.moe/pofj3j.jpg",
      "https://files.catbox.moe/m50uvd.jpg",
      "https://files.catbox.moe/xpjoru.jpg",
      "https://files.catbox.moe/nf4ndd.jpg",
      "https://files.catbox.moe/0d4b2f.jpg",
      "https://files.catbox.moe/p1x3az.jpg",
      "https://files.catbox.moe/rct5bf.jpg",
      "https://files.catbox.moe/f4meoy.jpg",
      "https://files.catbox.moe/or3frr.jpg",
      "https://files.catbox.moe/t1uial.jpg",
      "https://files.catbox.moe/nuldnq.jpg",
      "https://files.catbox.moe/fkbibr.jpg",
      "https://files.catbox.moe/xxo5d3.jpg",
      "https://files.catbox.moe/hk4ohy.jpg",
      "https://files.catbox.moe/uoyxgv.jpg"
    ];

    const randomIndex = Math.floor(Math.random() * links.length);
    const selectedImage = links[randomIndex];

    try {
      return api.sendMessage(
        {
          body: `Here’s a random needbf image for you!`,
          attachment: await global.utils.getStreamFromURL(selectedImage)
        },
        event.threadID,
        event.messageID
      );
    } catch (error) {
      return api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
