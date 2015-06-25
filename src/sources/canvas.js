import Wrapper from "./wrapper";

class WebGL extends Wrapper{
    constructor(properties){
        super(properties);
        console.log("Hello WebGL");
    }
    play(){
        super.play();
    }
    stop(){
        super.stop();
    }
}

export default WebGL;