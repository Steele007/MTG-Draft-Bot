const https = require('https');
class WinstonDraft{

  #deck;
  #packs;
  #players;
  #setMap;
  #cardSlots

  constructor(players, sets){

    this.#cardSlots = [[],[],[]];
    this.#setMap = new Set();

    for(let set of sets){

      if(this.#setMap.has(set)){


        
      }else{

        let j = 1;
        let cardPool;
        setReq = https.get(`https://api.scryfall.com/cards/search?include_extras=true&include_variations=true&order=set&page=${j}&q=e%3A${set}&unique=prints`, resp => {

          let data = '';
          
          resp.on("data", (chunk) => {
            data += chunk;
          });

          resp.on("end", () => {

            let setPool = JSON.parse(data);
            cardPool = setPool.data;

            while(setPool.has_more === true){
              
              
              
            }
            
            
          });
          
        });
        
      }
      
    }
    
  }
  
}