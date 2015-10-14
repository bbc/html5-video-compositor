//Matthew Shotton, R&D User Experince,© BBC 2015

class MediaSource {
    /**
    * Parent class of all MediaSources 
    *
    * A MediaSource is the manifestation of a mediaSourceReference from a playlist object. It typically contains the 
    * original DOM element to be composited along with a number of functions to load, play, pause, seek and render that 
    * element to the webgl context.
    * 
    * A MediaSource exists for a period slightly before a MediaSource is to play in order to give it time to preload and
    * is destroyed as soon as the MediaSource has finished playing.
    *
    * @param {Object} properties - An object with the following attributes: id, duration, start, and src or element. 
    * Where src is the URL of something that can be used to create a DOM element that can be rendered to canvas, or 
    * element is a DOM element that can be rendered to a canvas.
    * 
    * @param {WebGLContext} gl - a webGl context to render too.
    */
    constructor(properties, gl){
        this.gl = gl;
        this.id = properties.id;
        this.duration = properties.duration;
        this.start = properties.start;
        this.playing = false;
        this.ready = false;
        this.element = undefined;
        this.src = undefined;
        this.texture = undefined;
        this.width = undefined;
        this.height = undefined;
        this.mediaSourceListeners = [];

        this.disposeOfElementOnDestroy = false;

        //If the mediaSource is created from a src string then it must be resonsible for cleaning itself up.
        if (properties.src !== undefined){
            this.disposeOfElementOnDestroy = true;
            this.src = properties.src;
        }else {
            //If the MediaSource is created from an element then it should not clean the element up on destruction as it may be used elsewhere.
            this.disposeOfElementOnDestroy = false;
            this.element = properties.element;
        }


        /*let positionLocation = gl.getAttribLocation(program, "a_position");
        let texCoordLocation = gl.getAttribLocation(program, "a_texCoord");*/
        
        //Hard Code these for now, but this is baaaaaad
        let positionLocation = 0;
        let texCoordLocation = 1;
        
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable ( gl.BLEND) ;
        // Create a texture.
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        

        let buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bufferData(
            gl.ARRAY_BUFFER,
            /*new Float32Array([
                1.0, 1.0,
                 -1.0, 1.0,
                1.0,  -1.0,
                1.0,  -1.0,
                -1.0, 1.0,
                -1.0, -1.0]),*/
            new Float32Array([
                1.0, 1.0,
                0.0, 1.0,
                1.0, 0.0,
                1.0, 0.0,
                0.0, 1.0,
                0.0, 0.0]),
            gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    }
    
    /**
    * Set the MediaSource playing.
    */
    play(){
        //console.log("Playing", this.id);
        if (this.playing === false){
            for (let i = 0; i < this.mediaSourceListeners.length; i++) {
                if(typeof this.mediaSourceListeners[i].play === 'function')this.mediaSourceListeners[i].play(this);
            }    
        }
        this.playing = true;
    }
    /**
    * Pause the MediaSource if it is playing.
    */
    pause(){
        console.debug("Pausing", this.id);
        this.playing = false;
        for (let i = 0; i < this.mediaSourceListeners.length; i++) {
            if(typeof this.mediaSourceListeners[i].pause === 'function')this.mediaSourceListeners[i].pause(this);
        }
    }
    /**
    * Seek the MediaSource to an appropriate point for the passed time.
    * @param {number} seekTime - The time to seek too, this is the overall time for the whole playlist.
    */
    seek(seekTime){
        //this.currentTime = seekTime;
        for (let i = 0; i < this.mediaSourceListeners.length; i++) {
            if(typeof this.mediaSourceListeners[i].seek === 'function')this.mediaSourceListeners[i].seek(this, seekTime);
        }
    }
    /**
    * Check if the MediaSource is ready to start playing.
    */
    isReady(){
        let listenerReady = true;
        for (let i = 0; i < this.mediaSourceListeners.length; i++) {
            if(typeof this.mediaSourceListeners[i].isReady === 'function'){
                if (this.mediaSourceListeners[i].isReady(this) === false){
                    listenerReady = false;
                }
            }
        }
        if (listenerReady === true && this.ready === true) return true;
        return false;
    }
    /**
    * Set the MediaSource loading, when it's ready isReady() will return true.
    */
    load(){
        console.debug("Loading", this.id);
        for (let i = 0; i < this.mediaSourceListeners.length; i++) {
            if(typeof this.mediaSourceListeners[i].load === 'function')this.mediaSourceListeners[i].load(this);
        }
        if (this.element !== undefined) {
            return true;
        }
        return false;
    }
    /**
    * Clean up the MediaSource for detruction.
    */
    destroy(){
        console.debug("Destroying", this.id);
        for (let i = 0; i < this.mediaSourceListeners.length; i++) {
            if (typeof this.mediaSourceListeners[i].destroy === 'function') this.mediaSourceListeners[i].destroy(this);
        }
        if (this.disposeOfElementOnDestroy){
            delete this.element;  
        }
    }
    /**
    * Render the MediaSource to the WebGL context passed into the constructor.
    */
    render(program, renderParameters, textures){
        //renders the media source to the WebGL context using the pased program
        let overriddenElement;
        for (let i = 0; i < this.mediaSourceListeners.length; i++) {
            if (typeof this.mediaSourceListeners[i].render === 'function'){
                let result =  this.mediaSourceListeners[i].render(this, renderParameters);
                if (result !== undefined) overriddenElement = result;
            }
        }

        this.gl.useProgram(program);
        let renderParametersKeys = Object.keys(renderParameters);
        let textureOffset = 1;
        for (let index in renderParametersKeys){
            let key = renderParametersKeys[index];
            let parameterLoctation = this.gl.getUniformLocation(program, key);
            if (parameterLoctation !== -1){
                if (typeof renderParameters[key] === "number"){
                    this.gl.uniform1f(parameterLoctation, renderParameters[key]);
                }
                else if( Object.prototype.toString.call(renderParameters[key]) === '[object Array]'){
                    let array = renderParameters[key];
                    if(array.length === 1){
                        this.gl.uniform1fv(parameterLoctation, array);
                    } else if(array.length === 2){
                        this.gl.uniform2fv(parameterLoctation, array);
                    } else if(array.length === 3){
                        this.gl.uniform3fv(parameterLoctation, array);
                    } else if(array.length === 4){
                        this.gl.uniform4fv(parameterLoctation, array);
                    } else{
                        console.debug("Shader parameter", key, "is too long and array:", array);
                    }
                }
                else{
                    //Is a texture
                    this.gl.activeTexture(this.gl.TEXTURE0 + textureOffset);
                    this.gl.uniform1i(parameterLoctation, textureOffset);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, textures[textureOffset-1]);
                }
            }
        }
        
        this.gl.activeTexture(this.gl.TEXTURE0);
        let textureLocation = this.gl.getUniformLocation(program, "u_image");
        this.gl.uniform1i(textureLocation, 0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        if (overriddenElement !== undefined){
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, overriddenElement);
        } else {
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.element);
        }
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
    onready(mediaSource){
    }
}

export default MediaSource;