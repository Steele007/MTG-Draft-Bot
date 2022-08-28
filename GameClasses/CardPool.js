class CardPool {

  #sortedPool;

  constructor(cardPool){

    
    this.#sortedPool = new Map();
    this.#sortedPool.set("land", []);
    this.#sortedPool.set("common", []);
    this.#sortedPool.set("uncommon", []);
    this.#sortedPool.set("rare", []);
    this.#sortedPool.set("mythic", []);

    for(let card of cardPool){

      //console.log(card);
      if(card.booster === false){

        
      
      }else if(card.type_line.startsWith("Basic ") || card.name === "Tranquil Cove" || card.name === "Blossoming Sands" || card.name === "Dismal Backwater" || card.name === "Bloodfell Caves" || card.name === "Rugged Highlands" || card.name === "Scoured Barrens" || card.name === "Wind-Scarred Crag" || card.name === "Swiftwater Cliffs" || card.name === "Thornwood Falls" || card.name === "Jungle Hollow"){

        this.#sortedPool.set("land", Array.from(this.#sortedPool.get("land").push(card)));
        
      }else if(card.rarity === "common"){

        let arrayToUpdate = Array.from(this.#sortedPool.get("common"));
        arrayToUpdate.push(card);
        this.#sortedPool.set("common", arrayToUpdate);
        
        
      }else if(card.rarity === "uncommon"){

        let arrayToUpdate = Array.from(this.#sortedPool.get("uncommon"));
        arrayToUpdate.push(card);
        this.#sortedPool.set("uncommon", arrayToUpdate);
        
        
      }else if(card.rarity === "rare"){

        let arrayToUpdate = Array.from(this.#sortedPool.get("rare"));
        arrayToUpdate.push(card);
        this.#sortedPool.set("rare", arrayToUpdate);
        
        
      }else if(card.rarity === "mythic"){

        let arrayToUpdate = Array.from(this.#sortedPool.get("mythic"));
        arrayToUpdate.push(card);
        this.#sortedPool.set("mythic", arrayToUpdate);
        
        
      }
      
    }    
    
  }

  getLand(){

    let lands = this.#sortedPool.get("land");
    return lands[Math.floor(Math.random() * lands.length)];
    
  }

  getCommon(){

    let commons = this.#sortedPool.get("common");
    return commons[Math.floor(Math.random() * commons.length)];
    
  }

  getUncommon(){

    let uncommons = this.#sortedPool.get("uncommon");
    return uncommons[Math.floor(Math.random() * uncommons.length)];
    
  }
  
  getRare(){

    let rares = this.#sortedPool.get("rare");
    return rares[Math.floor(Math.random() * rares.length)];
    
  }
  
  getMythic(){

    let mythics = this.#sortedPool.get("mythic");
    return mythics[Math.floor(Math.random() * mythics.length)];
    
  }
}
module.exports = CardPool;