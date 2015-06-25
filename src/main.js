import Video from "./sources/video.js";
import Image from "./sources/image.js";
import Canvas from "./sources/canvas.js";


let updateables = [];
let previousTime = undefined;
let mediaSourceMapping = new Map();
mediaSourceMapping.set("video",Video).set("image",Image).set("canvas",Canvas);


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
    }

    stop(){
        this.playing = false;
        for (let i = 0; i < this.mediaSources.length; i++) {
            this.mediaSources[i].stop();
        };
    }

    seek(time){
        this.currentTime = time;
    }


    setPlaylist(playlist){
        // Playlist 
        // 
        // var playlist = {
        //      "tracks":{
        //          "1":[{type:"video", start:0, duration:5, src:"video1.mp4", uuid:"1"},                        {type:"video", start:7.5, duration:5, src:"video2.mp4", uuid:"3"}],
        //          "2":[                        {type:"image", start:2.5, duration:5, src:"image.png", uuid:"2"}],
        //      }
        // }
        //
        this.playlist = playlist;
    }

    _getPlaylistStatusAtTime(playlist, playhead){
        let toPlay = [];
        let currentlyPlaying = [];
        let finishedPlaying = [];

        //itterate tracks
        for(let i = 0; i < playlist.tracks.length; i++){
            let track = playlist.tracks[i];
            for (let j = 0; j < track.length; j++) {
                let segment = track[j];
                let segmentEnd = segment.start+segment.duration;

                if (playhead > segmentEnd){
                    finishedPlaying.push(segment);
                    continue;
                }
                if (playhead > segment.start && playhead < segmentEnd){
                    currentlyPlaying.push(segment);
                    continue;
                }
                if(playhead < segment.start){
                    toPlay.push(segment);
                    continue;
                }
            };
        }

        return [toPlay, currentlyPlaying, finishedPlaying];
    }

    _calculateTrackDuration(track){
        let maxPlayheadPosition = 0;
        for (let j = 0; j < track.length; j++) {
            let playheadPosition = track[j].start + track[j].duration;
            if (playheadPosition > maxPlayheadPosition){
                maxPlayheadPosition = playheadPosition;
            }
        };
        return maxPlayheadPosition;
    }

    _calculatePlaylistDuration(playlist){
        let maxTrackDuration = 0;

        for(let i = 0; i < playlist.tracks.length; i++){
            let track = playlist.tracks[i];
            let trackDuration = this._calculateTrackDuration(track);
            if (trackDuration > maxTrackDuration){
                maxTrackDuration = trackDuration;
            }
        }

        return maxTrackDuration;
    }

    update(dt){
        if (this.playlist === undefined || this.playing === false) return;
        this.currentTime += dt;
        let [toPlay, currentlyPlaying, finishedPlaying] = this._getPlaylistStatusAtTime(this.playlist, this.currentTime);
        //console.log(toPlay, currentlyPlaying, finishedPlaying);

    }

}

export default VideoCompositor;