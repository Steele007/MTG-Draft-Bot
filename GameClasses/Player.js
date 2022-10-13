class Player{

  user;
  isActive;
  #picks;

  constructor(user){

    this.user = user;
    this.isActive = false;
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

module.exports = Player;