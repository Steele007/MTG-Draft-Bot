//keeps track of all active players in all games.
class PlayerRoster {

  static allPlayers = new Map();

  static addPlayer(player, user){

    if(this.allPlayers.has(user)){

        return false;
        
    }else{
      
      this.allPlayers.set(user, player);
      return true;
      
    }  
    
  }

  static clearPlayers(players){

    for(let player of players){

      this.allPlayers.delete(player);
      
    
    
  }

  
  
}
}