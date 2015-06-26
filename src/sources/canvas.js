import MediaSource from "./mediasource";

class Canvas extends MediaSource{
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