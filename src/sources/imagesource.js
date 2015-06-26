import MediaSource from "./mediasource";

class ImageSource extends MediaSource{
    constructor(properties){
        super(properties);
        console.log("Hello Image");
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
        this.element = new Image();
        let _this = this;
        this.element.onload = function(){
            _this.ready = true;
        }
        this.element.src = this.src;
    }
    render(){
        return this.element;
    }
}

export default ImageSource;