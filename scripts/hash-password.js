/**
 * Run this once to generate a bcrypt hash for your password.
 * Usage:  node scripts/hash-password.js
 * Then copy the printed hash into your .env as PASSWORD_HASH=...
 */
const bcrypt = require("bcryptjs");
const readline = require("readline");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Enter the password you want to use: ", async (password) => {
    if (!password || password.length < 8) {
        console.error("Password must be at least 8 characters.");
        process.exit(1);
    }
    const hash = await bcrypt.hash(password, 12);
    console.log("\nAdd this to your .env file:\n");
    console.log(`PASSWORD_HASH=${hash}\n`);
    rl.close();
});
