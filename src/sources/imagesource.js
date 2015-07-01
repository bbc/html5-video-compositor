import MediaSource from "./mediasource";

class ImageSource extends MediaSource{
    constructor(properties){
        super(properties);
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
            return
        };

        //otherwise begin the loading process for this mediaSource
        this.element = new Image();
        let _this = this;
        this.element.onload = function(){
            _this.ready = true;
            _this.onready(_this);
        }
        this.element.src = this.src;
    }
    render(){
        return this.element;
    }
}

export default ImageSource;