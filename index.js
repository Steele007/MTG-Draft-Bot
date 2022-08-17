//const Database = require("@replit/database");
//const db = new Database();
const mongoose = require('mongoose');
const https = require('https');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');


const client = new Client({ intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ] });
    
const mySecret = process.env['TOKEN'];

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {

  //Print out a card.
  if (message.content.startsWith("Cardname: ")) { 
    
    let cardReq =   https.get(`https://api.scryfall.com/cards/named?fuzzy=${message.content.slice(10)}`, resp => {
      let data = '';

      //Builds json by chunk.
      resp.on('data', (chunk) => {
        data += chunk;
      });

  // The whole response has been received. Do what you gotta do.
    resp.on('end', () => {

      let card = JSON.parse(data);

      if(card.object === "error"){

        message.reply("Card not found.")
        return;
        
      }

      if(card.layout == 'transform' || card.layout == 'modal_dfc'){

        let imgLink1 = card.card_faces[0].image_uris.large;
        let imgLink2 = card.card_faces[1].image_uris.large;

      
        let cardFrontImg = new EmbedBuilder().setTitle(card.name).setURL(card.scryfall_uri).setImage(imgLink1);
        let cardBackImg = new EmbedBuilder().setURL(card.scryfall_uri).setImage(imgLink2);
        message.reply({embeds: [cardFrontImg, cardBackImg]});
        
      }else{

        let imgLink = card.image_uris.large;


      
        let cardImg = new EmbedBuilder().setTitle(card.name).setURL(card.scryfall_uri).setImage(imgLink);
        message.reply({embeds: [cardImg]});
        
      }
            
    });
      
  });
    
    cardReq.end();
      
  }
});

client.login(mySecret);