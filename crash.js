const money = require("../money.json");
const Discord = require("discord.js");
const fs = require('fs');
const { prefix } = require("../botconfig.json");

module.exports.run = async (bot, message, args) => {
    let bet = parseInt(args[0], 10);
    if(isNaN(bet) || bet < 1) return message.channel.send(infoEmbed());

    let Credits = money[message.author.id];
    if(!Credits || Credits.money < bet) return message.channel.send(`**${message.member.displayName}** You don't have enough credits.`);
    let startCredits = Credits.money;

    Credits.money -= bet;

    let bigbet = "";
    if(bet > 50000) bigbet = "🐋";

    let embed = new Discord.MessageEmbed()
    .setAuthor(`${message.member.displayName} ${bigbet}`, message.author.displayAvatarURL())
    .setColor("#49eb34")
    .addField("Multiplier", "1.0x", true)
    .addField("Profit", "0", true)
    .setFooter(`Use bust to stop`)
    message.channel.send(embed).then(async m => {
        let crashed = false;
        let multiplier = 1.0;

        editEmbed();
        function editEmbed(){
            setTimeout(() => {
                if(crashed) return;

                let chances = 51; //percent chance in crash

                if(Math.floor(Math.random()*(100/chances))+1 == 1){
                    crashed = true;
                    embed.fields[0].name = "Crashed at";
                    embed.fields[1].value = `-${bet}`;
                    embed.setColor("#eb3434")
                    embed.addField("Credits", `You have ${Credits.money} credits`)
                    saveMoney(money);
                    return m.edit(embed);
                }
                multiplier = Math.round((multiplier+0.2)*10)/10;
                embed.fields[0].value = `${multiplier}x`;
                embed.fields[1].value = Math.floor(bet*multiplier)-bet;
                m.edit(embed);
                editEmbed();
            }, 2000)
        }

        for(;crashed == false;){
            await message.channel.awaitMessages(response => response.author.id == message.author.id, {max: 1}).then(res => {
                if(crashed) return;
                if(res.first().content == `bust`){
                    Credits.money += Math.floor(bet*multiplier);
                    crashed = true;
                    saveMoney(money);
                    embed.fields[0].name = "Stopped at"
                    embed.addField("Credits", `You have ${Credits.money} credits`)
                    m.edit(embed);
                }
            })
        }
    })
}

function infoEmbed(){
    let embed = new Discord.MessageEmbed()
    .setColor("#ddc079")
    .addField("Help", "Multiplier will go up and you have to stop before crash. If you win you get your **bet * multiplier**")
    .addField("Winnings", "Up to 50x")
    .addField("Usage", `**${prefix}crash <bet>**`)
    return embed;
}


function saveMoney(Money){
    fs.writeFile("./money.json", JSON.stringify(Money), (err) => {
        if(err) console.log(err);
    });
}

module.exports.help = {
    name: "crash",
    aliases: []
}