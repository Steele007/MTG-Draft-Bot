const CardPool = require('./CardPool.js');
class Pack{

  #isMythic;
  #cards;
  
  constructor(cardPool){
    
    this.#cards = new Set();
    console.log("In pack constructor.");
    
    if((Math.floor(Math.random() * 8))+ 1 === 1){

      this.#isMythic = true;
      
    }else{

      this.#isMythic = false;
      
    }
    

    if(this.#isMythic){

      this.#cards.add(cardPool.getMythic());
      
    }else{

      this.#cards.add(cardPool.getRare());
      
    }

    //console.log(this.#cards);
    for(let i = 0; i < 3; i++){

      //console.log("Uncommon");
      let cardToAdd = cardPool.getUncommon();

      while(this.#cards.has(cardToAdd)){

        cardToAdd = cardPool.getUncommon();
        
      }

      this.#cards.add(cardToAdd);
      
    }

    for(let i = 0; i < 10; i++){

      let cardToAdd = cardPool.getCommon();

      while(this.#cards.has(cardToAdd)){

        cardToAdd = cardPool.getCommon();
        
      }

      this.#cards.add(cardToAdd);
      
    }

    this.#cards.add(cardPool.getLand());
    //console.log(this.#cards);
  }

  removePick(card){

    //Fill later (probably for the full draft).
    
  }

  pickAtRandom(){

    if(this.#cards.length === 0){

      return null;
      
    }else{

      Math.floor(Math.random() * this.#cards.size);

      let pick = Array.from(this.#cards.values());

      this.#cards.delete(pick);
      
      return pick;
      
    }
    
  }
  
}
module.exports = Pack;