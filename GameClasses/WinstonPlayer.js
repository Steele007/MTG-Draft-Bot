const Player = require('./Player.js');
class WinstonPlayer extends Player{

  #picks;
  
  constructor(user){

    super(user);
    this.#picks = [];
    
  }

  addPick(pick){

    if(Array.isArray(pick) ){
      this.#picks= this.#picks.concat(pick);
    }else{
      this.#picks.push(pick);
    }
    
    
  }

  getPicks(){

    return this.#picks;
    
  }
  
}
module.exports = WinstonPlayer;