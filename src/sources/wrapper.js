
class Wrapper {
    constructor(properties){
        this.id = properties.id;
        this.currentTime = 0;
        this.texture = undefined;
        this.playing = false;
        this.ready = true;
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
        //this.texture.destroy();
    }
}

export default Wrapper;