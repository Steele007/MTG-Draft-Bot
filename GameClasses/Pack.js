class Pack{

  #isMythic;
  #cards;
  
  constructor(cardPool){

    if((Math.floor(Math.random() * 8))+ 1 === 1){

      this.#isMythic = true;
      
    }else{

      this.#isMythic = false;
      
    }

    this.#cards = new Set();

    if(this.#isMythic){

      this.#cards.add(cardPool.getMythic());
      
    }else{

      this.#cards.add(cardPool.getRare());
      
    }

    for(let i = 0; i < 3; i++){

      let cardToAdd = cardPool.getUncommon();

      while(this.#cards.has(cardToAdd)){

        cardToAdd = cardPool.getUncommon();
        
      }

      this.#cards.add(cardToAdd);
      
    }

    for(let i = 0; i < 10; i++){

      let cardToAdd = cardPool.getCommon();

      while(this.#cards.has(cardToAdd)){

        cardToAdd = cardPool.getCcommon();
        
      }

      this.#cards.add(cardToAdd);
      
    }

    this.#cards.add(cardPool.getLand());
    
  }

  removePick(card){

    //Fill later.
    
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