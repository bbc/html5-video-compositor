
class Wrapper {
    constructor(properties){
        this.id = properties.id;
        this.currentTime = 0;
    }
    play(){
        console.log("Playing", this.id);
    }
    stop(){
        console.log("Stopping", this.id);
    }
}

export default Wrapper;