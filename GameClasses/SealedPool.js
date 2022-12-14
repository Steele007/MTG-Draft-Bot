const CardPool = require('./CardPool.js');
const Pack = require('./Pack.js');
const fetch = require('node-fetch');
const { EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

class SealedPool{

  //Just prints out all the cards in a sealed pool. 
  //TO DO: Add some way to edit decks if possible for sharing.
  async getCardPool(sets, user){
    let setMap = new Map();
    let packs = [];

        //Generate the card pools for each set.
    for(let set of sets){
      
      if(setMap.has(set)){

        //If the cardpool for the set has already been generated, just skip this iteration.
        
      }else{

        let newCardPool = await CardPool.makeCardPool(set);
        
        //Add the cardpool to the map.    
        setMap.set(set, newCardPool);
        
      }
      
    }

    //Generate a pack for each of the specified sets.
    for(let set of sets){

      let pack = new Pack(setMap.get(set));
      //console.log(set);
      packs.push(pack);
      
    }

    for(let pack of packs){
      let cards = pack.getCards();
      for(let card of cards){

        if(card.layout == 'transform' || card.layout == 'modal_dfc'){
          let imgLink1 = card.card_faces[0].image_uris.large;
          let imgLink2 = card.card_faces[1].image_uris.large;

      
          let cardFrontImg = new EmbedBuilder().setTitle(card.name).setURL(card.scryfall_uri).setImage(imgLink1);
          let cardBackImg = new EmbedBuilder().setURL(card.scryfall_uri).setImage(imgLink2);
        
          user.user.send({embeds: [cardFrontImg, cardBackImg]});
        }else{

          let imgLink = card.image_uris.large;

          let cardImg = new EmbedBuilder().setTitle(card.name).setURL(card.scryfall_uri).setImage(imgLink);
          user.user.send({embeds: [cardImg]});
        
        }
        
      }
    }
    
    
  }
  
}
module.exports = SealedPool;