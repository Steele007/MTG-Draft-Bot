const https = require('https');
const CardPool = require('./CardPool.js');
const Pack = require('./Pack.js');
const fetch = require('node-fetch');
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

        let j = 1;
        let cardPool;
        let setReq = await fetch(`https://api.scryfall.com/cards/search?include_extras=true&include_variations=true&order=set&page=${j}&q=e%3A${set}&unique=prints`);
        let setPool = await setReq.json();
        //console.log(setPool);
        cardPool = setPool.data;
        
        //While the set still has more JSON files left.
        while(setPool.has_more == true){

          await (async () => {
            await new Promise(resolve => setTimeout(resolve, 150));
          })();
          j++;
          let innerReq = await fetch(`https://api.scryfall.com/cards/search?include_extras=true&include_variations=true&order=set&page=${j}&q=e%3A${set}&unique=prints`);

          setPool = await innerReq.json();
          //console.log(setPool);
          cardPool = cardPool.concat(setPool.data);

          
                     
        }

        //Add the cardpool to the map.    
        this.#setMap.set(set,new CardPool(cardPool))
        
      }
      
    }

    //Generate a pack for each of the specified sets.
    for(let set of sets){

      console.log(set);
      this.#packs.push(new Pack(this.#setMap.get(set)));
      
    }

    await this.#shuffle();
    console.log("Shuffle done.");

    //Set up the initial card slots.
    this.#cardSlots[0].push(this.#deck.pop());
    this.#cardSlots[1].push(this.#deck.pop());
    this.#cardSlots[2].push(this.#deck.pop());
    console.log("Gen done.")
  }
  
  async #shuffle(){

    while(this.#cardsInPacks > 0){

      //Likelyhood of this repeatedly pinging empty packs towards the end?
      let card = this.#packs[Math.floor(Math.random()*6)].pickAtRandom();

      if(card !== null){

        this.#cardsInPacks--;
        this.#deck.push(card);
        
      }
          
    }

    console.log(this.#deck);
    
  }

  pass(){

    if(this.#position >= 2){

      this.#players[this.#activePlayer].addPick(this.#deck.pop()) ;
      this.#position = 0;
      if(this.#cardSlots[0].length === 0 && this.#cardSlots[1].length === 0 && this.#cardSlots[2].length === 0 && this.#deck.length == 0){
          return true; //Game is over.
        }
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

      this.#cardSlots[this.#position].push(this.#deck.pop());
      this.#position++;
      
    }

    return false; //Game will continue
    
  }

  pick(){

    if(this.#position < 3){

      let picks = Array.from(this.#cardSlots[this.#position]) ;
      this.#cardSlots[this.#position] = [];
      this.#cardSlots[this.#position].push(this.#deck.pop());
      this.#players[this.#activePlayer].addPick(picks);
      this.#position = 0;

      if(this.#cardSlots[0].length === 0 && this.#cardSlots[1].length === 0 && this.#cardSlots[2].length === 0 && this.#deck.length == 0){
          return true; //Game is over.
        }
      
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

    return false; //Game will continue.
    
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
      return false;
      
    }
    
  }

  endGame(){
    
    this.#activePlayer = null
    return this.#players;
  }

  presentCards(){

    this.#players[this.#activePlayer].user.send(`Cards in position ${this.#position}`);
    
    for(card of this.#cardSlots[this.#position]){

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

    this.#players[this.#activePlayer].user.send("Pick or Pass?");
    
  }

  #startGame(){

    this.#activePlayer = Math.floor(Math.random*this.#players.length);
    this.#players[this.#activePlayer].isActive = true;
    this.presentCards();
  }
  
}
module.exports = WinstonDraft;