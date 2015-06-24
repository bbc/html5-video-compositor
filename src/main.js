import Video from "./sources/video.js";
import Image from "./sources/image.js";
import WebGL from "./sources/webgl.js";

let updateables = [];
let previousTime = undefined;
let mediaSourceMapping = {
    "video":Video,
    "image":Image,
    "webgl":WebGL,
};

function registerUpdateable(updateable){
    updateables.push(updateable);
}
function update(time){
    if (previousTime === undefined) previousTime = time;
    let dt = (time - previousTime)/1000;
    for(let i = 0; i < updateables.length; i++){
        updateables[i].update(dt);
    }
    previousTime = time;
    requestAnimationFrame(update);
}
update();


class VideoCompositor {
    constructor(canvas){
        console.log("Hello VideoCompositor");
        this.canvas = canvas;
        this.ctx = canvas.getContext('webgl');
        this.playing = false;

        this.mediaSources = [];
        this.playlist = undefined;
        this.currentTime = 0;
        registerUpdateable(this);
    }

    play(){
        this.playing = true;
        for (var i = 0; i < this.mediaSources.length; i++) {
            this.mediaSources[i].play();
        };
    }

    setPlaylist(playlist){
        // Playlist 
        // 
        // var playlist = {
        //      "tracks":{
        //          "1":[{type:"video", start:0, duration:5, src:"video1.mp4"},                        {type:"video", start:7.5, duration:5, src:"video2.mp4"}],
        //          "2":[                        {type:"image", start:2.5, duration:5, src:"image.png"}],
        //      }
        // }
        //
    }

    update(dt){
        if (this.playlist === undefined || this.playing === false) return;
        this.currentTime += dt;
    }

}

export default VideoCompositor;