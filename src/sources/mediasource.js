
class MediaSource {
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
            new Float32Array([
                1.0, 1.0,
                 -1.0, 1.0,
                1.0,  -1.0,
                1.0,  -1.0,
                -1.0, 1.0,
                -1.0, -1.0]),
            gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    }
    play(){
        //console.log("Playing", this.id);
        if (this.playing === false){
            for (let i = 0; i < this.mediaSourceListeners.length; i++) {
                if(typeof this.mediaSourceListeners[i].play === 'function')this.mediaSourceListeners[i].play(this);
            }    
        }
        this.playing = true;
    }
    pause(){
        console.debug("Pausing", this.id);
        this.playing = false;
        for (let i = 0; i < this.mediaSourceListeners.length; i++) {
            if(typeof this.mediaSourceListeners[i].pause === 'function')this.mediaSourceListeners[i].pause(this);
        }
    }
    seek(seekTime){
        //this.currentTime = seekTime;
        for (let i = 0; i < this.mediaSourceListeners.length; i++) {
            if(typeof this.mediaSourceListeners[i].seek === 'function')this.mediaSourceListeners[i].seek(this, seekTime);
        }
    }
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
    destroy(){
        console.debug("Destroying", this.id);
        for (let i = 0; i < this.mediaSourceListeners.length; i++) {
            if (typeof this.mediaSourceListeners[i].destroy === 'function') this.mediaSourceListeners[i].destroy(this);
        }
        if (this.disposeOfElementOnDestroy){
            delete this.element;  
        }
    }
    render(program, renderParameters){
        //renders the media source to the WebGL context using the pased program

        let overriddenElement;
        for (let i = 0; i < this.mediaSourceListeners.length; i++) {
            if (typeof this.mediaSourceListeners[i].render === 'function'){
                let result =  this.mediaSourceListeners[i].render(this, progress);
                if (result !== undefined) overriddenElement = result;
            }
        }

        this.gl.useProgram(program);
        let renderParametersKeys = Object.keys(renderParameters);
        for (let index in renderParametersKeys){
            let key = renderParametersKeys[index];

            let parameterLoctation = this.gl.getUniformLocation(program, key);
            if (parameterLoctation !== -1){
                this.gl.uniform1f(parameterLoctation, renderParameters[key]);
            }
        }
        
        
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