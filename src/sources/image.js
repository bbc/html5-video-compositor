import Wrapper from "./wrapper";

class Image extends Wrapper{
    constructor(properties){
        super(properties);
        this.src = properties.src;
        console.log("Hello Image");
    }
    play(){
        super.play();
    }
    stop(){
        super.stop();
    }
}

export default Image;