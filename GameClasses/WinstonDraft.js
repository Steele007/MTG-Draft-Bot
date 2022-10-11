
const CardPool = require('./CardPool.js');
const Pack = require('./Pack.js');
const fetch = require('node-fetch');
const { EmbedBuilder } = require('discord.js');
class WinstonDraft{

  #deck; //What else do I call it?
  #packs;
  #players;
  #setMap;
  #cardSlots;
  #cardsInPacks;
  #gameStart;
  #activePlayer;
  #position; //The position of the card pile the active player is looking at.
  
  
  constructor(){

    this.#gameStart = false;
    this.#deck = [];
    this.#cardSlots = [[],[],[]];
    this.#setMap = new Map();
    this.#players = [];
    this.#packs = [];
    this.#position = 0;
    this.#cardsInPacks = 90; //Hardcode different number for sets like Double Masters? 
   
  }

  //Constructor code seprated for async purposes.
  async genCards(sets){
    
    //Generate the card pools for each set.
    for(let set of sets){
      
      if(this.#setMap.has(set)){

        //If the cardpool for the set has already been generated, just skip this iteration.
        
      }else{

        let newCardPool = await CardPool.makeCardPool(set);

        //Add the cardpool to the map.    
        this.#setMap.set(set, newCardPool);
        
      }
      
    }

    //Generate a pack for each of the specified sets.
    for(let set of sets){

      let pack = new Pack(this.#setMap.get(set));
      //console.log(set);
      this.#packs.push(pack);
      
    }
    
    await this.#shuffle();
    console.log("Shuffle done.");
   
    
    //Set up the initial card slots.
    let newCard = this.#deck.pop();
    this.#cardSlots[0].push(newCard);
    newCard = this.#deck.pop();
    this.#cardSlots[1].push(newCard);
    newCard = this.#deck.pop();
    this.#cardSlots[2].push(newCard);
    console.log(this.#cardSlots[0].name);
    console.log(this.#cardSlots[1].name);
    console.log(this.#cardSlots[2].name);
    console.log("Gen done.")
  }
  
  async #shuffle(){

    console.log(this.#packs.length);
    while(this.#cardsInPacks > 0){

      //Likelyhood of this repeatedly pinging empty packs towards the end?
      let index = Math.floor(Math.random()*6);
      //console.log("index = " + index);
      let card = this.#packs[index].pickAtRandom();
      
      if(card !== null){
        
        this.#cardsInPacks--;
        this.#deck.push(card);
        //console.log(this.#cardsInPacks);
        
      }
          
    }

    //console.log(this.#deck);
    
  }

  //When a player passes, put the top card of the deck onto the card slot they just left.
  async pass(){

    console.log(this.#deck.length);
    if(this.#position >= 2){

      let newCard = this.#deck.pop();
      
      if(newCard != null){
        this.#cardSlots[this.#position].push(newCard);
        console.log(`Pushed: ${newCard.name}`);
      }
      //Player takes top card off as a default
      let pick = this.#deck.pop();
      
      if(pick != null){
        this.#players[this.#activePlayer].addPick(pick);
        console.log(`Picked: ${pick.name}`);
      }
      
      this.#position = 0;
      if(this.#cardSlots[0].length === 0 && this.#cardSlots[1].length === 0 && this.#cardSlots[2].length === 0 && this.#deck.length == 0){
          return true; //Game is over.
        }
      this.#players[this.#activePlayer].user.send("Waiting for opponent...");
      if(this.#activePlayer === 0){
        this.#players[this.#activePlayer].isActive = false;
        this.#activePlayer = 1;
        this.#players[this.#activePlayer].isActive = true;
      }else{
        this.#players[this.#activePlayer].isActive = false;
        this.#activePlayer = 0;
        this.#players[this.#activePlayer].isActive = true;
      }
      
    }else{

      let newCard = this.#deck.pop();
      console.log(`Card: ${newCard.name}`);
      if(newCard != null){
        this.#cardSlots[this.#position].push(newCard);
        console.log(`Pushed: ${newCard.name}`);
      }
      this.#position++;
      
    }

    await this.presentCards();
    return false; //Game will continue
    
  }

  //When a player picks, add everything in the card slot to the players picks and then add the top card of the deck to the card slot.
  async pick(){

    console.log(this.#deck.length);
    if(this.#position < 3){

      let picks = Array.from(this.#cardSlots[this.#position]);
      this.#cardSlots[this.#position] = [];
      let newCard = this.#deck.pop();
      
      if(newCard != null){
        this.#cardSlots[this.#position].push(newCard);
        console.log(`Pushed: ${newCard.name}`);
      }
      this.#players[this.#activePlayer].addPick(picks);
      
      this.#position = 0;

      if(this.#cardSlots[0].length === 0 && this.#cardSlots[1].length === 0 && this.#cardSlots[2].length === 0 && this.#deck.length == 0){
          return true; //Game is over.
        }
      
      this.#players[this.#activePlayer].user.send("Waiting for opponent...");
      if(this.#activePlayer === 0){
        this.#players[this.#activePlayer].isActive = false;
        this.#activePlayer = 1;
        this.#players[this.#activePlayer].isActive = true;
      }else{
        this.#players[this.#activePlayer].isActive = false;
        this.#activePlayer = 0;
        this.#players[this.#activePlayer].isActive = true;
      }
      
    }

    await this.presentCards();
    return false; //Game will continue.
    
  }

  async pick(num){
    this.#players[this.#activePlayer].user.send("Invalid command.");
  }
  addPlayer(player){

    //Return values tell the bot when to stop letting people join the game.
    //To do: link up PlayerRoster to prevent players from playing multiple games.
    if(this.#players.length === 1){

      this.#players.push(player);
      this.#gameStart = true;
      this.#startGame();
      return true; 
      
    }else if(this.#players.length > 1){

      //Do nothing in case async shenanigans cause a player to join a full game.
      
    }else{

      this.#players.push(player);
      //console.log(player);
      return false;
      
    }
    
  }

  endGame(){
    
    this.#activePlayer = null
    return this.#players;
  }

  async presentCards(){

    
    this.#players[this.#activePlayer].user.send(`Cards in position ${this.#position + 1}`);
    
    for(let card of this.#cardSlots[this.#position]){

      if(card.layout == 'transform' || card.layout == 'modal_dfc'){
        let imgLink1 = card.card_faces[0].image_uris.large;
        let imgLink2 = card.card_faces[1].image_uris.large;

      
        let cardFrontImg = new EmbedBuilder().setTitle(card.name).setURL(card.scryfall_uri).setImage(imgLink1);
        let cardBackImg = new EmbedBuilder().setURL(card.scryfall_uri).setImage(imgLink2);
        
        this.#players[this.#activePlayer].user.send({embeds: [cardFrontImg, cardBackImg]});
      }else{

        let imgLink = card.image_uris.large;

        let cardImg = new EmbedBuilder().setTitle(card.name).setURL(card.scryfall_uri).setImage(imgLink);
        this.#players[this.#activePlayer].user.send({embeds: [cardImg]});
        
      }
     
    }

    this.#players[this.#activePlayer].user.send("Pick or Pass?/nType 'Show Cards' to see your picks.");
    
  }

  #startGame(){

    this.#activePlayer = Math.floor(Math.random()*this.#players.length);

    this.#players[this.#activePlayer].isActive = true;
    
  }
  
}
module.exports = WinstonDraft;