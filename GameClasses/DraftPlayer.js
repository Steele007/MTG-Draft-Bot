const Player = require('./Player.js');
const Queue = require('./Queue.js');

class DraftPlayer extends Player{

  #packQueue;
  #currentPack;
  
  constructor(user){
    super(user);
  }

  initializeQueue(size){
    if(this.#packQueue == null){
      this.#packQueue = new Queue(size);
    }
  }

  addPack(pack){
    this.#packQueue.enqueue(pack);
    if(this.#currentPack == null){
      this.#currentPack = this.#packQueue.dequeue();
    }
  }

  //Pass by reference causing some problems here.
  passPack(){
    passedPack = this.#currentPack;
    this.#currentPack = null;
    return passedPack;
  }
  
}
module.exports = DraftPlayer;