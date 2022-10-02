class BaseDraft{

  #packs;
  #players;
  #setMap;
  #gameStart;

  constructor(){
    
    this.#gameStart = false;
    this.#players = [];
    
  }

  async genCards(sets){
    
  }

  addPlayer(player){
    
  }

  endGame(){
    
  }
  
  async pick(){
    this.#players[this.#activePlayer].user.send("Invalid command.");
  }

  async pick(num){
    this.#players[this.#activePlayer].user.send("Invalid command.");
  }

  async pass(){
    this.#players[this.#activePlayer].user.send("Invalid command.");
  }

  async presentCards(){
    
  }
  
   #startGame(){
     
   }
  
}
module.exports = BaseDraft;