import MediaSource from "./mediasource";

class Image extends MediaSource{
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