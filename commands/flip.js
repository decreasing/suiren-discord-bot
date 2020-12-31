const Discord = require("discord.js");
const money = require("../money.json");
const fs = require("fs");

module.exports.run = async (bot, message, args) => {

    let embed = new Discord.MessageEmbed();
    embed.setTitle("Balance!");

    var maxBet = 100000000000;

    if(!money[message.author.id] || money[message.author.id].money <= 0) return message.reply("you don't have any money.");

    if(!args[0]) return message.reply("please specify a bet.");

    if(args[0].toLowerCase() == "all") args[0] = money[message.author.id].money;

    try {
        var bet = parseFloat(args[0]);
    } catch {
        return message.reply("You can only enter whole numbers.");
    }

    if(bet != Math.floor(bet)) return message.reply("You can only enter whole numbers.");

    if(money[message.author.id].money < bet) return message.reply("You don't have that much money.");

    if(bet > maxBet) return message.reply(`The maximum bet is ${maxBet.toLocaleString()}.`);
    
    let chances = ["won", "lose"]
    var pick = chances[Math.floor(Math.random() * chances.length)]

    if(pick === "lose") {
        money[message.author.id].money -= bet;
        fs.writeFile("./money.json", JSON.stringify(money), (err) => {
            if(err) console.log(err);
        }); 
        embed.setColor("f93a2f");
        embed.setTitle(`YOU LOSE!`);
        embed.addField("New Balance:", `₱${money[message.author.id].money.toLocaleString()}`);
        embed.setImage('https://i.imgur.com/i0Ihiky.png');
        embed.setTimestamp(new Date)
        return message.channel.send(embed);

        // return message.reply(`You lose. New Balance: ${money[message.author.id].money}`);
    } else {
        money[message.author.id].money += bet;
        fs.writeFile("./money.json", JSON.stringify(money), (err) => {
            if(err) console.log(err);
        }); 
        embed.setColor("a652bb");
        embed.setTitle(`YOU WON!`);
        embed.addField("New Balance:", `₱${money[message.author.id].money.toLocaleString()}`);
        embed.setImage('https://i.imgur.com/1IEtdOK.gif');
        embed.setTimestamp(new Date)
        return message.channel.send(embed);

        // return message.reply(`You win! New Balance: ${money[message.author.id].money}`);
    }

}

  module.exports.help = {
    name: "flip",
    aliases: ["gamble"]
}