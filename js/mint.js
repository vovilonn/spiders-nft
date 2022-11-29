var productCounter={
    count:0,									
    incrementCounter:function(){
  if(this.count<3){
      return this.count = this.count + 1;
  }else{
    return this.count;
  }
  
    },
    decrementCounter:function(){
          if (this.count>1){
          return this.count = this.count - 1;
        } else {
          return this.count=1;
        }
    },
    resetCounter:function(){
      return this.count=1;
    }	

};

var displayCout = document.getElementById('displayCounter');
displayCout.innerHTML=1;
document.getElementById('increment').onclick=function(){
displayCout.innerHTML=productCounter.incrementCounter();
}
document.getElementById('decrement').onclick=function(){
displayCout.innerHTML = productCounter.decrementCounter();
}
