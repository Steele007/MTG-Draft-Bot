class Queue{

  #queue;
  #front;
  #back;
  #count;
  
  constructor(size){
    
    this.#queue = new Array(size);
    this.#count = 0;
    this.#back = -1;
    this.#front = 0;
    
  }

  dequeue(){
    
    if(this.#count > 0){
      let item = this.#queue[this.#front];
      this.#front = ((this.#front + 1) % this.#queue.length)
      this.#count--;
      return item;
    }
    
    return null;
  }

  enqueue(item){
    
    if(this.#count < this.#queue.length){

      this.#count++;
      this.#back = ((this.#back + 1) % this.#queue.length);
      this.#queue[this.#back] = item;   
      
    }
    
  }
  
}
module.exports = Queue;