module.exports.run = async (bot, message, args) => {

    const m = await message.channel.send("Ping?");
    m.edit(`Pong! ${bot.ws.ping}ms`);

}

module.exports.help = {
    name: "ping",
    aliases: ["p"]
}