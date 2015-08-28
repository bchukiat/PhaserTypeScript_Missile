module GameModule.Sprite{
  export class City extends Phaser.Sprite{
    game:Phaser.Game;
    state:Phaser.State;
    xval:number;
    yval:number;
    hitX:number;
    hitY:number;

    constructor(state:any, x:number){
      this.game=state.game;
      this.state=state;
      this.xval = x;
      this.yval = 400;

      super(this.game,this.xval,this.yval,'city',0);
      this.hitX = this.xval + 32;
      this.hitY = this.yval + 30;

      return this;
    }

    nuked(){
      //console.log('nuked');
      this.frame = 1;
    	this.alive = false;
    }



  }
}
