import MediaSource from "./mediasource";

class VideoSource extends MediaSource{
    constructor(properties){
        super(properties);
        this.sourceStart = 0;
        if (properties.sourceStart !== undefined){
            this.sourceStart = properties.sourceStart;
        }
    }
    play(){
        super.play();
        this.element.play();
    }
    seek(time){
        super.seek(time);
        if ((time - this.start) < 0 || time >(this.start+this.duration)) return;
        this.element.currentTime = (time - this.start) + this.sourceStart;
    }
    pause(){
        super.pause();
        this.element.pause();
    }
    load(){
        //check if we're using an already instatiated element, if so don't do anything.
        if (super.load()){
            this.element.currentTime = this.sourceStart;
            this.seek(0);
            this.ready = true;
            this.onready(this);
            return;
        };
        console.log("CREATING MY OWN VIDEO ELEMENT");
        //otherwise begin the loading process for this mediaSource
        this.element = document.createElement('video');            
        //construct a fragement URL to cut the required segment from the source video
        this.element.src = this.src;
        this.element.preload = "auto";
        this.element.load();
        let _this = this;
        this.element.addEventListener('loadeddata', function() {
            _this.element.currentTime = _this.sourceStart;
            _this.seek(0);
            _this.ready = true;
            _this.onready(this);
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