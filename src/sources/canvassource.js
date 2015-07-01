import MediaSource from "./mediasource";

class CanvasSource extends MediaSource{
    constructor(properties){
        super(properties);
        this.width = properties.width;
        this.height = properties.height;
    }
    play(){
        super.play();
    }
    seek(time){
        super.seek(time);
    }
    pause(){
        super.pause();
    }
    load(){
        //check if we're using an already instatiated element, if so don't do anything.
        if (super.load()){
            this.seek(0);
            this.ready = true;
            this.onready(this);
            return;
        }


        //otherwise begin the loading process for this mediaSource
        this.element = document.createElement("canvas");
        this.element.width = this.width;
        this.element.height = this.height;
        this.ready = true;
        this.onready(this);
    }
    render(){
        return this.element;
    }
}

export default CanvasSource;