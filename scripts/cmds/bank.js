📄 | Source code of "bank.js":

/**
 * FINAL Ultimate Bank System
 * Transaction History • Premium Bank Card
 * Loan Time • Jail • Freeze • Slot Compatible
 * Admin Help Hidden
 */

const fs = require("fs");
const path = __dirname + "/bankData.json";

if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}, null, 2));

/* ========== CONFIG ========== */
const ADMINS = ["61585966465927"]; // 🔴 YOUR UID
let INTEREST_RATE = 10;
const FINE_RATE = 5;
const FREEZE_AFTER = 2;
const JAIL_TIME = 30 * 60 * 1000;
const MAX_HISTORY = 10;

/* ========== DATA HANDLER ========== */
const getData = () => JSON.parse(fs.readFileSync(path));
const saveData = (d) => fs.writeFileSync(path, JSON.stringify(d, null, 2));

/* ========== RANK SYSTEM ========== */
const RANKS = [
  { name: "Bronze", min: 0, maxLoan: 2000, emoji: "🥉" },
  { name: "Silver", min: 5000, maxLoan: 5000, emoji: "🥈" },
  { name: "Gold", min: 20000, maxLoan: 15000, emoji: "🥇" },
  { name: "Platinum", min: 50000, maxLoan: 30000, emoji: "💎" },
  { name: "Elite", min: 100000, maxLoan: 60000, emoji: "👑" }
];
const getRank = (bal) => [...RANKS].reverse().find(r => bal >= r.min);

/* ========== TRANSACTION LOG ========== */
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
    version: "8.0",
    author: "ADMIN KABIR👑",
    countDown: 5,
    shortDescription: { en: "🏦 Premium Bank System" },
    category: "economy"
  },

  onStart: async function ({ message, event, args, usersData }) {
    const uid = event.senderID;
    const data = getData();
    const now = Date.now();

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
          `🚓 **POLICE JAIL**\n⏳ Remaining: ${Math.ceil((user.jailedUntil - now) / 60000)} min\n🔒 Only balance & repay allowed`
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

    /* ========== AUTO JAIL ON DUE MISS ========== */
    if (user.loan > 0 && user.loanDue && now > user.loanDue && !user.jailedUntil) {
      user.jailedUntil = now + JAIL_TIME;
      user.frozen = true;
      addHistory(user, "🚓 Arrested for loan default");
      saveData(data);
      return message.reply("🚓 **ARRESTED**\n⛓ Jail Time: 30 minutes");
    }

    /* ========== AUTO WARNING / FINE ========== */
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
            fine,
            user.frozen ? "FROZEN" : "UNDER WATCH",
            user.loanDue
          )
        );
      }
    }

    /* ========== FREEZE CHECK ========== */
    if (user.frozen && !["balance", "repay"].includes(args[0])) {
      return message.reply("🔒 **ACCOUNT FROZEN**\nOnly balance & repay allowed");
    }

    /* ========== PUBLIC HELP ========== */
    if (!args[0]) {
      return message.reply(
        `🏦 **PREMIUM BANK FACILITIES**\n\n` +
        `💳 bank card – View bank card\n` +
        `💰 bank balance – Check balance\n` +
        `➕ bank deposit <amount>\n` +
        `➖ bank
