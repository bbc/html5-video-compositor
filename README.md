# HTML5-Video-Compositor
A shader based video composition engine for the browser.

## Introduction
This is an experimental video composition engine which can play edit decision lists in the browser. Content can be dynamically appended to the EDL as it's playing to create interactive and responsive content.

In video editing terms an EDL defines the points at which to cut and assemble video sources. VideoCompositor uses a simple JSON based EDL to describe how to cut and assemble HTML5 video sources, images, and WebGL contexts, it also provides a framework for performing shader based compositing operations (i.e cross-fades, green-screen).


## VideoCompositor API

### Syntax

```
//Instantiating a video compositor
var compositor = new VideoCompositor(canvas);

var playlist = {
    "tracks":[
        [{type:"video", start:0, duration:5, src:"video1.mp4"},                        {type:"video", start:7.5, duration:5, src:"video2.mp4"}],
        [                        {type:"image", start:2.5, duration:5, src:"image.png"}]
    ]
}

//Setting a playlist
compositor.setPlaylist(playlist);
//Playing the set playlist
compositor.play();

```

### Properites of VideoCompositor Instances

#### VideoCompositor.currentTime
The current playhead position through the currently playing playlist. This can be set to seek to a given position in a playlist. Seeking is experimental and may break if seeking into some media sources.

#### VideoCompositor.playlist
This provides access to the current playlist. Content can be added/removed to the playlist dynamically at play time. Removing a currently playing media source or a media source which is currently pre-loading may result in undefined behaviour. Dynamically modified playlists aren't reparsed automatically by the internal playlist validator so either do this manually, or cross your fingers.


### Methods of VideoCompositor Instances

#### VideoCompositor.setPlaylist()
Sets a playlist to be played by the videocompositor engine. The passed playlist is run through the playlist validator to make sure it's ok.

'''
var playlist = {
    "tracks":[
        [{type:"video", start:0, duration:5, src:"video1.mp4"}],
    ]
}
VideoCompositor.setPlaylist(playlist)
'''

#### VideoCompositor.play()
Starts playing the current playlist. Stop will ba called once the end of the playlist has been reached.

#### VideoCompositor.pause()
Pauses the currently playing content.

#### VideoCompositor.stop()
Pauses the currently playing content and sets the currentTime to 0

#### VideoCompositor.seek()
Seeks to the given time in the playlist. 
```
videocompositor.seek(10);
```


## Video Encoding

You will probably only see acceptable video performance if you encode videos with some kind of "fast decode" option. Using the avconv tool this can be done with the following command.

```
avconv -i input.mp4 -tune fastdecode -strict experimental output.mp4
```

## Build

This project uses npm to manage dependencies. To build the compositor, in the root of the project run:

```
npm install
```

Once this has completed you can build the source files by running:

```
npm run build
```

To auto-recompile the project on source change run:
```
npm run watch
```
