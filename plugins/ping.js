module.exports = {
  name: "ping",
  description: "Ping command",
  category: "general",
  execute: async({sock, from, start}) => {

    await sock.sendMessage(from, { text: "calcule en cours...." });
 const latance = Date.now() - start
    await sock.sendMessage(from, { text: `Pong 🏓! ${latance}ms statut : en ligne 🥳` });
  }
}
