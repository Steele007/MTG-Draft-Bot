//keeps track of all active players in all games.
class PlayerRoster {

  static #allPlayers = new Set();

  static addPlayers(players){

    for(let player of players){

      if(this.#allPlayers.has(player)){

        return false;
        
      }
      
    }

    for(let player of players){

      this.#allPlayers.add(player);
      
    }

    return true;
    
  }

  static clearPlayers(players){

    for(let player of players){

      if(this.#allPlayers.has(player)){

        return false;
        
      }
      
    }
    
  }

  
  
}