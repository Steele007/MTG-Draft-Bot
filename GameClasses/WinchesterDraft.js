const CardPool = require('./CardPool.js');
const Pack = require('./Pack.js');
const fetch = require('node-fetch');
const { EmbedBuilder } = require('discord.js');
class WinchesterDraft extends WinstonDraft{

  constructor(){
    super();
    this.#cardSlots = [[],[],[],[]];
    this.#deck = [[],[]]; //Ignore this and just do a single deck?
  }
  
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
    newCard = this.#deck.pop();
    this.#cardSlots[3].push(newCard);
    console.log(this.#cardSlots[0].name);
    console.log(this.#cardSlots[1].name);
    console.log(this.#cardSlots[2].name);
    console.log(this.#cardSlots[3].name);
    console.log("Gen done.")
  }
  
  //Edit this.
  async #shuffle(){

    console.log(this.#packs.length);
    while(this.#cardsInPacks > 0){

      //Likelyhood of this repeatedly pinging empty packs towards the end?
      let index = Math.floor(Math.random()*6);
      
      let card = this.#packs[index].pickAtRandom();

    //If it belongs to the first three sets, put it in deck one. Otherwise, put it in deck 2.
      if(index < 3){

        if(card !== null){
        
          this.#cardsInPacks--;
          this.#deck[0].push(card);
          //console.log(this.#cardsInPacks);
        
        }
        
      }else{

        if(card !== null){
        
          this.#cardsInPacks--;
          this.#deck[1].push(card);
          //console.log(this.#cardsInPacks);
        
        }
        
      }  
          
    }

    //console.log(this.#deck);
    
  }

  async presentCards(){
  
      for(let i = 0; i<4; i++){
        
        this.#players[this.#activePlayer].user.send(`Cards in position ${i + 1}`);
        
        for(let card of this.#cardSlots[i]){

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
      }
      
    this.#players[this.#activePlayer].user.send("Pick your Pile./nType 'Show Cards' to see your picks.");
    
  }

  async pick(){
    this.#players[this.#activePlayer].user.send("Invalid command.");
  }

  //Double check this.
  async pick(pileNum){

    if(pileNum > 0 && pileNum < 5){

      let picks = Array.from(this.#cardSlots[pileNum-1]);
      this.#cardSlots[pileNum-1] = [];
      this.#players[this.#activePlayer].addPick(picks);

      if(this.#cardSlots[0].length === 0 && this.#cardSlots[1].length === 0 && this.#cardSlots[2].length === 0 && this.#cardSlots[3].length === 0){
        return true; //Game is over.        
      }
      
      for(let i = 0; i < 4; i++){

        let newCard;
        
        if(i<2){
          newCard = this.#deck[0].pop();   
        }else{
          newCard = this.#deck[1].pop();
        }

        if(newCard != null){
            
            this.#cardSlots[i].push(newCard);
            console.log(`Pushed: ${newCard.name}`);
            
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
        
    }else{

      this.#players[this.#activePlayer].user.send("Enter a value between 1 and 4.");
      
    }

    await this.presentCards();
    return false; //Game will continue.
    
  }
  
  async pass(){
    this.#players[this.#activePlayer].user.send("Invalid command.");
  }
}
module.exports = WinchesterDraft;