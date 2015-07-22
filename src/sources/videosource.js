import MediaSource from "./mediasource";

class VideoSource extends MediaSource{
    constructor(properties, gl){
        super(properties, gl);
        this.sourceStart = 0;
        this._volume = 1.0;
        if (properties.sourceStart !== undefined){
            this.sourceStart = properties.sourceStart;
        }
        if (properties.volume !== undefined){
            this._volume = properties.volume;
        }
    }
    play(){
        super.play();
        this.element.play();
    }
    seek(time){
        super.seek(time);
        if ((time - this.start) < 0 || time >(this.start+this.duration)){
            this.element.currentTime = this.sourceStart;
        } else {
            this.element.currentTime = (time - this.start) + this.sourceStart;
        }
    }
    pause(){
        super.pause();
        this.element.pause();
    }
    load(){
        //check if we're using an already instatiated element, if so don't do anything.

        if (super.load()){
            //this.element.currentTime = this.sourceStart;
            this.seek(0);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.element);
            this.ready = true;
            this.onready(this);
            return;
        };
        //otherwise begin the loading process for this mediaSource
        this.element = document.createElement('video');            
        //construct a fragement URL to cut the required segment from the source video
        this.element.src = this.src;
        this.element.volume = this._volume;
        this.element.preload = "auto";
        this.element.load();
        let _this = this;
        this.element.addEventListener('loadeddata', function() {
            _this.element.currentTime = _this.sourceStart;
            _this.seek(0);
            _this.gl.texImage2D(_this.gl.TEXTURE_2D, 0, _this.gl.RGBA, _this.gl.RGBA, _this.gl.UNSIGNED_BYTE, _this.element);
            _this.ready = true;
            _this.onready(_this);
        }, false);
        /*this.element.addEventListener('seeked', function(){
            console.log("SEEKED");
            _this.ready = true;
            _this.onready(_this);
        })*/


    }
    render(program){
        super.render(program);
    }
    destroy(){
        this.element.pause();
        super.destroy();
    }
}

export default VideoSource;