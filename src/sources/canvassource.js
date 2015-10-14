//Matthew Shotton, R&D User Experince,© BBC 2015
import MediaSource from "./mediasource";

class CanvasSource extends MediaSource{
    /**
    * Canvas playback source. Inherits from MediaSource 
    *
    * A CanvasSource is the manifestation of a mediaSourceReference from a playlist object which has type "canvas". 
    * 
    * A CanvasSource exists for a period slightly before a CanvasSource is to play in order to give it time to preload and
    * is destroyed as soon as the CanvasSource has finished playing.
    *
    * @param {Object} properties - An object with the following attributes: id, duration, start, and element. 
    * Where src is the URL of a video, or element is a DOM Video element.
    * 
    * @param {WebGLContext} gl - a webGl context to render too.
    */
    constructor(properties, gl){
        super(properties, gl);
        this.width = properties.width;
        this.height = properties.height;
    }
    /**
    * Set the CanvasSource playing.
    */
    play(){
        super.play();
    }
    /**
    * Seek to playlist time and do something appropriate with this CavnasSource. This can effect shaders applied to this 
    * canvas and any MediaSourceListeners listening to the Id of this source.
    * @param {number} seekTime - The time to seek too, this is the overall time for the whole playlist.
    */
    seek(time){
        super.seek(time);
    }
    /**
    * Pause the CanvasSource if it is playing.
    */
    pause(){
        super.pause();
    }
    /**
    * Set the CanvasSource loading, when it's ready isReady() will return true.
    */
    load(){
        //check if we're using an already instatiated element, if so don't do anything.
        if (super.load()){
            this.seek(0);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.element);
            this.ready = true;
            this.width = this.element.width;
            this.height = this.element.height;
            this.onready(this);
            return;
        }


        //otherwise begin the loading process for this mediaSource
        this.element = document.createElement("canvas");
        this.element.width = this.width;
        this.element.height = this.height;
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.element);
        this.ready = true;
        this.onready(this);
    }
    render(program,  renderParameters, textures){
        super.render(program,  renderParameters, textures);
    }
}

export default CanvasSource;