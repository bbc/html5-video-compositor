
class MediaSource {
    constructor(properties){
        this.id = properties.id;
        this.currentTime = 0;
        this.texture = undefined;
        this.playing = false;
        this.ready = true;
        
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

    }
    play(){
        console.log("Playing", this.id);
        this.playing = true;
    }
    stop(){
        console.log("Stopping", this.id);
        this.playing = false;
    }
    seek(seekTime){
        this.currentTime = seekTime;
    }
    isReady(){
        return this.ready;
    }
    load(){
        console.log("Loading", this.id);
    }
    destroy(){
        console.log("Destroying", this.id);
        //this.texture.destroy();
    }
}

export default MediaSource;