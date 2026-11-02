// Benutzung:  node tools/hash.mjs max@mail.de "Wunschpasswort"
// Gibt eine Zeile für die USERS-Variable in Cloudflare aus (Passwort selbst wird nirgends gespeichert).
import { pbkdf2Sync, randomBytes } from "node:crypto";
const [email, pw] = process.argv.slice(2);
if (!email || !pw) { console.error('Benutzung: node tools/hash.mjs email "passwort"'); process.exit(1); }
const salt = randomBytes(16);
const hash = pbkdf2Sync(pw, salt, 100000, 32, "sha256");
console.log(`"${email.trim().toLowerCase()}": "pbkdf2$100000$${salt.toString("base64url")}$${hash.toString("base64url")}"`);
