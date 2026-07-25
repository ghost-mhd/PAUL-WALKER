const fs = require("fs");
const path = require("path");
const config = require("../config");

const menuImages = [
  path.resolve("assets/menu1.jpg"),
  path.resolve("assets/menu2.jpg"),
  path.resolve("assets/menu3.jpg"),
];

module.exports = {
  name: "menu",
  description: "Affiche la liste des commandes",
  category: "general",
  execute: async ({ sock, from, plugins }) => {
    const prefix = config.prefixes[0];
    const commandes = Object.values(plugins);

    // ─── Texte du menu ────────────────────────────────────────────────────────
    let texte = `╔══════════════════════╗\n`;
    texte    += `║   *${config.botName}*   ║\n`;
    texte    += `╚══════════════════════╝\n\n`;
    texte    += `👤 *Owner :* ${config.ownerName}\n`;
    texte    += `🔑 *Préfixes :* ${config.prefixes.join("  ")}\n`;
    texte    += `📦 *Commandes :* ${commandes.length}\n\n`;
    texte    += `━━━━━━━━━━━━━━━━━━━━━━\n`;

    commandes.forEach(cmd => {
      texte += `▸ *${prefix}${cmd.name}* — ${cmd.description}\n`;
    });

    texte += `━━━━━━━━━━━━━━━━━━━━━━`;

    // ─── Image aléatoire ─────────────────────────────────────────────────────
    const imgPath = menuImages[Math.floor(Math.random() * menuImages.length)];
    const image = fs.readFileSync(imgPath);

    await sock.sendMessage(from, { image, caption: texte });
  },
};
