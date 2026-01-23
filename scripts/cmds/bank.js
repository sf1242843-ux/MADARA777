 /**
 * FINAL Ultimate Bank System (STABLE)
 * Data Safe • Auto Backup • No Reset Issue
 * Transaction History • Premium Bank Card
 * Loan • Jail • Freeze • Slot Compatible
 */

const fs = require("fs");
const DATA_PATH = __dirname + "/bankData.json";
const BACKUP_PATH = __dirname + "/bankData.backup.json";

/* ========== INIT FILE ========== */
if (!fs.existsSync(DATA_PATH)) {
  fs.writeFileSync(DATA_PATH, JSON.stringify({}, null, 2), "utf8");
}

/* ========== CONFIG ========== */
const ADMINS = ["61585911203262"];
let INTEREST_RATE = 10;
const FINE_RATE = 5;
const FREEZE_AFTER = 2;
const JAIL_TIME = 30 * 60 * 1000;
const MAX_HISTORY = 10;

/* ========== SAFE DATA HANDLER ========== */
const getData = () => {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    if (!raw || raw.trim() === "") return {};
    return JSON.parse(raw);
  } catch (e) {
    console.log("⚠️ Bank data corrupted. Loading backup...");
    if (fs.existsSync(BACKUP_PATH)) {
      return JSON.parse(fs.readFileSync(BACKUP_PATH, "utf8"));
    }
    return {};
  }
};

const saveData = (data) => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.log("❌ Failed saving bank data", e);
  }
};

/* ========== RANK SYSTEM ========== */
const RANKS = [
  { name: "Bronze", min: 0, maxLoan: 2000, emoji: "🥉" },
  { name: "Silver", min: 5000, maxLoan: 5000, emoji: "🥈" },
  { name: "Gold", min: 20000, maxLoan: 15000, emoji: "🥇" },
  { name: "Platinum", min: 50000, maxLoan: 30000, emoji: "💎" },
  { name: "Elite", min: 100000, maxLoan: 60000, emoji: "👑" }
];

const getRank = (bal) => [...RANKS].reverse().find(r => bal >= r.min);

/* ========== TRANSACTION HISTORY ========== */
function addHistory(user, text) {
  if (!user.history) user.history = [];
  user.history.unshift(`🕒 ${new Date().toLocaleString()} • ${text}`);
  if (user.history.length > MAX_HISTORY)
    user.history = user.history.slice(0, MAX_HISTORY);
}

/* ========== POLICE NOTICE ========== */
function policeNotice(name, loan, fine, status, due) {
  return (
    `🚨🚔 GOVERNMENT POLICE NOTICE 🚔🚨\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `👤 Name: ${name}\n` +
    `📂 Case: BANK LOAN DEFAULT\n` +
    `💳 Due: $${loan}\n` +
    (fine ? `💸 Fine: $${fine}\n` : "") +
    `⏰ Deadline: ${due ? new Date(due).toLocaleString() : "N/A"}\n` +
    `🔒 Status: ${status}\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `❗ FINAL WARNING`
  );
}

module.exports = {
  config: {
    name: "bank",
    version: "8.1",
    author: "ADMIN KABIR👑",
    countDown: 5,
    shortDescription: { en: "🏦 Premium Bank System (Stable)" },
    category: "economy"
  },

  onStart: async function ({ message, event, args, usersData }) {
    const uid = event.senderID;
    const now = Date.now();
    const data = getData();

    if (!data[uid]) {
      data[uid] = {
        balance: 0,
        loan: 0,
        loanDue: 0,
        registered: false,
        warns: 0,
        frozen: false,
        jailedUntil: 0,
        lastWarn: 0,
        history: []
      };
      saveData(data);
    }

    const user = data[uid];
    const name = await usersData.getName(uid);

    /* ========== JAIL CHECK ========== */
    if (user.jailedUntil && now < user.jailedUntil) {
      if (!["balance", "repay"].includes(args[0])) {
        return message.reply(
          `🚓 POLICE JAIL\n⏳ Remaining: ${Math.ceil((user.jailedUntil - now) / 60000)} min\n🔒 Only balance & repay allowed`
        );
      }
    }

    /* ========== REGISTER ========== */
    if (args[0] === "register") {
      if (user.registered) return message.reply("❌ Already registered.");
      user.registered = true;
      user.balance = 1000;
      addHistory(user, "🏦 Account registered (+$1000)");
      saveData(data);
      return message.reply("🏦 Bank account created\n💰 Bonus: $1000");
    }

    if (!user.registered)
      return message.reply("⚠️ Use `bank register` first");

    /* ========== AUTO JAIL ========== */
    if (user.loan > 0 && user.loanDue && now > user.loanDue && !user.jailedUntil) {
      user.jailedUntil = now + JAIL_TIME;
      user.frozen = true;
      addHistory(user, "🚓 Arrested for loan default");
      saveData(data);
      return message.reply("🚓 ARRESTED\n⛓ Jail Time: 30 minutes");
    }

    /* ========== WARNING & FINE ========== */
    if (user.loan > 0 && user.balance < user.loan * 0.3) {
      if (now - user.lastWarn > 6 * 60 * 60 * 1000) {
        user.lastWarn = now;
        user.warns++;

        let fine = 0;
        if (user.warns >= 2) {
          fine = Math.floor((user.loan * FINE_RATE) / 100);
          user.loan += fine;
          addHistory(user, `💸 Police fine added $${fine}`);
        }

        if (user.warns >= FREEZE_AFTER) user.frozen = true;
        saveData(data);

        return message.reply(
          policeNotice(
            name,
            user.loan,
        
