const https = require('https');
import {CardPool} from './CardPool.js';
import {Pack} from './Pack.js';
class WinstonDraft{

  #deck; //What else do I call it?
  #packs;
  #players;
  #setMap;
  #cardSlots;

  constructor(players, sets){

    this.#cardSlots = [[],[],[]];
    this.#setMap = new Set();
    this.#players = players;
    this.#packs = [];

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
    
  }

  #Shuffle(){

    
    
  }
  
}