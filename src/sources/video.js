import Wrapper from "./wrapper";

class Video extends Wrapper{
    constructor(properties){
        super(properties);
        this.src = properties.src;
        console.log("Hello Video");
    }
    play(){
        super.play();
    }
    stop(){
        super.stop();
    }
}

export default Video;