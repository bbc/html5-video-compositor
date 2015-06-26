import MediaSource from "./mediasource";

class VideoSource extends MediaSource{
    constructor(properties){
        super(properties);
        this.sourceStart = 0;
        if (properties.sourceStart !== undefined){
            this.sourceStart = properties.sourceStart;
        }
        console.log("Hello Video");
    }
    play(){
        super.play();
        this.element.play();
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
        this.element = document.createElement('video');            
        //construct a fragement URL to cut the required segment from the source video
        //let fragment = '#t='+this.sourceStart+','+this.duration;
        //this.element.src = this.src + fragment;
        this.element.src = this.src;
        this.element.preload = "auto";
        this.element.load();
        let _this = this;
        this.element.addEventListener('loadeddata', function() {
            _this.element.currentTime = _this.sourceStart;
            _this.ready = true;
        }, false);
    }
    render(){
        return this.element;
    }
    destroy(){
        this.element.pause();
        super.destroy();
    }
}

export default VideoSource;