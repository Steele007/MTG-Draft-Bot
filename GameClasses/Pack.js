const CardPool = require('./CardPool.js');
class Pack{

  #isMythic;
  #cards;

  //TO DO: Add code to recognize if a set has no mythics. 
  constructor(cardPool){
    
    this.#cards = new Set();
    console.log("In pack constructor.");
    
    if(Math.floor(Math.random() * 8)+ 1 === 1 && cardPool.getMythic() != null){

      this.#isMythic = true;
      
    }else{

      this.#isMythic = false;
      
    }

    if(this.#isMythic){

      let cardToAdd = cardPool.getMythic();
      this.#cards.add(cardToAdd);
      console.log(cardToAdd.name);
    }else{

      let cardToAdd = cardPool.getRare();
      this.#cards.add(cardToAdd);
      console.log(cardToAdd.name);
      
    }

    //console.log(this.#cards);
    for(let i = 0; i < 3; i++){

      //console.log("Uncommon");
      let cardToAdd = cardPool.getUncommon();

      while(this.#cards.has(cardToAdd)){

        cardToAdd = cardPool.getUncommon();
        
      }

      this.#cards.add(cardToAdd);
      console.log(cardToAdd.name);
      
    }

    for(let i = 0; i < 10; i++){

      let cardToAdd = cardPool.getCommon();

      while(this.#cards.has(cardToAdd)){

        cardToAdd = cardPool.getCommon();
        
      }

      this.#cards.add(cardToAdd);
      console.log(cardToAdd.name);
      
    }

    let cardToAdd = cardPool.getLand();
    this.#cards.add(cardToAdd);
      console.log(cardToAdd.name);
    
    console.log(this.#cards.size);
  }

  removePick(card){

    this.#cards.delete(card);
    
  }

  pickAtRandom(){

    if(this.#cards.size === 0){

      return null;
      
    }else{

      let index = Math.floor(Math.random() * this.#cards.size);

      let pick = Array.from(this.#cards.values())[index];

      this.#cards.delete(pick);
      
      return pick;
      
    }
    
  }

  getCards(){
    return this.#cards;
  }
  
}
module.exports = Pack;