
class MediaSource {
    constructor(properties){
        this.id = properties.id;
        this.duration = properties.duration;
        this.playing = false;
        this.ready = false;
        this.element;
        this.src;

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
        //console.log("Playing", this.id);
        this.playing = true;
    }
    stop(){
        console.log("Stopping", this.id);
        this.playing = false;
    }
    seek(seekTime){
        //this.currentTime = seekTime;
    }
    isReady(){
        return this.ready;
    }
    load(){
        console.log("Loading", this.id);
        if (this.element !== undefined) {
            this.ready = true;
            return true;
        }
        return false;
    }
    destroy(){
        console.log("Destroying", this.id);
        if (this.disposeOfElementOnDestroy){
            delete this.element;  
        }
    }
    render(w,h){
        //returns a render of this mediaSource which can be rendered to the display surface.
    }
}

export default MediaSource;