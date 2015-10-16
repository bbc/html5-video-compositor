

function isIdInTrack(id, track){
    for (let i = 0; i < track.length; i++) {
        if (track[i].id === id){
            return true;
        }
    }
    return false;
}

function getTrackIndexsForId(id, tracks){
    let trackIndexs = [];
    for (let i = 0; i < tracks.length; i++) {
        let track = tracks[i];
        if (isIdInTrack(id, track)){
            trackIndexs.push(i);
        }
    }
    return trackIndexs;
}


class AudioManager {
    constructor(audioCtx){
        this.audioCtx = audioCtx;
        this.tracks = [];
        this.audioNodes = new Map();
        this.audioOutputNodes = [];
    }
        
    createAudioNodeFromTrack(track){
        if (this.audioCtx === undefined){
            // There can only be a max of 6 AudioContexts in most browsers, so only instantiate it here rather than in 
            // constructor as it's genuinley needed. Otherwise having >6 VideoCompositor instances running will break 
            // the browser.
            this.audioCtx = new AudioContext();
        }
        this.tracks.push(track);
        let trackBus = this.audioCtx.createGain();
        this.audioOutputNodes.push(trackBus);
        return trackBus;
    }

    getAudioContext(){
        if (this.audioCtx === undefined){
            // There can only be a max of 6 AudioContexts in most browsers, so only instantiate it here rather than in 
            // constructor as it's genuinley needed. Otherwise having >6 VideoCompositor instances running will break 
            // the browser.
            this.audioCtx = new AudioContext();
        }
        return this.audioCtx;
    }

    update(mediaSources){
        if (mediaSources === undefined) return;
        for (let id of mediaSources.keys()) {
            let mediaSource = mediaSources.get(id);
            let trackIndexs = getTrackIndexsForId(id, this.tracks);
            if (trackIndexs.length ===0) continue; //No mappings for this id
            
            if (!this.audioNodes.has(id)){
                //if an AudioNode for this id does not exist, create it.
                let audioNode;
                try{
                    audioNode = this.audioCtx.createMediaElementSource(mediaSource.element);
                } catch (err) {
                    continue;
                }

                this.audioNodes.set(id, audioNode);
                //make the connections from the audio node to the appropriate output tracks
                for (let i = 0; i < trackIndexs.length; i++) {
                    let trackIndex = trackIndexs[i];
                    audioNode.connect(this.audioOutputNodes[trackIndex]);
                }
            }
        }
        //TODO add test to make sure all id's for audio nodes stored in this.audioNodes exist in the current mediaSources, otherwise delete them.
    }
}
export default AudioManager;

