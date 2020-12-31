const money = require("../money.json");
const Discord = require("discord.js");
const fs = require('fs');
const { prefix } = require("../botconfig.json");
const blackjack_cards = require("../blackjack_cards.json");

module.exports.run = async (bot, message, args) => {

    let bet = parseInt(args[0], 10);
    if(isNaN(bet) || bet < 1) return message.channel.send(infoEmbed());

    let Credits = money[message.author.id];
    if(!Credits || Credits.money < bet) return message.channel.send(`**${message.member.displayName}** You don't have enough credits.`);
    let startCredits = Credits.money;

    Credits.money -= bet;

    let hand = new Hand();
    let dealer_hand = new Hand();
    for(i=0; i<2; i++){
        addCard(hand);
    }
    addCard(dealer_hand);

    let embed = new Discord.MessageEmbed()
    .setAuthor(message.member.displayName, message.author.displayAvatarURL())
    .setColor("#ddc079")
    .addField("Your hand", `${showHand(hand)}\nTotal: **${hand.total()}**`, true)
    .addField("Dealer's hand", `${showHand(dealer_hand)}\nTotal: **${dealer_hand.total()}**`, true)
    .addField("Commands", `**${prefix}stand** to see dealers cards\n**${prefix}hit** draw another card\n**${prefix}double** to double down\n**${prefix}fold** give up but you lose half of your bet`)
    .setFooter("You have 90 seconds left")
    message.channel.send(embed).then(async m => {
        let end = false;
        for(;end == false;){
            await message.channel.awaitMessages(response => response.author.id == message.author.id, {max: 1}).then(res => {
                let response = res.first().content;

                if(response == `${prefix}hit`){
                    addCard(hand);
                    embed.fields[0].value = `${showHand(hand)}\nTotal: **${hand.total()}**`;
                    if(isBusted(hand)){
                        end = true;
                        setBusted(embed, 0);
                    }
                }

                else if(response == `${prefix}stand`){
                    end = true;
                    dealerPlay(hand, dealer_hand);
                    if(isBusted(dealer_hand)){
                        setBusted(embed, 1);
                    }else{
                        endGame();
                    }
                    embed.fields[1].value = `${showHand(dealer_hand)}\nTotal: **${dealer_hand.total()}**`;
                }

                else if(response == `${prefix}double`){
                    if(Credits.money < bet){
                        return message.channel.send(":x: You have no money!");
                    }
                    end = true;
                    Credits.money -= bet;
                    bet *= 2;
                    addCard(hand);
                    dealerPlay(hand, dealer_hand);
                    if(isBusted(dealer_hand)){
                        setBusted(embed, 1);
                    }else if(isBusted(hand)){
                        setBusted(embed, 0);
                    }else{
                        endGame();
                    }
                    embed.fields[0].value = `${showHand(hand)}\nTotal: **${hand.total()}**`;
                    embed.fields[1].value = `${showHand(dealer_hand)}\nTotal: **${dealer_hand.total()}**`;
                }

                else if(response == `${prefix}fold`){
                    Credits.money += bet/2;
                    embed.fields[0].name = "Fold";
                    embed.fields[2].name = "Profit";
                    embed.fields[2].value = `**${Credits.money-startCredits}**`;
                    embed.addField("Credits", `You have **${Credits.money}** credits`, true);
                    embed.setColor("#eb3434");
                    saveMoney(money);
                }
                else{ return }
                m.edit(embed);
            })
        }
    })

    function endGame(){
        if(hand.total() > dealer_hand.total()){
            embed.setColor("#49eb34");
            Credits.money += bet*2;
            embed.fields[2].name = "Profit";
            embed.fields[2].value = `**${Credits.money-startCredits}**`;
            embed.addField("Credits", `You have **${Credits.money}** credits`, true);
        }else if(hand.total() < dealer_hand.total()){
            embed.setColor("#eb3434");
            embed.fields[2].name = "Profit";
            embed.fields[2].value = `**${Credits.money-startCredits}**`;
            embed.addField("Credits", `You have **${Credits.money}** credits`, true);
        }else{
            embed.setColor("#000000");
            Credits.money += bet;
            embed.fields[0].name = "PUSH";
            embed.fields[1].name = "PUSH";
            embed.fields[2].name = "Profit";
            embed.fields[2].value = `**${Credits.money-startCredits}**`;
            embed.addField("Credits", `You have **${Credits.money}** credits`, true);
        }
        saveMoney(money);
    }

    function setBusted(embed, i){
        if(i == 0){
            embed.setColor("#eb3434");
        }else{
            Credits.money += bet*2;
            embed.setColor("#49eb34")
        }
        embed.fields[i].name = `BUSTED`;
        embed.fields[2].name = "Profit";
        embed.fields[2].value = `**${Credits.money-startCredits}**`;
        embed.addField("Credits", `You have **${Credits.money}** credits`, true);
        saveMoney(money);
    }
}

function Hand(){
    this.powers = [];
    this.cards = [];
    this.symbols = [];
    this.total = function(){
        let total = 0;
        this.powers.forEach(p => {
            total += p;
        })
        return total;
    }
}

function isBusted(hand){
    if(hand.total() > 21) return true;
    else return false;
}

function dealerPlay(hand, dealer_hand){
    for(;dealer_hand.total() < hand.total();){
        if(dealer_hand.total() > 19) break;
        addCard(dealer_hand);
    }
}

function saveMoney(Money){
    fs.writeFile("./money.json", JSON.stringify(Money), (err) => {
        if(err) console.log(err);
    });
}

function infoEmbed(){
    let embed = new Discord.MessageEmbed()
    .setColor('#ddc079')
    .addField("Help", "You have to get your cards close to 21 or better than dealer but not over 21")
    .addField("Commands", `**${prefix}hit** draw another card\n**${prefix}stand** check dealers cards\n**${prefix}fold** give up and get half of your bet back\n**${prefix}double** double down`)
    .addField("Winnings", "**2x**")
    .addField("Usage", `**${prefix}blackjack <bet>**`)
    return embed;
}

function addCard(hand){
    let card = drawCard();
    hand.powers.push(card.power);
    hand.cards.push(card.card);
    hand.symbols.push(drawSymbol());
}

function drawCard(){
    let random = Math.floor(Math.random()*13)+2;
    return blackjack_cards[random];
}

function drawSymbol(){
    let random = Math.floor(Math.random()*4)+1;
    if(random == 1) return "♣️";
    if(random == 2) return "♠️";
    if(random == 3) return "♦️";
    if(random == 4) return "♥️";
}

function showHand(hand){
    let string = "";
    hand.cards.forEach((x, i) => {
        string += `${x}${hand.symbols[i]}`;
    })
    return string;
}

module.exports.help = {
    name: "blackjack",
    aliases: []
}