# HTML5-Video-Compositor
A shader based video composition engine for the browser.

```HTML
<!DOCTYPE html>
<html>
<head></head>
<body>
    <script type="text/javascript" src="videocompositor.js"></script>
    <script type="text/javascript">
        window.onload = function () {
            var canvas = document.getElementById('player-canvas');
            var videoCompositor = new VideoCompositor(canvas);

            videoCompositor.playlist = {
                "tracks":[
                    [{type:"video", start:0, duration:5, src:"video1.mp4", id:"1"},                            {type:"video", start:7.5, duration:5, src:"video2.mp4", id:"3"}],
                    [                             {type:"image", start:2.5, duration:5, src:"image.png", id:"2"}]
                ]
            };

            videoCompositor.play();
        };
    </script>
    <canvas id="player-canvas"></canvas>
</body>
</html>

```



## Introduction
This is an experimental video composition engine which can play edit decision lists in the browser. Content can be dynamically appended to the EDL as it's playing to create interactive and responsive content.

In video editing terms an EDL defines the points at which to cut and assemble video sources. VideoCompositor uses a simple JSON based EDL to describe how to cut and assemble HTML5 video sources, images, and WebGL contexts, it also provides a framework for performing shader based compositing operations (i.e cross-fades, green-screen).

## Video Encoding
You will probably only see acceptable video performance if you encode videos with some kind of "fast decode" option. Using the avconv tool this can be done with the following command.

```Bash
avconv -i input.mp4 -tune fastdecode -strict experimental output.mp4
```

## VideoCompositor API

### Syntax

```JavaScript
//Instantiating a video compositor
var compositor = new VideoCompositor(canvas);

//Setting a playlist
compositor.playlist = {
    "tracks":[
        [{type:"video", start:0, duration:5, src:"video1.mp4", id:"1"},                             {type:"video", start:7.5, duration:5, src:"video2.mp4", id:"3"}],
        [                             {type:"image", start:2.5, duration:5, src:"image.png", id:"2"}]
    ]
};

//Playing the set playlist
compositor.play();

```

### Properties of VideoCompositor Instances

#### VideoCompositor.currentTime
The current playhead position through the currently playing playlist. This can be set to seek to a given position in a playlist. Seeking is experimental and may break if seeking into some media sources.

#### VideoCompositor.playlist
This provides access to the current playlist. Content can be added/removed to the playlist dynamically at play time. Removing a currently playing media source or a media source which is currently pre-loading may result in undefined behavior. The set playlist is run through the playlist validator to make sure it's OK.

```JavaScript
var playlist = {
    "tracks":[
        [{type:"video", start:0, duration:5, src:"video1.mp4", id:"1"}]
    ]
};
VideoCompositor.playlist = playlist;
```


### Methods of VideoCompositor Instances

#### VideoCompositor.play()
Starts playing the current playlist. Stop will be called once the end of the playlist has been reached.

#### VideoCompositor.pause()
Pauses the currently playing content.

#### VideoCompositor.stop()
Pauses the currently playing content and sets the currentTime to 0


## Build

This project uses npm to manage dependencies. To build the compositor, in the root of the project run:

```Bash
npm install
```

Once this has completed you can build the source files by running:

```Bash
npm run build
```

To auto-recompile the project on source change run:
```Bash
npm run watch
```
