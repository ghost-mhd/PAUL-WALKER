require("dotenv").config();
const config = require("./config");
const pino = require("pino");
const fs = require("fs");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");

// ─── Chargement automatique des plugins ──────────────────────────────────────
const plugins = {};
fs.readdirSync("./plugins").forEach((file) => {
  const plugin = require(`./plugins/${file}`);
  plugins[plugin.name] = plugin;
  console.log(`✅ Plugin chargé : ${plugin.name}`);
});
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
  });
  console.log(` le prefixe est ${config.prefixes}`);
  // ecoute au message entrants
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return
    for (const msg of messages) {
      if (!msg.message) continue
      const start = Date.now();
      const from = msg.key.remoteJid;
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
      console.log(`${msg.pushName}: ${text}`)

      // ─── Détection du préfixe ───────────────────────────────────────────
      const prefix = config.prefixes.find(p => text.startsWith(p));
      if (!prefix) continue;

      const args = text.slice(prefix.length).trim().split(/\s+/);
      const commandName = args.shift().toLowerCase();

      // ─── Exécution du plugin ────────────────────────────────────────────
      if (plugins[commandName]) {
        await plugins[commandName].execute({sock, from, args, start, plugins});
      } else {
        await sock.sendMessage(from, { text: `❓ Commande inconnue : *${prefix}${commandName}*` });
      }
    }
  });
  if (!sock.authState.creds.registered) {
    setTimeout(async () => {
      let code = await sock.requestPairingCode(process.env.PHONE_NUMBER);
      console.log(`Pairing code: ${code}`);
    }, 3000);
  }
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
        if (shouldReconnect) startBot();  // ✅
    }
    console.log("Connection update:", update);
    if (connection === "open") {
      console.log("Bot is ready!");
    }
  });
}

startBot();
