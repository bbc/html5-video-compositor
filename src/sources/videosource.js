//Matthew Shotton, R&D User Experince,© BBC 2015
import MediaSource from "./mediasource";


function eventOneTime(element, type, callback){
    let handleEvent = function(e){
        e.target.removeEventListener(e.type, handleEvent);
        return callback(e);
    };

    element.addEventListener(type, handleEvent, false);         
}

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
    /**
    * Set the VideoSource playing.
    */
    play(){
        super.play();
        let _this = this;

        let playVideo = function(){
            if (_this.element.readyState > 3){
                _this.ready = true;
                _this.element.play();
            } else {
                console.debug("Can't play video due to readyState");
                _this.ready = false;
                eventOneTime(_this.element, "canplay", playVideo);
            }
        };

        playVideo();
    }
    /**
    * Seek the VideoSource to an appropriate point for the passed time.
    * @param {number} seekTime - The time to seek too, this is the overall time for the whole playlist.
    */
    seek(time){
        super.seek();
        let _this = this;

        let seekVideo = function(){
            if (_this.element.readyState > 3){
                _this.ready = true;
                if ((time - _this.start) < 0 || time >(_this.start+_this.duration)){
                    _this.element.currentTime = _this.sourceStart;
                } else {
                    _this.element.currentTime = (time - _this.start) + _this.sourceStart;
                }
            } else {
                //If the element isn't ready to seek create a one-time event which seeks the element once it is ready.
                console.debug("Can't seek video due to readyState");
                _this.ready = false;
                eventOneTime(_this.element, "canplay", seekVideo);
            }
        };

        seekVideo();  
    }
    /**
    * Pause the VideoSource if it is playing.
    */
    pause(){
        super.pause();
        this.element.pause();
    }
    /**
    * Set the VideoSource loading, when it's ready isReady() will return true.
    */
    load(){
        //check if we're using an already instatiated element, if so don't do anything.

        if (super.load()){
            //this.element.currentTime = this.sourceStart;
            this.seek(0);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.element);
            this.ready = true;
            this.width = this.element.videoWidth;
            this.height = this.element.videoHeight;
            this.onready(this);
            return;
        }
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
            _this.width = _this.element.videoWidth;
            _this.height = _this.element.videoHeight;
            _this.onready(_this);
        }, false);
        /*this.element.addEventListener('seeked', function(){
            console.log("SEEKED");
            _this.ready = true;
            _this.onready(_this);
        })*/


    }
    /**
    * Render the VideoSource to the WebGL context passed into the constructor.
    */
    render(program, renderParameters, textures){
        super.render(program, renderParameters, textures);
    }
    /**
    * Clean up the VideoSource for detruction.
    */
    destroy(){
        this.element.pause();
        if (this.disposeOfElementOnDestroy){
            this.element.src = "";
            this.element.removeAttribute("src");    
        }
        super.destroy();
    }
}

export default VideoSource;