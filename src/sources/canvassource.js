import MediaSource from "./mediasource";

class CanvasSource extends MediaSource{
    constructor(properties){
        super(properties);
        this.width = properties.width;
        this.height = properties.height;
        console.log("Hello Canvas");
    }
    play(){
        super.play();
    }
    seek(){
        super.seek();
    }
    stop(){
        super.stop();
    }
    load(){
        //check if we're using an already instatiated element, if so don't do anything.
        if (super.load())return;

        //otherwise begin the loading process for this mediaSource
        this.element = document.createElement("canvas");
        this.element.width = this.width;
        this.element.height = this.height;
        this.ready = true;
    }
    render(){
        return this.element;
    }
}

export default CanvasSource;