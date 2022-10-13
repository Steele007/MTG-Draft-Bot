const CardPool = require('./CardPool.js');
const Pack = require('./Pack.js');
const BaseDraft = require('./BaseDraft.js');

class Draft extends BaseDraft{

  #playerNum;
  #sets;
  #packNum;
  
  constructor(playerNum){
    super();
    this.#playerNum = playerNum;
    this.#packNum = 1;
  }

  async genCards(sets){

    this.#sets = sets;
    
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

    console.log("Gen done.")
  }

  distributePacks(){
    
    for(let player of this.#players){
      
    }
    
  }
  
}
module.exports = Draft;