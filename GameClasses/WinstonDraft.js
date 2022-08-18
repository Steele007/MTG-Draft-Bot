const https = require('https');
import {CardPool} from './CardPool.js';
import {Pack} from './Pack.js';
class WinstonDraft{

  #deck; //What else do I call it?
  #packs;
  #players;
  #setMap;
  #cardSlots;
  #cardsInPacks;

  constructor(players, sets){

    this.#deck = [];
    this.#cardSlots = [[],[],[]];
    this.#setMap = new Set();
    this.#players = players;
    this.#packs = [];
    this.#cardsInPacks = 90; //Hardcode different number for sets like Double Masters? 

    //Generate the card pools for each set.
    for(let set of sets){

      if(this.#setMap.has(set)){


        
      }else{

        let j = 1;
        let cardPool;
        let setReq = https.get(`https://api.scryfall.com/cards/search?include_extras=true&include_variations=true&order=set&page=${j}&q=e%3A${set}&unique=prints`, resp => {

          let data = '';
          
          resp.on("data", (chunk) => {
            data += chunk;
          });

          resp.on("end", () => {

            let setPool = JSON.parse(data);
            cardPool = setPool.data;

            while(setPool.has_more === true){

              j++;
              let innerReq = https.get(`https://api.scryfall.com/cards/search?include_extras=true&include_variations=true&order=set&page=${j}&q=e%3A${set}&unique=prints`, response => {

                data = '';

                response.on("data", (chunk) => {
                  data += chunk;                  
                });

                response.on("end",() => {

                  setPool = JSON.parse(data);
                  cardPool = cardPool.concat(setPool.data);
                  
                });
                
              });
              innerReq.end();
            }

            this.#setMap.add(new CardPool(cardPool))
            
          });
          
        });
        setReq.end();
      }
      
    }

    //Generate a pack for each of the specified sets.
    for(let set of sets){

      this.#packs.push(new Pack(this.#setMap.get(set)));
      
    }

    this.#shuffle();

    this.#cardSlots[0].push(this.#deck.pop());
    this.#cardSlots[1].push(this.#deck.pop());
    this.#cardSlots[2].push(this.#deck.pop());
    
  }

  #shuffle(){

    while(this.#cardsInPacks > 0){

      //Likelyhood of this repeatedly pinging empty packs towards the end?
      let card = this.#packs[Math.floor(Math.random()*6)].pickAtRandom();

      if(card !== null){

        this.#cardsInPacks--;
        this.#deck.push(card);
        
      }
          
    }
    
  }

  pass(position){

    if(position >= 2){

      return this.#deck.pop();
      
    }else{

      this.#cardSlots[position].push(this.#deck.pop());
      return null;
      
    }
    
  }

  pick(position){

    if(position < 3){

      let picks = Array.from(this.#cardSlots[position]) ;
      this.#cardSlots[position] = [];
      this.#cardSlots[position].push(this.#deck.pop());
      return picks;
      
    }else{

      return null;
      
    }
    
  }
  
}