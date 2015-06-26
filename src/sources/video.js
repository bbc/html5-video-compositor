import MediaSource from "./mediasource";

class Video extends MediaSource{
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