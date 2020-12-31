const money = require("../money.json");
const fs = require("fs");
const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {

    let embed = new Discord.MessageEmbed();
    let user = message.mentions.members.first() || bot.users.get(args[0]);
    if(!user) return message.reply("Sorry, couldn't find that user.");

    if(!args[1]) return message.reply("Please specify the amount you want to pay.");

    if(!money[message.author.id]) return message.reply("Sorry, you don't have any money.");

    if(parseInt(args[1]) > money[message.author.id].money) return message.reply("You don't have enough money");
    if(parseInt(args[1]) <1) return message.reply("You cannot pay less than 1 credits.");

    if(!money[user.id]) {

        money[user.id] = {
            name: bot.users.cache.get(user.id).tag,
            money: parseInt(args[1])
        }
        money[message.author.id].money -= parseInt(args[1]);

        fs.writeFile("./money.json", JSON.stringify(money), (err) => {
            if(err) console.log(err);
        });

    } else {

        money[user.id].money += parseInt(args[1]);

        money[message.author.id].money -= parseInt(args[1]);

        fs.writeFile("./money.json", JSON.stringify(money), (err) => {
            if(err) console.log(err);
        });

    }
    embed.setColor("00ff00");
    embed.setTitle(`PAYMENT`);
    embed.setDescription(`**${message.author.username}** paid ${args[1]} credits to **${bot.users.cache.get(user.id).username}**`);
    embed.addField("New Balance:", `${money[message.author.id].money.toLocaleString()} credits`);
    embed.setImage('https://i.imgur.com/I95bvCB.png');
    // embed.setThumbnail(user.displayAvatarURL({size: 4096, dynamic: true}));
    embed.setTimestamp(new Date)
    return message.channel.send(embed);

    // return message.channel.send(`${message.author.username} paid ₱${args[1]} to ${bot.users.cache.get(user.id).username}`);
}

module.exports.help = {
    name: "pay",
    aliases: []
}