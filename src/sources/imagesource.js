//Matthew Shotton, R&D User Experince,© BBC 2015
import MediaSource from "./mediasource";

class ImageSource extends MediaSource{
    /**
    * Image playback source. Inherits from MediaSource 
    *
    * A ImageSource is the manifestation of a mediaSourceReference from a playlist object which has type "image". 
    * 
    * A ImageSource exists for a period slightly before a ImageSource is to play in order to give it time to preload and
    * is destroyed as soon as the ImageSource has finished playing.
    *
    * @param {Object} properties - An object with the following attributes: id, duration, start, and src or element. 
    * Where src is the URL of a video, or element is a DOM Video element.
    * 
    * @param {WebGLContext} gl - a webGl context to render too.
    */
    constructor(properties, gl){
        super(properties, gl);
    }
    /**
    * Set the ImageSource playing.
    */
    play(){
        super.play();
    }
    /**
    * Seek to playlist time and do something appropriate with this ImageSource. This has little effect on the image as it's 
    * static but can affect any effect shaders applied to this image and any MediaSourceListeners listening to the Id of 
    * this source.
    * @param {number} seekTime - The time to seek too, this is the overall time for the whole playlist.
    */
    seek(time){
        super.seek(time);
    }
    /**
    * Pause the ImageSource if it is playing.
    */
    pause(){
        super.pause();
    }
    /**
    * Set the ImageSource loading, when it's ready isReady() will return true.
    */
    load(){
        //check if we're using an already instatiated element, if so don't do anything.
        if (super.load()){
            this.seek(0);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.element);
            this.ready = true;
            // Upload the image into the texture.
            this.width = this.element.width;
            this.height = this.element.height;
            this.onready(this);
            return;
        }

        //otherwise begin the loading process for this mediaSource
        this.element = new Image();
        let _this = this;
        this.element.onload = function(){
            _this.gl.texImage2D(_this.gl.TEXTURE_2D, 0, _this.gl.RGBA, _this.gl.RGBA, _this.gl.UNSIGNED_BYTE, _this.element);
            _this.ready = true;
            _this.onready(_this);
            _this.width = _this.element.width;
            _this.height = _this.element.height;
        };
        this.element.src = this.src;
    }
    render(program,  renderParameters, textures){
        super.render(program,  renderParameters, textures);
    }
}

export default ImageSource;