import Wrapper from "./wrapper";

class Canvas extends Wrapper{
    constructor(properties){
        super(properties);
        console.log("Hello Canvas");
    }
    play(){
        super.play();
    }
    stop(){
        super.stop();
    }
}

export default Canvas;