const https = require('https');
const {CardPool} = require('./CardPool.js');
const {Pack} = require('./Pack.js');
class WinstonDraft{

  #deck; //What else do I call it?
  #packs;
  #players;
  #setMap;
  #cardSlots;
  #cardsInPacks;
  #gameStart;
  #activePlayer;
  #postion; //The position of the card pile the active player is looking at.
  #client;
  
  constructor(sets, client){

    this.#client = client;
    this.#gameStart = false;
    this.#deck = [];
    this.#cardSlots = [[],[],[]];
    this.#setMap = new Set();
    this.#players = [];
    this.#packs = [];
    this.#postion = 0;
    this.#cardsInPacks = 90; //Hardcode different number for sets like Double Masters? 

    //Generate the card pools for each set.
    for(let set of sets){

      if(this.#setMap.has(set)){


        
      }else{

        let j = 1;
        let cardPool;
        let setReq = https.get(`https://api.scryfall.com/cards/search?include_extras=true&include_variations=true&order=set&page=${j}&q=e%3A${set}&unique=prints`, resp => {

          let data = '';
          
          resp.on("data", (chunk) => {
            data += chunk;
          });

          resp.on("end", () => {

            let setPool = JSON.parse(data);
            cardPool = setPool.data;

            while(setPool.has_more === true){

              await new Promise(resolve => setTimeout(resolve, 100));
              j++;
              let innerReq = https.get(`https://api.scryfall.com/cards/search?include_extras=true&include_variations=true&order=set&page=${j}&q=e%3A${set}&unique=prints`, response => {

                data = '';

                response.on("data", (chunk) => {
                  data += chunk;                  
                });

                response.on("end",() => {

                  setPool = JSON.parse(data);
                  cardPool = cardPool.concat(setPool.data);
                  
                });
                
              });
              innerReq.end();
            }

            this.#setMap.add(new CardPool(cardPool))
            
          });
          
        });
        setReq.end();
      }
      
    }

    //Generate a pack for each of the specified sets.
    for(let set of sets){

      this.#packs.push(new Pack(this.#setMap.get(set)));
      
    }

    this.#shuffle();

    this.#cardSlots[0].push(this.#deck.pop());
    this.#cardSlots[1].push(this.#deck.pop());
    this.#cardSlots[2].push(this.#deck.pop());
    
  }

  #shuffle(){

    while(this.#cardsInPacks > 0){

      //Likelyhood of this repeatedly pinging empty packs towards the end?
      let card = this.#packs[Math.floor(Math.random()*6)].pickAtRandom();

      if(card !== null){

        this.#cardsInPacks--;
        this.#deck.push(card);
        
      }
          
    }
    
  }

  pass(){

    if(this.#position >= 2){

      this.#players[this.#activePlayer].addPick(this.#deck.pop()) ;
      this.#postion = 0;
      if(this.#activePlayer === 0){
        this.#activePlayer = 1;
      }else{
        this.#activePlayer = 0;
      }
      
    }else{

      this.#cardSlots[this.#position].push(this.#deck.pop());
      this.#postion++;
      
    }
    
  }

  pick(){

    if(this.#position < 3){

      let picks = Array.from(this.#cardSlots[this.#position]) ;
      this.#cardSlots[this.#position] = [];
      this.#cardSlots[this.#position].push(this.#deck.pop());
      this.#players[this.#activePlayer].addPick(picks);
      this.#postion = 0;
      
      if(this.#activePlayer === 0){
        this.#activePlayer = 1;
      }else{
        this.#activePlayer = 0;
      }
    }
    
  }

  addPlayer(player){

    //Return values tell the bot when to stop letting people join the game.
    //To do: link up PlayerRoster to prevent players from playing multiple games.
    if(this.#players.length === 1){

      this.#players.push(player);
      this.#gameStart = true;
      this.#startGame();
      return true; 
      
    }else if(this.#players.length >= 1){

      //Do nothing in case async shenanigans cause a player to join a full game.
      
    }else{

      this.#players.push(player);
      return false;
      
    }
    
  }

  endGame(){
    
    return this.#players;
  }

  presentCards(){
    
    for(card of this.#cardSlots[this.#postion]){

      if(card.layout == 'transform' || card.layout == 'modal_dfc'){
        let imgLink1 = card.card_faces[0].image_uris.large;
        let imgLink2 = card.card_faces[1].image_uris.large;

      
        let cardFrontImg = new EmbedBuilder().setTitle(card.name).setURL(card.scryfall_uri).setImage(imgLink1);
        let cardBackImg = new EmbedBuilder().setURL(card.scryfall_uri).setImage(imgLink2);
        
        this.#players[this.#activePlayer].user.send({embeds: [cardFrontImg, cardBackImg]});
      }else{

        let imgLink = card.image_uris.large;

        let cardImg = new EmbedBuilder().setTitle(card.name).setURL(card.scryfall_uri).setImage(imgLink);
        this.#players[this.#activePlayer].user.send({embeds: [cardImg]});
        
      }
     
    }

    this.#players[this.#activePlayer].user.send("Pick or Pass?");
    
  }

  #startGame(){

    this.#activePlayer = Math.floor(Math.random*this.#players.length);
    this.#players[this.#activePlayer].isActive = true;
    
  }
  
}