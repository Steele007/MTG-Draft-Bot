class BaseDraft{

  #packs;
  #players;
  #setMap;
  #gameStart;

  constructor(){
    
    this.#gameStart = false;
    this.#players = [];
    this.#packs = [];
    this.#setMap = new Map();
    
  }

  async genCards(sets){
    
  }

  addPlayer(player){
    
  }

  endGame(){
    
  }
  
  async pick(){
    return false;
  }

  async pick(num){
    return false;
  }

  async pass(){
    return false;
  }

  async presentCards(){
    
  }
  
  #startGame(){
     
  }
  
}
module.exports = BaseDraft;