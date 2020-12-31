const fs = require("fs");
const money = require("../money.json");
const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {

    let embed = new Discord.MessageEmbed();

    if(!args[0]) {
        var user = message.author;
    } else {
        var user = message.mentions.users.first() || bot.users.cache.get(args[0]);
    }

    if(!money[user.id]) {
        money[user.id] = {
            name: bot.users.cache.get(user.id).tag,
            money: 0
        }
        fs.writeFile("./money.json", JSON.stringify(money), (err) => {
            if(err) console.log(err);
        });
    }

    embed.setColor("ddc079");
    embed.setTitle(`Balance of ${bot.users.cache.get(user.id).username}`);
    embed.addField("Balance", `${money[user.id].money.toLocaleString()} credits`);
    embed.setThumbnail(user.displayAvatarURL({size: 4096, dynamic: true}));
    embed.setTimestamp(new Date)
    return message.channel.send(embed);
}

module.exports.help = {
    name: "balance",
    aliases: ["bal", "money"]
}