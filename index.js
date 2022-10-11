//const Database = require("@replit/database");
//const db = new Database();
//const mongoose = require('mongoose');
const https = require('https');
const fetch = require('node-fetch');
const { Client, GatewayIntentBits, EmbedBuilder, Partials } = require('discord.js');
const PlayerRoster = require('./GameClasses/PlayerRoster.js');
const WinstonDraft = require('./GameClasses/WinstonDraft.js');
const WinchesterDraft = require('./GameClasses/WinchesterDraft.js');
const WinstonPlayer = require('./GameClasses/WinstonPlayer.js');
const Sealed = require('./GameClasses/SealedPool.js');
const mongoose = require('mongoose');

const client = new Client({ intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ], partials: [Partials.Channel, Partials.Message] });

let searchingForPlayers = false;
let activeGame = null; //Just one? Expand later
    
const mySecret = process.env['TOKEN'];

//Helper func for displaying a card to a specific user.
const sendCard = async function(user, card){

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

client.on("debug", console.log);
client.on("warn", console.log);

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

  //Start a Winston Draft
  if (message.content.startsWith("WinstonDraft: ")){

    if(PlayerRoster.allPlayers.has(message.author)){
      message.reply("You're already in a game.");
      return;
    }

    if(activeGame !== null){
      message.author.reply("Game already in progress.");
      return;
    }
    
    let inputs = message.content.split(" ");
    inputs.shift();
    let isValid = true;
    
    if(inputs.length !== 6){
      message.reply("Must specify the set used by each booster.\n Format: WinstonDraft: setCode setCode setCode setCode setCode setCode");
    }else{
      
      for(let set of inputs){
        let setGet = await fetch(`https://api.scryfall.com/sets/${set}`);
        let data = await setGet.json();

        if(data.object === "error"){
              isValid = false;
        }
        
        //Wait 100 ms so Scryfall doesn't ban my IP address.
        await (async () => {
          await new Promise(resolve => setTimeout(resolve, 150));
        })();
        
        
      }
      
      if(isValid){

        let winstonDraft = new WinstonDraft();
        let newPlayer = new WinstonPlayer(message.author);
        await winstonDraft.genCards(inputs);
        PlayerRoster.addPlayer(newPlayer, message.author);
        winstonDraft.addPlayer(newPlayer)
        searchingForPlayers = true;
        activeGame = winstonDraft;
        
        message.channel.send("Game open for joining. Type 'Joingame' to join.");
        
      }else{

        message.reply("One or more set codes are invalid.");
        
      }
      
      
    }
    
  }

  //Join whichever game is currently looking for players.
  if(message.content === "Joingame"){
    if(PlayerRoster.allPlayers.has(message.author)){

      message.reply("You're already in a game!");
      
    }else if(searchingForPlayers === false){

      message.reply("No one is looking for players right now.");
      
    }else{

      let newPlayer = new WinstonPlayer(message.author);
      if(activeGame.addPlayer(newPlayer)){
          
        searchingForPlayers = false;
        PlayerRoster.addPlayer(newPlayer, message.author);
        await activeGame.presentCards();
          
      }else{

        PlayerRoster.addPlayer(newPlayer, message.author);
        
      }
      
      
    }
  }

  //Active player picks current card selection.
  if(message.content === "Pick" && message.channel.type === 1){

    
    if(PlayerRoster.allPlayers.has(message.author)){
      
      let curPlayer = PlayerRoster.allPlayers.get(message.author);
      if(curPlayer.isActive){
        
        if(await activeGame.pick()){
          let players = activeGame.endGame();
          PlayerRoster.clearPlayers(players);
          for(let player of players){
            for(let card of player.getPicks()){

              await sendCard(player.user, card);
              
            }
          }
          activeGame = null;
        } 
      }  
    }
  }

  //Active player picks selected card selection.
  if(message.content.startsWith("Pick: ") && message.channel.type === 1){

    let input = message.content.split(" ");
    input = input.shift();

    let isValid = true;
    
    if(input.length !== 1){
      isValid = false;
      message.reply("Must enter the command in the right format: Pick: [Pick number]");
    }else{

      if(Number.isInteger(input[0])){
        isValid = false;
        message.reply("Must enter the command in the right format: Pick: [Pick number]");
      }
      
    }

    if(isValid){
      if(PlayerRoster.allPlayers.has(message.author)){
      
        let curPlayer = PlayerRoster.allPlayers.get(message.author);
        if(curPlayer.isActive){
        
          if(await activeGame.pick(input[0])){
            let players = activeGame.endGame();
            PlayerRoster.clearPlayers(players);
            for(let player of players){
              for(let card of player.getPicks()){
  
                await sendCard(player.user, card);
                
              }
            }
            activeGame = null;
          } 
        }  
      }
    } 
  }

  //Active player passes current card selection.
  if(message.content === "Pass" && message.channel.type === 1){

    
    if(PlayerRoster.allPlayers.has(message.author)){
      
      let curPlayer = PlayerRoster.allPlayers.get(message.author);
      if(curPlayer.isActive){
        
        if(await activeGame.pass()){
          let players = activeGame.endGame();
          PlayerRoster.clearPlayers(players);
          for(let player of players){
            for(let card of player.getPicks()){

              await sendCard(player.user, card);
              
            }
          }
          activeGame = null;
        } 
      }  
    }
  }

  if(message.content === "Show Cards" && message.channel.type === 1){

    let player = PlayerRoster.allPlayers.get(message.author);
    let picks = player.getPicks();
    
    for(let card of picks){
      
      await sendCard(message.author, card);
      
    }
    
  }

  //Start a Winchester Draft
  if(message.content.startsWith("WinchesterDraft: ")){

    if(PlayerRoster.allPlayers.has(message.author)){
      message.reply("You're already in a game.");
      return;
    }

    if(activeGame !== null){
      message.author.reply("Game already in progress.");
      return;
    }
    
    let inputs = message.content.split(" ");
    inputs.shift();
    let isValid = true;
    
    if(inputs.length !== 6){
      message.reply("Must specify the set used by each booster.\n Format: WinchesterDraft: setCode setCode setCode setCode setCode setCode");
    }else{
      
      for(let set of inputs){
        let setGet = await fetch(`https://api.scryfall.com/sets/${set}`);
        let data = await setGet.json();

        if(data.object === "error"){
              isValid = false;
        }
        
        //Wait 100 ms so Scryfall doesn't ban my IP address.
        await (async () => {
          await new Promise(resolve => setTimeout(resolve, 150));
        })();
        
        
      }
      
      if(isValid){

        let winchesterDraft = new WinchesterDraft();
        let newPlayer = new WinstonPlayer(message.author);
        await winchesterDraft.genCards(inputs);
        PlayerRoster.addPlayer(newPlayer, message.author);
        winchesterDraft.addPlayer(newPlayer)
        searchingForPlayers = true;
        activeGame = winchesterDraft;
        
        message.channel.send("Game open for joining. Type 'Joingame' to join.");
        
      }else{

        message.reply("One or more set codes are invalid.");
        
      }
      
      
    }
    
  }
  
  //Opens a Sealed pool for a user.
  if(message.content.startsWith("Sealed: ")){

    let inputs = message.content.split(" ");
    inputs.shift();
    let isValid = true;
    
    if(inputs.length !== 6){
      message.reply("Must specify the set used by each booster.\n Format: Sealed: setCode setCode setCode setCode setCode setCode");
    }else{
      
      for(let set of inputs){
        let setGet = await fetch(`https://api.scryfall.com/sets/${set}`);
        let data = await setGet.json();

        if(data.object === "error"){
              isValid = false;
        }
        
        //Wait 100 ms so Scryfall doesn't ban my IP address.
        await (async () => {
          await new Promise(resolve => setTimeout(resolve, 150));
        })();
        
        
      }

      if(isValid){

        await Sealed.getCardPool(inputs, message.author);
        
      }else{

        message.reply("One or more set codes are invalid.");
        
      }
    }
    
  }
});

console.log("About to login.");
        
client.login(mySecret);


