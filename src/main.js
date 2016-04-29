//Matthew Shotton, R&D User Experince,© BBC 2015

import VideoSource from "./sources/videosource.js";
import ImageSource from "./sources/imagesource.js";
import CanvasSource from "./sources/canvassource.js";
import EffectManager from "./effectmanager.js";
import AudioManager from "./audiomanager.js";

let updateables = [];
let previousTime;
let mediaSourceMapping = new Map();
mediaSourceMapping.set("video",VideoSource).set("image",ImageSource).set("canvas",CanvasSource);


function registerUpdateable(updateable){
    updateables.push(updateable);
}
function update(time){
    if (previousTime === undefined) previousTime = time;
    let dt = (time - previousTime)/1000;
    for(let i = 0; i < updateables.length; i++){
        updateables[i]._update(dt);
    }
    previousTime = time;
    requestAnimationFrame(update);
}
update();


class VideoCompositor {
    /**
    * Instantiate the VideoCompositor using the passed canvas to render too.
    *
    * You can also pass an AudioContext for use when calling getAudioNodeForTrack. If one is not provided a context will be created internally and be accessible via the getAudioContext function.
    *
    * @param {Canvas} canvas - The canvas element to render too.
    * @param {AudioContext} audioCtx - The AudioContext to create AudioNode's with.
    * 
    * @example
    * 
    * var canvas = document.getElementById('canvas');
    * var audioCtx = new AudioContext();
    * var videoCompositor = new VideoCompositor(canvas, audioCtx);
    */
    constructor(canvas, audioCtx){
        this._canvas = canvas;
        this._ctx = this._canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true, alpha: false });
        this._playing = false;
        this._mediaSources = new Map();
        //this._mediaSourcePreloadNumber = 4; // define how many mediaSources to preload. This is influenced by the number of simultaneous AJAX requests available.
        this._mediaSourcePreloadLookaheadTime = 10; // define how far into the future to load mediasources.
        this._mediaSourcePostPlayLifetime = 0; // set how long until after a media source has finished playing to keep it around.
        this._playlist = undefined;
        this._eventMappings = new Map();
        this._mediaSourceListeners = new Map();
        this._max_number_of_textures = this._ctx.getParameter(this._ctx.MAX_TEXTURE_IMAGE_UNITS);

        this._effectManager = new EffectManager(this._ctx);
        this._audioManger = new AudioManager(audioCtx);

        this._currentTime = 0;
        this._playbackRate = 1.0;
        this.duration = 0;
        registerUpdateable(this);
    }
    
    /**
    * Sets how far in the future to look for preloading mediasources.
    */
    set preloadTime(time){
        this._mediaSourcePreloadLookaheadTime = time;
    }
    get preloadTime(){
        return this._mediaSourcePreloadLookaheadTime;
    }

    /**
    * Sets how long mediasources will exist for after they have been .
    */
    set postPlayTime(time){
        this._mediaSourcePostPlayLifetime = time;
    }
    get postPlayTime(){
        return this._mediaSourcePostPlayLifetime;
    }

    /** 
    * Sets the playback rate of the video compositor. Msut be greater than 0.
    * @example
    * 
    * var playlist = {
    *   tracks:[
    *       [{type:"video", start:0, duration:4, src:"video1.mp4", id:"video1"}]
    *   ]
    * }
    * var canvas = document.getElementById('canvas');
    * var videoCompositor = new VideoCompositor(canvas);
    * videoCompositor.playlist = playlist;
    * videoCompositor.playbackRate = 2.0; //Play at double speed
    * videoCompositor.play();
    */
    set playbackRate(playbackRate){
        if (typeof playbackRate === 'string' || playbackRate instanceof String){
            playbackRate = parseFloat(playbackRate);
        }
        if (playbackRate < 0) playbackRate = 0;
        this._playbackRate = playbackRate;
    }

    /**
    * Gets the playback rate.
    *
    * @example
    * var canvas = document.getElementById('canvas');
    * var videoCompositor = new VideoCompositor(canvas);
    * console.log(videoCompositor. playbackRate); // will print 1.0.
    */
    get playbackRate(){
        return this._playbackRate;
    }

    /**
    * Sets the current time through the playlist.
    *
    * Setting this is how you seek through the content. Should be frame accurate, but probably slow.
    * @param {number} time - The time to seek to in seconds.
    * 
    * @example
    * 
    * var playlist = {
    *   tracks:[
    *       [{type:"video", start:0, duration:4, src:"video1.mp4", id:"video1"},{type:"video", start:4, duration:4, src:"video2.mp4", id:"video2"}]
    *   ]
    * }
    * var canvas = document.getElementById('canvas');
    * var videoCompositor = new VideoCompositor(canvas);
    * videoCompositor.playlist = playlist;
    * videoCompositor.currentTime = 3; //Skip three seconds in.
    * videoCompositor.play();
    */
    set currentTime(currentTime){
        if (typeof currentTime === 'string' || currentTime instanceof String){
            currentTime = parseFloat(currentTime);
        }

        console.debug("Seeking to", currentTime);
        if (this._playlist === undefined){
            return;
        }
        let [toPlay, currentlyPlaying, finishedPlaying] = this._getPlaylistPlayingStatusAtTime(this._playlist, currentTime);

        //clean up any nodes in the audioManager
        this._audioManger.clearAudioNodeCache();

        //clean-up any currently playing mediaSources
        let _this = this;
        this._mediaSources.forEach(function(mediaSource){
            let shouldDestory = false;
            
            //check if the media source matches one in the new currently playing or list.
            for (let i = 0; i < finishedPlaying.length; i++) {
                if (mediaSource.id === finishedPlaying[i].id){
                    shouldDestory = true;
                }
            }
            
            //check it the media source has already been played a littlebit
            if (mediaSource.playing === true) shouldDestory = true;
            
            if (shouldDestory){
                _this._mediaSources.delete(mediaSource.id); 
                mediaSource.destroy();
            }
        });
        //this._mediaSources.clear();

        //Load mediaSources
        for (let i = 0; i < currentlyPlaying.length; i++) {
            let mediaSourceID = currentlyPlaying[i].id;
            //If the media source isn't loaded then we start loading it.
            if (this._mediaSources.has(mediaSourceID) === false){
                this._loadMediaSource(currentlyPlaying[i], function(mediaSource){
                    mediaSource.seek(currentTime);
                });

            }else{
               //If the mediaSource is loaded then we seek to the proper bit
                this._mediaSources.get(mediaSourceID).seek(currentTime);
            }

        }

        this._currentTime = currentTime;
        let seekEvent = new CustomEvent('seek', {detail:{data:currentTime, instance:this}});
        this._canvas.dispatchEvent(seekEvent);
    }
    
    /**
    * Get how far through the playlist has been played.
    *
    * Getting this value will give the current playhead position. Can be used for updating timelines.
    * @return {number} The time in seconds through the current playlist.
    * 
    * @example
    * 
    * var playlist = {
    *   tracks:[
    *       [{type:"video", start:0, duration:4, src:"video1.mp4", id:"video1"},{type:"video", start:4, duration:4, src:"video2.mp4", id:"video2"}]
    *   ]
    * }
    * var canvas = document.getElementById('canvas');
    * var videoCompositor = new VideoCompositor(canvas);
    * videoCompositor.playlist = playlist;
    * var time = videoCompositor.currentTime;
    * //time === 0
    */
    get currentTime(){
        return this._currentTime;
    }
    
    /**
    * Set the playlist object to be played.
    *
    * Playlist objects describe a sequence of media sources to be played along with effects to be applied to them. They can be modified as they are being played to create dynamic or user customizable content.
    * 
    * At the top level playlist consist of tracks and effects. A track is an array of MediaSourceReferences. MediaSourceReference are an object which describe a piece of media to be played, the three fundamental MediaSourceRefernce types are "video", "image", and "canvas". Internally MediaSoureReferences are used to create MediaSources which are object that contain the underlying HTML element as well as handling loading and rendering of that element ot the output canvas.
    *
    * The order in which simultaneous individual tracks get rendered is determined by there index in the overall tracks list. A track at index 0 will be rendered after a track at index 1.
    *
    * Effects are objects consisting of GLSL vertex and fragment shaders, and a list of MediaSource ID's for them to be applied to.
    * Effects get applied independently to any MediaSources in their input list.
    *
    * @param {Object} playlist - The playlist object to be played.
    * 
    * @example <caption>A simple playlist with a single track of a single 4 second video</caption>
    * 
    * var playlist = {
    *   tracks:[
    *       [{type:"video", start:0, duration:4, src:"video.mp4", id:"video"}]
    *   ]
    * }
    * var canvas = document.getElementById("canvas");
    * var videoCompositor = new VideoCompositor(canvas);
    * videoCompositor.playlist = playlist;
    * videoCompositor.play();
    *
    * @example <caption>Playing the first 4 seconds of two videos, one after the other</caption>
    * 
    * var playlist = {
    *   tracks:[
    *       [{type:"video", start:0, duration:4, src:"video.mp4", id:"video"}, {type:"video", start:4, duration:4, src:"video1.mp4", id:"video1"}]
    *   ]
    * }
    *
    * @example <caption>Playing a 4 second segment from within a video (not the use of sourceStart)</caption>
    * 
    * var playlist = {
    *   tracks:[
    *       [{type:"video", start:0, sourceStart:10, duration:4, src:"video.mp4", id:"video"}]
    *   ]
    * }
    * 
    * @example <caption>A playlist with a 4 second video with a greenscreen effect applied rendered over a background image</caption>
    * 
    * var playlist = {
    *   tracks:[
    *       [{type:"video", start:0, duration:10, src:"video.mp4", id:"gs-video"}],
    *       [{type:"image", start:0, duration:10, src:"background.png", id:"background"}]
    *   ]
    *   effects:{
    *       "green-screen":{                                  //A unique ID for this effect.
    *           "inputs":["gs-video"],                        //The id of the video to apply the effect to.
    *           "effect": VideoCompositor.Effects.GREENSCREEN //Use the built-in greenscreen effect shader.
    *       }
    *   }
    * }
    *
    * @example <caption>A pseudo 2 second cross-fade between two videos.</caption>
    * 
    * var playlist = {
    *   tracks:[
    *       [{type:"video", start:0, duration:10, src:"video1.mp4", id:"video1"}],
    *       [                                                  {type:"video", start:8, duration:10, src:"video2.mp4", id:"video2"}]
    *   ]
    *   effects:{
    *       "fade-out":{                                      //A unique ID for this effect.
    *           "inputs":["video1"],                          //The id of the video to apply the effect to.
    *           "effect": VideoCompositor.Effects.FADEOUT2SEC //Use the built-in fade-out effect shader.
    *       },
    *       "fade-in":{                                      //A unique ID for this effect.
    *           "inputs":["video2"],                          //The id of the video to apply the effect to.
    *           "effect": VideoCompositor.Effects.FADEIN2SEC //Use the built-in fade-in effect shader.
    *       }
    *   }
    * }
    */
    set playlist(playlist){
        VideoCompositor.validatePlaylist(playlist);
        this.duration = VideoCompositor.calculatePlaylistDuration(playlist);
        this._playlist = playlist;
        //clean-up any currently playing mediaSources
        this._mediaSources.forEach(function(mediaSource){
            mediaSource.destroy();
        });
        this._mediaSources.clear();
        this.currentTime = this._currentTime;
    }

    /**
    * Get the playlist object.
    * @return {Object} The playlist object
    */
    get playlist(){
        return this._playlist;
    }

    /**
    * Play the playlist. If a pause() has been called previously playback will resume from that point.
    * @example
    * 
    * var playlist = {
    *   tracks:[
    *       [{type:"video", start:0, duration:4, src:"video1.mp4", id:"video1"},{type:"video", start:4, duration:4, src:"video2.mp4", id:"video2"}]
    *   ]
    * }
    * var canvas = document.getElementById('canvas');
    * var videoCompositor = new VideoCompositor(canvas);
    * videoCompositor.playlist = playlist;
    * videoCompositor.play();
    */
    play(){
        this._playing = true;
        this._ctx.clearColor(0.0, 0.0, 0.0, 1.0);
        this._ctx.clear(this._ctx.COLOR_BUFFER_BIT | this._ctx.DEPTH_BUFFER_BIT);
        let playEvent = new CustomEvent('play', {detail:{data:this._currentTime, instance:this}});
        this._canvas.dispatchEvent(playEvent);
    }

    /**
    * Pause playback of the playlist. Call play() to resume playing.
    * @example
    * 
    * var playlist = {
    *   tracks:[
    *       [{type:"video", start:0, duration:4, src:"video1.mp4", id:"video1"},{type:"video", start:4, duration:4, src:"video2.mp4", id:"video2"}]
    *   ]
    * }
    * var canvas = document.getElementById('canvas');
    * var videoCompositor = new VideoCompositor(canvas);
    * videoCompositor.playlist = playlist;
    * videoCompositor.play();
    * 
    * setTimeout(videoCompositor.pause, 3000); //pause after 3 seconds
    *
    */
    pause() {
        this._playing = false;
        this._mediaSources.forEach(function(mediaSource){
            mediaSource.pause();
        });
        let pauseEvent = new CustomEvent('pause', {detail:{data:this._currentTime, instance:this}});
        this._canvas.dispatchEvent(pauseEvent);
    }

    /**
    * This adds event listeners to the video compositor. Events directed at the underlying canvas are transparently 
    * passed through, While events that target a video like element are handled within the VideoCompositor. Currently 
    * the VideoCompositor only handles a limited number of video like events ("play", "pause", "ended").
    * 
    * @param {String} type - The type of event to listen to.
    * @param {Function} func - The Function to be called for the given event.
    * @example
    * 
    * var playlist = {
    *   tracks:[
    *       [{type:"video", start:0, duration:4, src:"video1.mp4", id:"video1"},{type:"video", start:4, duration:4, src:"video2.mp4", id:"video2"}]
    *   ]
    * }
    * var canvas = document.getElementById('canvas');
    * var videoCompositor = new VideoCompositor(canvas);
    * videoCompositor.playlist = playlist;
    * 
    * videoCompositor.addEventListener("play", function(){console.log("Started playing")});
    * videoCompositor.addEventListener("pause", function(){console.log("Paused")});
    * videoCompositor.addEventListener("ended", function(){console.log("Finished playing")});
    * 
    * videoCompositor.play();
    * 
    *
    */
    addEventListener(type, func){
        //Pass through any event listeners through to the underlying canvas rendering element
        //Catch any events and handle with a custom events dispatcher so things 
        if (this._eventMappings.has(type)){
            this._eventMappings.get(type).push(func);
        }else {
            this._eventMappings.set(type, [func]);
        }
        this._canvas.addEventListener(type, this._dispatchEvents, false);
    }


    /**
    * This removes event listeners from the video compositor that were added using addEventListener. 
    * 
    * @param {String} type - The type of event to remove.
    * @param {Function} func - The Function to be removed for the given event.
    * @example
    * 
    * var playlist = {
    *   tracks:[
    *       [{type:"video", start:0, duration:4, src:"video1.mp4", id:"video1"},{type:"video", start:4, duration:4, src:"video2.mp4", id:"video2"}]
    *   ]
    * }
    * var canvas = document.getElementById('canvas');
    * var videoCompositor = new VideoCompositor(canvas);
    * videoCompositor.playlist = playlist;
    * 
    * var playingCallback = function(){console.log("playing");};
    * videoCompositor.addEventListener("play", playingCallback);
    * 
    * videoCompositor.play();
    * 
    * videoCompositor.removeEventListener("play", playingCallback);
    *
    */
    removeEventListener(type, func){
        if (this._eventMappings.has(type)){
            let listenerArray = this._eventMappings.get(type);
            let listenerIndex = listenerArray.indexOf(func);
            if (listenerIndex !== -1){
                listenerArray.splice(listenerIndex, 1);
                return true;
            }
        }
        return false;
    }


    /**
    * This method allows you to create a listeners for events on a specific MediaSource.
    *
    * To use this you must pass an object which has one or more the following function properties: play, pause, seek, 
    * isReady, load, destroy, render.
    *
    * These functions get called when the correspoinding action on the MediaSource happen. In the case of the render 
    * listener it will be called every time a frame is drawn so the function should aim to return as quickly as possible 
    * to avoid hanging the render loop.
    * 
    * The use-case for this is synchronising external actions to a specfic media source, such as subtitle rendering or 
    * animations on a canvasMediaSource.
    * 
    * The listeners get passed a reference to the internal MediaSource object and somtimes extra data relevant to that 
    * sepcific actions function ("seek" gets the time seeking too, "render" gets the shaders rendering parameters).
    *
    * @param {String} mediaSourceID - The id of the MediaSource to listen to.
    * @param {Object} mediaSourceListener - An Object implementing listener functions.
    * @example
    * 
    * var playlist = {
    *   tracks:[
    *       [{type:"video", start:0, duration:4, src:"video1.mp4", id:"video1"}]
    *   ]
    * }
    * var canvas = document.getElementById('canvas');
    * var videoCompositor = new VideoCompositor(canvas);
    * videoCompositor.playlist = playlist;
    * 
    * var videoListener = {
    *     render: function(mediaSource, renderParameters){
    *         //This will get called every frame.
    *         var time = renderParameters.progress * mediaSource.duration;
    *         console.log('Progress through ID', mediaSource.id, ':', time);
    *     },
    *     seek:function(mediaSource, seekTime){
    *         //This function will get called on seek
    *         console.log("Seeking ID", mediaSource.id, "to :", seekTime);
    *     },
    *     play:function(mediaSource){
    *         //This function will get called on play
    *         console.log("Plating ID", mediaSource.id);
    *     },
    * }
    *
    * videoCompositor.registerMediaSourceListener("video1", videoListener);
    * videoCompositor.play();
    *
    */
    registerMediaSourceListener(mediaSourceID, mediaSourceListener){
        if (this._mediaSourceListeners.has(mediaSourceID)){
            this._mediaSourceListeners.get(mediaSourceID).push(mediaSourceListener);
        }else{
            this._mediaSourceListeners.set(mediaSourceID, [mediaSourceListener]);
        }
    }
    /**
    * This method allows you to remove a listener from a specific MediaSource.
    *
    * To use this you must pass in an object which has already been registered using registerMediaSourceListener,
    * @param {String} mediaSourceID - The id of the MediaSource to remove the listener from.
    * @param {Object} mediaSourceListener - An Object that has been previously passed in via registerMediaSourceListener. 
    */
    unregisterMediaSourceListener(mediaSourceID, mediaSourceListener){
        if (!this._mediaSourceListeners.has(mediaSourceID)){
            return false;
        }else{
            let listenerArray = this._mediaSourceListeners.get(mediaSourceID);

            let index = listenerArray.indexOf(mediaSourceListener);
            if (index > -1){
                listenerArray.splice(index, 1);
            }

            if (this._mediaSources.has(mediaSourceID)){
                let mediaSourceListnerArray = this._mediaSources.get(mediaSourceID).mediaSourceListeners;
                index = mediaSourceListnerArray.indexOf(mediaSourceListener);
                if (index > -1){
                    mediaSourceListnerArray.splice(index, 1);
                }
            }
            return true;
        }
    }

    /**
    * Returns the audio context that was either passed into the constructor or created internally.
    * @example <caption>Getting an audio context that was passed in</caption>
    * var audioCtx = new AudioContext();
    * var videoCompositor = new VideoCompositor(canvas, audioCtx);
    * 
    * var returnedAudioContext = videoCompositor.getAudioContext();
    *
    * //returnedAudioContext and audiotCtx are the same object.
    * 
    * @example <caption>Getting an AudioContext created internally</caption>
    * var videoCompositor = new VideoCompositor(canvas); //Don't pass in an audio context
    *
    * var audioCtx = videoCompositor.getAudioContext();
    * //audioCtx was created inside the VideoCompositor constructor
    *
    * @return {AudioContext} The audio context used to create any nodes required by calls to getAudioNodeForTrack
    */
    getAudioContext(){
        return this._audioManger.getAudioContext();
    }
    
    /**
    * Starts the underlying video/image elements pre-loading. Behavior is not guaranteed and depends on how the browser treats video pre-loading under the hood.
    * @example <caption>Start a playlist pre-loading so it starts playing quicker</caption>
    * var videoCompositor = new VideoCompositor(canvas);
    * videoCompositor.playlist = {
    *   tracks:[
    *       [{type:"video", start:0, duration:4, src:"video1.mp4", id:"video1"}]
    *   ]
    * }
    * videoCompositor.preload();
    * //now when play is called is should start quicker.
    */
    preload(){
        this._playing = true;
        this._update(0.0);
        this._playing = false;
    }

    /**
    * Gets an audio bus for the given playlist track.
    *
    * In some instances you may want to feed the audio output of the media sources from a given track into a web audio API context. This function provides a mechanism for acquiring an audio GainNode which represents a "bus" of a given track.
    *
    * Note: In order for the media sources on a track to play correctly once you have an AudioNode for the track you must connect the Audio Node to the audio contexts destination (even if you want to mute them you must set the gain to 0 then connect them to the output).
    * @example <caption>Muting all videos on a single track</caption>
    * 
    * var playlist = {
    *   tracks:[
    *       [{type:"video", start:0, duration:4, src:"video1.mp4", id:"video1"},{type:"video", start:4, duration:4, src:"video2.mp4", id:"video2"}]
    *   ]
    * }
    * 
    * var audioCtx = new AudioContext();
    * var canvas = document.getElementById("canvas");
    * var videoCompositor = new VideoCompositor(canvas, audioCtx);
    * videoCompositor.playlist = playlist;
    * var trackGainNode = videoCompositor.getAudioNodeForTrack(playlist.tracks[0]);
    * trackGainNode.gain.value = 0.0; // Mute the track
    * 
    * @param {Array} track - this is track which consist of an array object of MediaSourceReferences (typically a track from a playlist object).
    * @return {GainNode} this is a web audio GainNode which has the output of any audio producing media sources from the passed track played out of it.
    */
    getAudioNodeForTrack(track){
        let audioNode = this._audioManger.createAudioNodeFromTrack(track);
        return audioNode;
    }

    _dispatchEvents(evt){
        //Catch events and pass them on, mangling the detail property so it looks nice in the API
        for (let i = 0; i < evt.detail.instance._eventMappings.get(evt.type).length; i++){
            evt.detail.instance._eventMappings.get(evt.type)[i](evt.detail.data);
        }
    }

    _getPlaylistPlayingStatusAtTime(playlist, playhead){
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
                if(playhead <= segment.start){
                    toPlay.push(segment);
                    continue;
                }
            }
        }

        return [toPlay, currentlyPlaying, finishedPlaying];
    }

    _sortMediaSourcesByStartTime(mediaSources){
        mediaSources.sort(function(a,b){
            return a.start - b.start;
        });
        return mediaSources;
    }

    _loadMediaSource(mediaSourceReference, onReadyCallback){
        if (onReadyCallback === undefined) onReadyCallback = function(){};
        let mediaSourceListeners = [];
        if (this._mediaSourceListeners.has(mediaSourceReference.id)){
            mediaSourceListeners = this._mediaSourceListeners.get(mediaSourceReference.id);
        }


        let MediaSourceClass = mediaSourceMapping.get(mediaSourceReference.type);
        if (MediaSourceClass === undefined){
            throw {"error":5,"msg":"mediaSourceReference "+mediaSourceReference.id+" has unrecognized type "+mediaSourceReference.type, toString:function(){return this.msg;}};
        }
        let mediaSource = new MediaSourceClass(mediaSourceReference, this._ctx);
        mediaSource.onready = onReadyCallback;
        mediaSource.mediaSourceListeners = mediaSourceListeners;
        mediaSource.load();
        this._mediaSources.set(mediaSourceReference.id, mediaSource);
    }

    _calculateMediaSourcesOverlap(mediaSources){
        let maxStart = 0.0;
        let minEnd;
        //calculate max start time
        for (var i = 0; i < mediaSources.length; i++) {
            let mediaSource = mediaSources[i];
            if (mediaSource.start  > maxStart){
                maxStart = mediaSource.start;
            }
            let end = (mediaSource.start + mediaSource.duration);
            if (minEnd === undefined || end < minEnd){
                minEnd = end;
            }
        }
        return [maxStart, minEnd];
    }


    _calculateActiveTransitions(currentlyPlaying, currentTime){
        if (this._playlist === undefined || this._playing === false) return [];
        if (this._playlist.transitions === undefined ) return [];
        
        //Get the currently playing ID's
        let currentlyPlayingIDs = [];
        for (let i = 0; i < currentlyPlaying.length; i++) {
            currentlyPlayingIDs.push(currentlyPlaying[i].id);
        }

        let activeTransitions = [];

        //Get the transitions whose video sources are currently playing


        let transitionKeys = Object.keys(this._playlist.transitions);
        for (let i = 0; i < transitionKeys.length; i++){
            let transitionID = transitionKeys[i];

            let transition = this._playlist.transitions[transitionID];
            let areInputsCurrentlyPlaying = true;
            for (let j = 0; j < transition.inputs.length; j++) {
                let id = transition.inputs[j];
                if (currentlyPlayingIDs.indexOf(id) === -1){
                    areInputsCurrentlyPlaying = false;
                    break;
                }
            }
            if (areInputsCurrentlyPlaying){
                let activeTransition = {transition:transition, transitionID:transitionID, mediaSources:[]};
                
                for(let j = 0; j < transition.inputs.length; j++){
                    activeTransition.mediaSources.push(this._mediaSources.get(transition.inputs[j]));
                }

                activeTransitions.push(activeTransition);
            }
        }

        //Calculate the progress through the transition
        for (let i = 0; i < activeTransitions.length; i++) {
            let mediaSources = activeTransitions[i].mediaSources;
            let [overlapStart, overlapEnd] = this._calculateMediaSourcesOverlap(mediaSources);
            let progress = ((currentTime - overlapStart)) / (overlapEnd - overlapStart);
            activeTransitions[i].progress = progress;
        }

        return activeTransitions;
    }


    _update(dt){
        if (this._playlist === undefined || this._playing === false) return;

        let [toPlay, currentlyPlaying, finishedPlaying] = this._getPlaylistPlayingStatusAtTime(this._playlist, this._currentTime);
        toPlay = this._sortMediaSourcesByStartTime(toPlay);

        //Check if we've finished playing and then stop
        if (toPlay.length === 0 && currentlyPlaying.length === 0){
            this.pause();
            let endedEvent = new CustomEvent('ended', {detail:{data:this.currentTime, instance:this}});
            this.currentTime = 0;
            this._canvas.dispatchEvent(endedEvent);
            return;
        }


        // //Preload mediaSources
        // for (let i = 0; i < this._mediaSourcePreloadNumber; i++) {
        //     if (i === toPlay.length) break;
        //     if (this._mediaSources.has(toPlay[i].id) === false){
        //         this._loadMediaSource(toPlay[i]);
        //     }
        // }

        for (let i = 0; i < toPlay.length; i++) {
            //if (i === toPlay.length) break;
            if (!this._mediaSources.has(toPlay[i].id)){
                if (toPlay[i].start < this._currentTime + this._mediaSourcePreloadLookaheadTime){
                    this._loadMediaSource(toPlay[i]);
                }
            }
        }

        //Clean-up any mediaSources which have already been played
        for (let i = 0; i < finishedPlaying.length; i++) {
            let mediaSourceReference = finishedPlaying[i];
            if (this._mediaSources.has(mediaSourceReference.id)){
                let mediaSource = this._mediaSources.get(mediaSourceReference.id);
                if (mediaSource.start + mediaSource.duration < this._currentTime - this._mediaSourcePostPlayLifetime){
                    mediaSource.destroy();
                    this._mediaSources.delete(mediaSourceReference.id);
                }
            }
        }

        //Make sure all mediaSources are ready to play
        let ready = true;
        for (let i = 0; i < currentlyPlaying.length; i++) {
            let mediaSourceID = currentlyPlaying[i].id;
            //check that currently playing mediaSource exists
            if (!this._mediaSources.has(mediaSourceID)){
                //if not load it
                this._loadMediaSource(currentlyPlaying[i]);
                ready = false;
                continue;
            }
            if (!this._mediaSources.get(mediaSourceID).isReady()) ready=false;
        }
        //if all the sources aren't ready, exit function before rendering or advancing clock.
        if (ready === false){
            return;
        }


        //Update the effects
        this._effectManager.updateEffects(this._playlist.effects);

        //Update the audio
        this._audioManger.update(this._mediaSources, currentlyPlaying);

        //Play mediaSources on the currently playing queue.
        currentlyPlaying.reverse(); //reverse the currently playing queue so track 0 renders last


        //let activeTransitions = this._calculateActiveTransitions(currentlyPlaying, this._currentTime);
        this._ctx.viewport(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
        this._ctx.clear(this._ctx.COLOR_BUFFER_BIT | this._ctx.DEPTH_BUFFER_BIT);

        for (let i = 0; i < currentlyPlaying.length; i++) {
            let mediaSourceID = currentlyPlaying[i].id;
            let mediaSource = this._mediaSources.get(mediaSourceID);
            //We must update the MediaSource object with any changes made to the MediaSourceReference
            //Currently the only parameters we update are start,duration

            mediaSource.play();
            let progress = ((this._currentTime - currentlyPlaying[i].start)) / (currentlyPlaying[i].duration);
            //get the base render parameters
            let renderParameters = {"playback_rate": this._playbackRate ,"progress":progress, "duration":mediaSource.duration, "source_resolution":[mediaSource.width,mediaSource.height], "output_resolution":[this._canvas.width, this._canvas.height]};
            //find the effect associated with the current mediasource
            let effect = this._effectManager.getEffectForInputId(mediaSourceID);
            //merge the base parameters with any custom ones
            for (let key in effect.parameters) {
                renderParameters[key] = effect.parameters[key];
            }

            mediaSource.render(effect.program, renderParameters, effect.textures);

        }
        this._currentTime += dt * this._playbackRate;
    }

    /**
    * Calculate the duration of the passed playlist track.
    *
    * Will return the time that the last media source in the track stops playing.
    * @param {Array} track - this is track which consists of an array object of MediaSourceReferences (typically a track from a playlist object).
    * @return {number} The duration in seconds of the given track.
    * @example
    * var playlist = {
    *   tracks:[
    *       [{type:"video", start:0, duration:4, src:"video1.mp4", id:"video1"},{type:"video", start:4, duration:4, src:"video2.mp4", id:"video2"}],
    *       [{type:"video", start:6, duration:4, src:"video3.mp4", id:"video3"}]
    *   ]
    * }
    * var track0Duration = VideoCompositor.calculateTrackDuration(playlist.tracks[0]);
    * var track1Duration = VideoCompositor.calculateTrackDuration(playlist.tracks[1]);
    * //track0Duration === 8
    * //track1Duration === 10
    *
    * @todo Beacuse media source reference are stored in order this could implemented be far quicker.
    */
    static calculateTrackDuration(track){
        let maxPlayheadPosition = 0;
        for (let j = 0; j < track.length; j++) {
            let playheadPosition = track[j].start + track[j].duration;
            if (playheadPosition > maxPlayheadPosition){
                maxPlayheadPosition = playheadPosition;
            }
        }
        return maxPlayheadPosition;
    }
    
    /**
    * Calculate the duration of the passed playlist.
    *
    * Will return the time that the last media source in the longest track stops playing.
    * @param {Object} playlist - This is a playlist object.
    * @return {number} The duration in seconds of the given playlist.
    * @example
    * var playlist = {
    *   tracks:[
    *       [{type:"video", start:0, duration:4, src:"video1.mp4", id:"video1"},{type:"video", start:4, duration:4, src:"video2.mp4", id:"video2"}],
    *       [{type:"video", start:6, duration:4, src:"video3.mp4", id:"video3"}]
    *   ]
    * }
    * var playilstDuration = VideoCompositor.calculateTrackDuration(playlist);
    * //playlistDuration === 10
    *
    */
    static calculatePlaylistDuration(playlist){
        let maxTrackDuration = 0;

        for(let i = 0; i < playlist.tracks.length; i++){
            let track = playlist.tracks[i];
            let trackDuration = VideoCompositor.calculateTrackDuration(track);
            if (trackDuration > maxTrackDuration){
                maxTrackDuration = trackDuration;
            }
        }

        return maxTrackDuration;
    }


    /**
    * Validate that the playlist is correct and playable.
    *
    * This static function will analyze a playlist and check for common errors. on encountering an error it will throw an exception. The errors it currently checks for are:
    *
    * Error 1. MediaSourceReferences have a unique ID        
    *
    * Error 2. The playlist media sources have all the expected properties.
    *
    * Error 3. MediaSourceReferences in single track are sequential.
    *
    * Error 4. MediaSourceReferences in single track don't overlap
    *
    * @param {Object} playlist - This is a playlist object.
    *
    * @example
    * var playlist = {
    *   tracks:[
    *       [{type:"video", start:0, duration:4, src:"video1.mp4", id:"video1"},{type:"video", start:2, duration:4, src:"video2.mp4", id:"video2"}],
    *   ]
    * }
    * var playilstDuration = VideoCompositor.validatePlaylist(playlist);
    * //Will throw error 4 becuase mediaSourceReference video1 and video2 overlap by 2 seconds.
    *
    * @todo Better coverage of possible errors in a playlist.
    */
    static validatePlaylist(playlist){
        /*     
        This function validates a passed playlist, making sure it matches a 
        number of properties a playlist must have to be OK.

        * Error 1. MediaSourceReferences have a unique ID        
        * Error 2. The playlist media sources have all the expected properties.
        * Error 3. MediaSourceReferences in single track are sequential.
        * Error 4. MediaSourceReferences in single track don't overlap
        */

        //Error 1. MediaSourceReferences have a unique ID
        let IDs = new Map();
        for (let i = 0; i < playlist.tracks.length; i++) {
            let track = playlist.tracks[i];
            for (let j = 0; j < track.length; j++) {
                let MediaSourceReference = track[j];
                if (IDs.has(MediaSourceReference.id)){
                    throw {"error":1,"msg":"MediaSourceReference "+MediaSourceReference.id+" in track " +i+" has a duplicate ID.", toString:function(){return this.msg;}};
                }else{
                    IDs.set(MediaSourceReference.id, true);
                }
            }
        }


        //Error 2. The playlist MediaSourceReferences have all the expected properties.
        for (let i = 0; i < playlist.tracks.length; i++) {
            let track = playlist.tracks[i];
            for (let j = 0; j < track.length; j++) {
                let MediaSourceReference = track[j];
                if (MediaSourceReference.id === undefined) throw {"error":2,"msg":"MediaSourceReference "+MediaSourceReference.id+" in track " +i+" is missing a id property", toString:function(){return this.msg;}};
                if (MediaSourceReference.start === undefined) throw {"error":2,"msg":"MediaSourceReference "+MediaSourceReference.id+" in track " +i+" is missing a start property", toString:function(){return this.msg;}};
                if (MediaSourceReference.duration === undefined) throw {"error":2,"msg":"MediaSourceReference "+MediaSourceReference.id+" in track " +i+" is missing a duration property", toString:function(){return this.msg;}};
                if (MediaSourceReference.type === undefined) throw {"error":2,"msg":"MediaSourceReference "+MediaSourceReference.id+" in track " +i+" is missing a type property", toString:function(){return this.msg;}};
                if (MediaSourceReference.src !== undefined && MediaSourceReference.element !== undefined)throw {"error":2,"msg":"MediaSourceReference "+MediaSourceReference.id+" in track " +i+" has both a src and element, it must have one or the other", toString:function(){return this.msg;}};
                if (MediaSourceReference.src === undefined && MediaSourceReference.element === undefined)throw {"error":2,"msg":"MediaSourceReference "+MediaSourceReference.id+" in track " +i+" has neither a src or an element, it must have one or the other", toString:function(){return this.msg;}};                
            }
        }


        // Error 3. MediaSourceReferences in single track are sequential.
        for (let i = 0; i < playlist.tracks.length; i++) {
            let track = playlist.tracks[i];
            let time = 0;
            for (let j = 0; j < track.length; j++) {
                let MediaSourceReference = track[j];
                if (MediaSourceReference.start < time){
                    throw {"error":3,"msg":"MediaSourceReferences "+MediaSourceReference.id+" in track " +i+" starts before previous MediaSourceReference", toString:function(){return this.msg;}};
                }
                time = MediaSourceReference.start;
            }
        }        


        //Error 4. MediaSourceReferences in single track don't overlap
        for (let i = 0; i < playlist.tracks.length; i++) {
            let track = playlist.tracks[i];
            let previousMediaSourceReference;
            for (let j = 0; j < track.length; j++) {
                let MediaSourceReference = track[j];
                if (previousMediaSourceReference === undefined){
                    previousMediaSourceReference = MediaSourceReference;
                    continue;
                }
                let previousEnd = previousMediaSourceReference.start + previousMediaSourceReference.duration;
                let currentStart = MediaSourceReference.start;
                if (previousEnd > currentStart){
                    throw {"error":4,"msg":"Track MediaSourceReferences overlap. MediaSourceReference "+previousMediaSourceReference.id+" in track " +i+" finishes after MediaSourceReference " + MediaSourceReference.id +" starts.", toString:function(){return this.msg;}};
                }
            }
        }
    }


    /**
    * Render a graphical representation of a playlist to a canvas.
    *
    * This function is useful for rendering a graphical display of a playlist to check MediaSourceReferences are aligned on tracks as you'd expect. It can also be called in an update loop with the currentTime of a VideoCompositor instance passed in to create a live timeline viewer.
    *
    *
    * @param {Object} playlist - This is a playlist object.
    * @param {Canvas} canvas - This is the canvas to render to.
    * @param {number} currentTime - The time at wich to render a playhead.
    *
    * @example
    * var playlist = {
    *   tracks:[
    *       [{type:"video", start:0, duration:4, src:"video1.mp4", id:"video1"},{type:"video", start:2, duration:4, src:"video2.mp4", id:"video2"}],
    *   ]
    * }
    * var visualisationCanvas = document.getElementById("vis-canvas");
    * VideoCompositor.renderPlaylist(playlist, visualisationCanvas, 0);
    *
    */
    static renderPlaylist(playlist, canvas, currentTime){
        let ctx = canvas.getContext('2d');
        let w = canvas.width;
        let h = canvas.height;
        let trackHeight = h / playlist.tracks.length;
        let playlistDuration = VideoCompositor.calculatePlaylistDuration(playlist);
        let pixelsPerSecond = w / playlistDuration;
        let mediaSourceStyle = {
            "video":["#572A72", "#3C1255"],
            "image":["#7D9F35", "#577714"],
            "canvas":["#AA9639", "#806D15"]
        };


        ctx.clearRect(0,0,w,h);
        ctx.fillStyle = "#999";
        for (let i = 0; i < playlist.tracks.length; i++) {
            let track = playlist.tracks[i];
            for (let j = 0; j < track.length; j++) {
                let mediaSource = track[j];
                let msW = mediaSource.duration * pixelsPerSecond;
                let msH = trackHeight;
                let msX = mediaSource.start * pixelsPerSecond;
                let msY = trackHeight * i;
                ctx.fillStyle = mediaSourceStyle[mediaSource.type][j%mediaSourceStyle[mediaSource.type].length];
                ctx.fillRect(msX,msY,msW,msH);
                ctx.fill();
            }
        }

        if (currentTime !== undefined){
            ctx.fillStyle = "#000";
            ctx.fillRect(currentTime*pixelsPerSecond, 0, 1, h);
        }
    }

    static get VertexShaders() {
        return {
            DEFAULT: "\
                uniform float progress;\
                uniform float duration;\
                uniform vec2 source_resolution;\
                uniform vec2 output_resolution;\
                attribute vec2 a_position;\
                attribute vec2 a_texCoord;\
                varying vec2 v_texCoord;\
                varying float v_progress;\
                varying float v_duration;\
                varying vec2 v_source_resolution;\
                varying vec2 v_output_resolution;\
                void main() {\
                    v_progress = progress;\
                    v_duration = duration;\
                    v_source_resolution = source_resolution;\
                    v_output_resolution = output_resolution;\
                    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                    v_texCoord = a_texCoord;\
                }",
            OFFSETSCALEINOUT: "\
                uniform float progress;\
                uniform float duration;\
                uniform vec2 source_resolution;\
                uniform vec2 output_resolution;\
                uniform float inTime;\
                uniform float outTime;\
                uniform float scaleX;\
                uniform float scaleY;\
                uniform float offsetX;\
                uniform float offsetY;\
                attribute vec2 a_position;\
                attribute vec2 a_texCoord;\
                varying vec2 v_texCoord;\
                varying float v_progress;\
                varying float v_duration;\
                varying float v_inTime;\
                varying float v_outTime;\
                varying vec2 v_source_resolution;\
                varying vec2 v_output_resolution;\
                void main() {\
                    v_progress = progress;\
                    v_duration = duration;\
                    v_inTime = inTime;\
                    v_outTime = outTime;\
                    v_source_resolution = source_resolution;\
                    v_output_resolution = output_resolution;\
                    gl_Position = vec4(vec2(2.0*scaleX,2.0*scaleY)*a_position-vec2(1.0+offsetX, 1.0+offsetY), 0.0, 1.0);\
                    v_texCoord = a_texCoord;\
                }",
            INOUT: "\
                uniform float progress;\
                uniform float duration;\
                uniform vec2 source_resolution;\
                uniform vec2 output_resolution;\
                uniform float inTime;\
                uniform float outTime;\
                attribute vec2 a_position;\
                attribute vec2 a_texCoord;\
                varying vec2 v_texCoord;\
                varying float v_progress;\
                varying float v_duration;\
                varying float v_inTime;\
                varying float v_outTime;\
                varying vec2 v_source_resolution;\
                varying vec2 v_output_resolution;\
                void main() {\
                    v_progress = progress;\
                    v_duration = duration;\
                    v_inTime = inTime;\
                    v_outTime = outTime;\
                    v_source_resolution = source_resolution;\
                    v_output_resolution = output_resolution;\
                    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                    v_texCoord = a_texCoord;\
                }",
            OFFSETSCALE:"\
                uniform float progress;\
                uniform float duration;\
                uniform vec2 source_resolution;\
                uniform vec2 output_resolution;\
                uniform float scaleX;\
                uniform float scaleY;\
                uniform float offsetX;\
                uniform float offsetY;\
                attribute vec2 a_position;\
                attribute vec2 a_texCoord;\
                varying vec2 v_texCoord;\
                varying float v_progress;\
                varying float v_duration;\
                varying vec2 v_source_resolution;\
                varying vec2 v_output_resolution;\
                void main() {\
                    v_progress = progress;\
                    v_duration = duration;\
                    v_source_resolution = source_resolution;\
                    v_output_resolution = output_resolution;\
                    gl_Position = vec4(vec2(2.0*scaleX,2.0*scaleY)*a_position-vec2(1.0+offsetX, 1.0+offsetY), 0.0, 1.0);\
                    v_texCoord = a_texCoord;\
                }"
        }
    }
    static get FragmentShaders(){
        return {
            DEFAULT:"\
                    precision mediump float;\
                    uniform sampler2D u_image;\
                    varying vec2 v_texCoord;\
                    varying float v_progress;\
                    varying float v_duration;\
                    varying vec2 v_source_resolution;\
                    varying vec2 v_output_resolution;\
                    void main(){\
                        gl_FragColor = texture2D(u_image, v_texCoord);\
                    }",
            PRESERVEASPECTRATIO:"\
                    precision mediump float;\
                    uniform sampler2D u_image;\
                    varying vec2 v_texCoord;\
                    varying float v_progress;\
                    varying float v_duration;\
                    varying vec2 v_source_resolution;\
                    varying vec2 v_output_resolution;\
                    void main(){\
                        float scale = 1.0;\
                        float source_aspect_ratio = v_source_resolution[0]/v_source_resolution[1];\
                        float output_aspect_ratio = v_output_resolution[0]/v_output_resolution[1];\
                        if(output_aspect_ratio > source_aspect_ratio){\
                            scale = v_output_resolution[1]/v_source_resolution[1];\
                        } else {\
                            scale = v_output_resolution[0]/v_source_resolution[0];\
                        };\
                        vec2 source_resolution = v_source_resolution * scale;\
                        vec2 oCord = vec2(v_texCoord[0] * v_output_resolution[0], v_texCoord[1] * v_output_resolution[1]);\
                        vec2 sCord = vec2(oCord[0] - (v_output_resolution[0]/2.0 - source_resolution[0]/2.0), oCord[1] - (v_output_resolution[1]/2.0 - source_resolution[1]/2.0));\
                        if (sCord[0] < 0.0 || sCord[0] > source_resolution[0]||sCord[1] < 0.0 || sCord[1] > source_resolution[1]){\
                            gl_FragColor = vec4(0.0,0.0,0.0,0.0);\
                        }else{\
                            gl_FragColor = texture2D(u_image, (sCord/source_resolution));\
                        }\
                    }",
            PRESERVEASPECTRATIOFILL:"\
                    precision mediump float;\
                    uniform sampler2D u_image;\
                    varying vec2 v_texCoord;\
                    varying float v_progress;\
                    varying float v_duration;\
                    varying vec2 v_source_resolution;\
                    varying vec2 v_output_resolution;\
                    void main(){\
                        float scale = 1.0;\
                        float source_aspect_ratio = v_source_resolution[0]/v_source_resolution[1];\
                        float output_aspect_ratio = v_output_resolution[0]/v_output_resolution[1];\
                        if(output_aspect_ratio > source_aspect_ratio){\
                            scale = v_output_resolution[1]/v_source_resolution[1];\
                        } else {\
                            scale = v_output_resolution[0]/v_source_resolution[0];\
                        };\
                        vec2 source_resolution = v_source_resolution * scale;\
                        vec2 oCord = vec2(v_texCoord[0] * v_output_resolution[0], v_texCoord[1] * v_output_resolution[1]);\
                        vec2 sCord = vec2(oCord[0] - (v_output_resolution[0]/2.0 - source_resolution[0]/2.0), oCord[1] - (v_output_resolution[1]/2.0 - source_resolution[1]/2.0));\
                        gl_FragColor = texture2D(u_image, (sCord/source_resolution));\
                    }",
            MONOCHROME: "\
                precision mediump float;\
                uniform sampler2D u_image;\
                varying vec2 v_texCoord;\
                varying float v_progress;\
                varying vec2 v_source_resolution;\
                varying vec2 v_output_resolution;\
                void main(){\
                    vec4 pixel = texture2D(u_image, v_texCoord);\
                    float avg = (pixel[0]*0.2125 + pixel[1]*0.7154 + pixel[2]*0.0721)/3.0;\
                    pixel = vec4(avg*1.5, avg*1.5, avg*1.5, pixel[3]);\
                    gl_FragColor = pixel;\
                }",
            SEPIA: "\
                precision mediump float;\
                uniform sampler2D u_image;\
                varying vec2 v_texCoord;\
                varying float v_progress;\
                varying vec2 v_source_resolution;\
                varying vec2 v_output_resolution;\
                void main(){\
                    vec4 pixel = texture2D(u_image, v_texCoord);\
                    float avg = (pixel[0]*0.2125 + pixel[1]*0.7154 + pixel[2]*0.0721)/3.0;\
                    pixel = vec4(avg*2.0, avg*1.6, avg, pixel[3]);\
                    gl_FragColor = pixel;\
                }",
            BITCRUNCH: "\
                precision mediump float;\
                uniform sampler2D u_image;\
                varying vec2 v_texCoord;\
                varying float v_progress;\
                varying vec2 v_source_resolution;\
                varying vec2 v_output_resolution;\
                void main(){\
                    vec4 pixel = texture2D(u_image, v_texCoord);\
                    pixel = floor(pixel*vec4(8.0,8.0,8.0,8.0));\
                    pixel = pixel/vec4(8.0,8.0,8.0,8.0);\
                    gl_FragColor = pixel*vec4(1.0,1.0,1.0,1.0);\
                }",
            "FADEINOUT": "\
                precision mediump float;\
                uniform sampler2D u_image;\
                varying vec2 v_texCoord;\
                varying float v_progress;\
                varying float v_duration;\
                varying float v_inTime;\
                varying float v_outTime;\
                varying vec2 v_source_resolution;\
                varying vec2 v_output_resolution;\
                void main(){\
                    float alpha = 1.0;\
                    if (v_progress * v_duration < v_inTime){\
                        alpha = (v_progress * v_duration)/(v_inTime+0.001);\
                    }\
                    if ((v_progress * v_duration) > (v_duration - v_outTime)){\
                        alpha = (v_outTime - ((v_progress * v_duration) - (v_duration - v_outTime)))/(v_outTime+0.001);\
                    }\
                    gl_FragColor = texture2D(u_image, v_texCoord) * vec4(1.0,1.0,1.0,alpha);\
                }",
            "LUTSQAURE64X64":"\
                    precision mediump float;\
                    uniform sampler2D u_image;\
                    uniform sampler2D lut;\
                    varying vec2 v_texCoord;\
                    varying float v_progress;\
                    varying float v_duration;\
                    varying vec2 v_source_resolution;\
                    varying vec2 v_output_resolution;\
                    void main(){\
                        vec4 original_color = texture2D(u_image, v_texCoord);\
                        original_color = clamp(original_color, vec4(0.01,0.01,0.01,0.01), vec4(0.99,0.99,0.99,0.99));\
                        vec2 red_offset = vec2(original_color[0]/8.0 ,0.0);\
                        vec2 green_offset = vec2(0.0,(1.0/8.0)-(original_color[1]/8.0));\
                        \
                        float b = floor((original_color[2] * 63.0) + 0.5);\
                        float b_x = mod(b, 8.0);\
                        float b_y = floor((b / 8.0) + 0.5);\
                        vec2 blue_offset = vec2(b_x/8.0, 1.0 - b_y/8.0);\
                        vec4 lut_color = texture2D(lut, (blue_offset + red_offset + green_offset));\
                        gl_FragColor = lut_color;\
                    }"
        }
    }


    static get Effects(){
        return {
            "OFFSETSCALE" :{
                "fragmentShader":VideoCompositor.FragmentShaders.DEFAULT,
                "vertexShader": VideoCompositor.VertexShaders.OFFSETSCALE,
                "defaultParameters":{
                    "scaleX":1.0,
                    "scaleY":1.0,
                    "offsetX":0.0,
                    "offsetY":0.0
                }
            },
            "MONOCHROME":{
                "fragmentShader": VideoCompositor.FragmentShaders.MONOCHROME
            },
            "SEPIA":{
                "fragmentShader": VideoCompositor.FragmentShaders.SEPIA
            },
            "BITCRUNCH":{
                "fragmentShader":VideoCompositor.FragmentShaders.BITCRUNCH
            },
            //Green screen color =  r = 62, g = 178, b = 31
            //Normalised         = r = 0.243, g= 0.698, b = 0.122
            "GREENSCREENMAD":{
                "fragmentShader":"\
                    precision mediump float;\
                    uniform sampler2D u_image;\
                    varying vec2 v_texCoord;\
                    varying float v_progress;\
                    void main(){\
                        vec4 pixel = texture2D(u_image, v_texCoord);\
                        float alpha = 1.0;\
                        float r = pixel[0];\
                        float g = pixel[1];\
                        float b = pixel[2];\
                        float y =  0.299*r + 0.587*g + 0.114*b;\
                        float u = -0.147*r - 0.289*g + 0.436*b;\
                        float v =  0.615*r - 0.515*g - 0.100*b;\
                        ;\
                        alpha = (v+u)*10.0 +2.0;\
                        \
                        pixel = floor(pixel*vec4(2.0,2.0,2.0,2.0));\
                        pixel = pixel/vec4(2.0,2.0,2.0,2.0);\
                        pixel = vec4(pixel[2]*2.0, pixel[1]*2.0, pixel[0]*2.0, alpha);\
                        gl_FragColor = pixel;\
                    }"
            },
            "GREENSCREEN":{
                "fragmentShader":"\
                    precision mediump float;\
                    uniform sampler2D u_image;\
                    varying vec2 v_texCoord;\
                    varying float v_progress;\
                    varying float v_yUpperThreshold;\
                    varying float v_yLowerThreshold;\
                    void main(){\
                        vec4 pixel = texture2D(u_image, v_texCoord);\
                        float alpha = 1.0;\
                        float r = pixel[0];\
                        float g = pixel[1];\
                        float b = pixel[2];\
                        float y =  0.299*r + 0.587*g + 0.114*b;\
                        float u = -0.147*r - 0.289*g + 0.436*b;\
                        float v =  0.615*r - 0.515*g - 0.100*b;\
                        if (y > v_yLowerThreshold && y < v_yUpperThreshold){\
                            alpha = (v+u)*40.0 +2.0;\
                        }\
                        pixel = vec4(pixel[0], pixel[1], pixel[2], alpha);\
                        gl_FragColor = pixel;\
                    }",
                "vertexShader": "\
                    uniform float progress;\
                    uniform float duration;\
                    uniform float yLowerThreshold;\
                    uniform float yUpperThreshold;\
                    uniform vec2 source_resolution;\
                    uniform vec2 output_resolution;\
                    attribute vec2 a_position;\
                    attribute vec2 a_texCoord;\
                    varying vec2 v_texCoord;\
                    varying float v_progress;\
                    varying float v_duration;\
                    varying float v_yLowerThreshold;\
                    varying float v_yUpperThreshold;\
                    varying vec2 v_source_resolution;\
                    varying vec2 v_output_resolution;\
                    void main() {\
                        v_progress = progress;\
                        v_duration = duration;\
                        v_yLowerThreshold = yLowerThreshold;\
                        v_yUpperThreshold = yUpperThreshold;\
                        v_source_resolution = source_resolution;\
                        v_output_resolution = output_resolution;\
                        gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                        v_texCoord = a_texCoord;\
                    }",
                    "defaultParameters":{
                        "yLowerThreshold":0.2,
                        "yUpperThreshold":0.8
                    }
            },
            "FADEINOUT": {
                "fragmentShader":VideoCompositor.FragmentShaders.FADEINOUT,
                "vertexShader": VideoCompositor.VertexShaders.INOUT,
                "defaultParameters":{
                    "inTime":1.0,
                    "outTime":1.0
                }
            },
            "FADEINOUT1SEC": {
                "fragmentShader":VideoCompositor.FragmentShaders.FADEINOUT,
                "vertexShader": VideoCompositor.VertexShaders.INOUT,
                "defaultParameters":{
                    "inTime":1.0,
                    "outTime":1.0
                }
            },
            "FADEINOUT2SEC": {
                "fragmentShader":VideoCompositor.FragmentShaders.FADEINOUT,
                "vertexShader": VideoCompositor.VertexShaders.INOUT,
                "defaultParameters":{
                    "inTime":2.0,
                    "outTime":2.0
                }
            },
            "FADEIN1SEC": {
                "fragmentShader":VideoCompositor.FragmentShaders.FADEINOUT,
                "vertexShader": VideoCompositor.VertexShaders.INOUT,
                "defaultParameters":{
                    "inTime":1.0,
                    "outTime":0.0
                }
            },
            "FADEIN2SEC": {
                "fragmentShader":VideoCompositor.FragmentShaders.FADEINOUT,
                "vertexShader": VideoCompositor.VertexShaders.INOUT,
                "defaultParameters":{
                    "inTime":2.0,
                    "outTime":0.0
                }
            },
            "FADEOUT1SEC": {
                "fragmentShader":VideoCompositor.FragmentShaders.FADEINOUT,
                "vertexShader": VideoCompositor.VertexShaders.INOUT,
                "defaultParameters":{
                    "inTime":0.0,
                    "outTime":1.0
                }
            },
            "FADEOUT2SEC": {            
                "fragmentShader":VideoCompositor.FragmentShaders.FADEINOUT,
                "vertexShader": VideoCompositor.VertexShaders.INOUT,
                "defaultParameters":{
                    "inTime":0.0,
                    "outTime":2.0
                        }
                },
            "LUTSQAURE64X64":{
                "fragmentShader": VideoCompositor.FragmentShaders.LUTSQAURE64X64,
            }
        };
    }
}

export default VideoCompositor;