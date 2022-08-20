//const Database = require("@replit/database");
//const db = new Database();
//const mongoose = require('mongoose');
const https = require('https');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const {PlayerRoster} = require('./GameClasses/PlayerRoster.js');
const {WinstonDraft} = require('./GameClasses/WinstonDraft.js');


const client = new Client({ intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ] });

let searchingForPlayers = false;
let activeGame = null; //Just one? Expand later
    
const mySecret = process.env['TOKEN'];

const sendCard = function(user, card){

  if(card.layout == 'transform' || card.layout == 'modal_dfc'){
    let imgLink1 = card.card_faces[0].image_uris.large;
    let imgLink2 = card.card_faces[1].image_uris.large;

      
    let cardFrontImg = new       EmbedBuilder().setTitle(card.name).setURL(card.scryfall_uri).setImage(imgLink1);
    let cardBackImg = new EmbedBuilder().setURL(card.scryfall_uri).setImage(imgLink2);
        
    user.send({embeds: [cardFrontImg, cardBackImg]});
  }else{

    imgLink = card.image_uris.large;

    let cardImg = new EmbedBuilder().setTitle(card.name).setURL(card.scryfall_uri).setImage(imgLink);
    user.send({embeds: [cardImg]});
        
  }
  
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {

  console.log(message.channel.type);
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

  //Start a Winston Draft/
  if (message.content.startsWith("WinstonDraft: ")){

    if(PlayerRoster.allPlayers.has(message.author)){
      message.reply("You're already in a game.");
      break;
    }

    if(activeGame !== null){
      message.author.reply("Game already in progress.");
      break;
    }
    
    inputs = message.content.split(" ");
    inputs.shift();
    let isValid = true;

    if(inputs.length !== 6){
      message.reply("Must specify the set used by each booster.\n Format: WinstonDraft: setCode setCode setCode setCode setCode setCode");
    }else{

      for(set of inputs){

        setGet = https.get(`https://api.scryfall.com/sets/${set}`, resp => {

          let data = '';

          resp.on('data', (chunk) => {
            data += chunk;
          });

          resp.on('end', () => {

            if(JSON.parse(data).object === "error"){
              isValid = false;
            }
            //Wait 100 ms so Scryfall doesn't ban my IP address.
            await new Promise(resolve => setTimeout(resolve, 100));
          });
          
        });

        setGet.end();
        
      }

      if(isValid){

        let winstonDraft = new WinstonDraft(inputs);
        let newPlayer = new WinstonPlayer(message.author);
        PlayerRoster.addPlayer(newPlayer, message.author);
        winstonDraft.addPlayer(newPlayer)
        searchingForPlayers = true;
        activeGame = winstonDraft;
        
      }else{

        message.reply("One or more set codes are invalid.");
        
      }
      
      
    }
    
  }

  //Join whichever game is currently looking for players.
  if(message.content === "Joingame"){
    if(PlayerRoster.has(message.author)){

      message.reply("You're already in a game!");
      
    }else if(searchingForPlayers === false){

      message.reply("No one is looking for players right now.");
      
    }else{

      let newPlayer = new WinstonPlayer();
      if(activeGame.addPlayer(newPlayer)){
          
        searchingForPlayers = false;
        PlayerRoster.addPlayer(newPlayer, message.author);
          
      }else{

        PlayerRoster.addPlayer(newPlayer, message.author);
        
      }
      
      
    }
  }

  if(message.content === "Pick" && message.channel.type == 'DM'){
    
    if(PlayerRoster.allPlayers.has(message.author)){
      
      let player = PlayerRoster.allPlayers.get(message.author);
      if(player.isActive){
        
        if(activeGame.pick()){
          let players = activeGame.endGame();
          PlayerRoster.clearPlayers(players);
          for(player of players){
            for(card of player.getPicks()){

              sendCard(player.user, card);
              
            }
          }
          activeGame = null;
        } 
      }  
    }
  }

  if(message.content === "Pass" && message.channel.type == 'DM'){
    
    if(PlayerRoster.allPlayers.has(message.author)){
      
      let player = PlayerRoster.allPlayers.get(message.author);
      if(player.isActive){
        
        if(activeGame.pass()){
          let players = activeGame.endGame();
          PlayerRoster.clearPlayers(players);
          for(player of players){
            for(card of player.getPicks()){

              sendCard(player.user, card);
              
            }
          }
          activeGame = null;
        } 
      }  
    }
  }
});

console.log("About to login.");
client.login(mySecret);

