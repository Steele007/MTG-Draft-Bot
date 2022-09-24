class WinchesterDraft extends WinstonDraft{

  constructor(){
    super();
    this.#cardSlots = [[],[],[],[]];
    this.#deck = [[],[]]; //Ignore this and just do a single deck?
  }

  //Edit this.
  async #shuffle(){

    console.log(this.#packs.length);
    while(this.#cardsInPacks > 0){

      //Likelyhood of this repeatedly pinging empty packs towards the end?
      let index = Math.floor(Math.random()*6);
      //console.log("index = " + index);
      let card = this.#packs[index].pickAtRandom();
      
      if(card !== null){
        
        this.#cardsInPacks--;
        this.#deck.push(card);
        //console.log(this.#cardsInPacks);
        
      }
          
    }

    //console.log(this.#deck);
    
  }
  
}