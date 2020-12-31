const money = require("../money.json");
const fs = require("fs");
const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {

    if(message.author.id != "705998127613739059") return message.reply("You cannot use this command!")

    let embed = new Discord.MessageEmbed();
    let user = message.mentions.members.first() || bot.users.get(args[0]);
    if(!user) return message.reply("Sorry, couldn't find that user.");

    if(!args[1]) return message.reply("Please specify the amount you want to remove.");

    if(!money[user.id]) {

        money[user.id] = {
            name: bot.users.cache.get(user.id).tag,
            money: parseInt(args[1])
        }

        fs.writeFile("./money.json", JSON.stringify(money), (err) => {
            if(err) console.log(err);
        });

    } else {

        money[user.id].money -= parseInt(args[1]);

        fs.writeFile("./money.json", JSON.stringify(money), (err) => {
            if(err) console.log(err);
        });

    }
    embed.setColor("00ff00");
    embed.setTitle(`REMOVE`);
    embed.setDescription(`**admin** remove ${args[1]} credits to **${bot.users.cache.get(user.id).username} credits**`);
    embed.addField("New Balance:", `${money[message.author.id].money.toLocaleString()} credits`);
    // embed.setThumbnail(user.displayAvatarURL({size: 4096, dynamic: true}));
    embed.setTimestamp(new Date)
    return message.channel.send(embed);

    // return message.channel.send(`${message.author.username} paid ₱${args[1]} to ${bot.users.cache.get(user.id).username}`);
}

module.exports.help = {
    name: "removebal",
    aliases: ["remove", "rbal"]
}