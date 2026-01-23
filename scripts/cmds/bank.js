const fs = require('fs');

/**
 * BANK SYSTEM CONFIGURATION
 */
const DATA_FILE = './bankDB.json';
const decoration = {
    line: "╔═════ஜ۩۞۩ஜ═════╗",
    footer: "╚═════ஜ۩۞۩ஜ═════╝",
    bankHeader: "[ 🏦 Bank 🏦 ]"
};

// Database Initialization
let db = {};
if (fs.existsSync(DATA_FILE)) {
    try {
        db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (err) {
        console.error("Error reading DB file:", err);
        db = {};
    }
}

const saveDB = () => fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));

// Cooldown Tracker (Temporary in-memory)
const cooldowns = new Map();

const BankBot = {

    // Check Cooldown Logic
    checkCooldown: (uid, commandName, seconds = 7) => {
        const key = `${uid}_${commandName}`;
        const now = Date.now();
        if (cooldowns.has(key)) {
            const expirationTime = cooldowns.get(key) + (seconds * 1000);
            if (now < expirationTime) {
                const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
                return `⏱️ YOU ARE IN THE WAITING TIME TO USE THIS COMMAND, PLEASE COME BACK AFTER ${timeLeft}s`;
            }
        }
        cooldowns.set(key, now);
        return null;
    },

    // 1. REGISTER
    register: (uid, name) => {
        if (db[uid]) return "⚠️ You already have a bank account!";
        db[uid] = { name, balance: 1000, loan: 0 };
        saveDB();
        return `🏦 **Bank account created**\n💰 **Bonus: $1000**`;
    },

    // 2. DEPOSIT
    deposit: (uid, amount) => {
        if (!db[uid]) return "❌ Please register first.";
        amount = Number(amount);
        if (isNaN(amount) || amount <= 0) return "❌ Enter a valid amount.";
        db[uid].balance += amount;
        saveDB();
        return `${decoration.line}\n\n❏ Successfully deposited $${amount} into your bank account ✅\n\n${decoration.footer}`;
    },

    // 3. WITHDRAW
    withdraw: (uid, amount) => {
        if (!db[uid]) return "❌ No account found.";
        amount = Number(amount);
        if (isNaN(amount) || amount <= 0) return "❌ Enter a valid amount.";
        if (amount > db[uid].balance) return "❌ Insufficient balance!";
        db[uid].balance -= amount;
        saveDB();
        return `💸 Successfully withdrew $${amount}.`;
    },

    // 4. BALANCE (With Card Image placeholder)
    balance: (uid) => {
        const user = db[uid];
        if (!user) return { text: "❌ Register first." };

        const cardImageUrl = `https://dummyimage.com/600x400/2c2f33/ffffff&text=CARD:+${encodeURIComponent(user.name)}+Bal:+$${user.balance}`;

        return {
            text: `${decoration.line}\n${decoration.bankHeader}\n\n👤 Name: ${user.name}\n💰 Balance: $${user.balance}\n🏦 Loan: $${user.loan}\n\n${decoration.footer}`,
            image: cardImageUrl
        };
    },

    // 5. INTEREST
    interest: (uid) => {
        if (!db[uid]) return "❌ No account.";
        const interestAmount = Math.floor(db[uid].balance * 0.05);
        db[uid].balance += interestAmount;
        saveDB();
        return `📈 Interest applied! You earned $${interestAmount}.`;
    },

    // 6. TRANSFER
    transfer: (senderUid, targetUid, amount) => {
        if (!db[senderUid] || !db[targetUid]) return "❌ User not found.";
        amount = Number(amount);
        if (isNaN(amount) || amount <= 0) return "❌ Enter a valid amount.";
        if (amount > db[senderUid].balance) return "❌ Insufficient balance.";

        db[senderUid].balance -= amount;
        db[targetUid].balance += amount;
        saveDB();
        return `✅ Transferred $${amount} to ${db[targetUid].name} successfully.`;
    },

    // 7. RICHEST (Top 10)
    richest: (uid) => {
        const cooldownMsg = BankBot.checkCooldown(uid, 'richest', 7);
        if (cooldownMsg) return cooldownMsg;

        const sorted = Object.values(db)
            .sort((a, b) => b.balance - a.balance)
            .slice(0, 10);

        let msg = `${decoration.line}\n\n${decoration.bankHeader}\n\n❏ Top 10 richest people according to their bank balance 👑:\n`;
        sorted.forEach((u, i) => {
            msg += `[${i + 1}. ${u.name} - $${u.balance.toLocaleString()}]\n`;
        });
        msg += `\n${decoration.footer}`;
        return msg;
    },

    // 8. LOAN
    loan: (uid, amount) => {
        if (!db[uid]) return "❌ Register first.";
        amount = Number(amount);
        if (isNaN(amount) || amount <= 0) return "❌ Enter a valid amount.";
        if (db[uid].loan > 0) return "❌ You still have an unpaid loan.";

        db[uid].loan = amount;
        db[uid].balance += amount;
        saveDB();
        return `🏦 Loan of $${amount} granted!`;
    },

    // 9. PAYLOAN
    payloan: (uid, amount) => {
        if (!db[uid] || db[uid].loan <= 0) return "❌ You don't have a loan.";
        amount = Number(amount);
        if (isNaN(amount) || amount <= 0) return "❌ Enter a valid amount.";
        if (amount > db[uid].balance) return "❌ Not enough money to pay.";

        const payAmount = Math.min(amount, db[uid].loan);
        db[uid].balance -= payAmount;
        db[uid].loan -= payAmount;
        saveDB();
        return `✅ Paid $${payAmount}. Remaining loan debt: $${db[uid].loan}`;
    }
};

module.exports = BankBot;
