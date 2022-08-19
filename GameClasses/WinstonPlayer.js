class WinstonPlayer extends Player{

  #picks;
  
  constructor(user){

    super(user);
    this.#picks = [];
    
  }

  addPick(pick){

    this.#picks.pus(pick);
    
  }
  
}