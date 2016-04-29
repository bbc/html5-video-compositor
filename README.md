# HTML5-Video-Compositor

**Note: For new projects please consider using the [VideoContext](https://github.com/bbc/videocontext), a new and improved library from BBC R&D which overcomes some of the limitations of the html5-video-compositor.**

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
                    [{type:"video", sourceStart:0, start:0, duration:5, src:"video1.mp4", id:"1"},                      {type:"video", sourceStart:0, start:7.5, duration:5, src:"video2.mp4", id:"3"}],
                    [                                      {type:"image", start:2.5, duration:5, src:"image.png", id:"2"}]
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


## Limitations

* Effects are limited to one shader per track ... stay tuned for updates on this.
* (Probably) won't work on mobile.
* Cant' change the properties of MediaSourceReferences dynamically.
* Videos must be encoded correctly.

## Video Encoding
You will probably only see acceptable video performance if you encode videos with some kind of "fast decode" option. Using the avconv tool this can be done with the following command.

```Bash
avconv -i input.mp4 -tune fastdecode -strict experimental output.mp4
```


## Documentation

The [tutorial.md file](https://github.com/bbc/html5-video-compositor/blob/master/tutorial/tutorial.md) in the tutorial directory of the project gives a walk-through of using the library to sequence clips and perform simple effects.

[API documentation](https://github.com/bbc/html5-video-compositor/tree/master/doc) is available in the /doc directory of the project.

Notes about usage, behaviors, and other miscellaneous information is available on the [Wiki](https://github.com/bbc/html5-video-compositor/wiki).


## Build

This project uses npm to manage dependencies. To build the compositor, in the root of the project run:

```Bash
npm install
```

Once this has completed you can build the source files by running (this will build a commonjs2 and a vanilla js file):

```Bash
npm run build
```

To auto-recompile the project on source change run (this will only rebuild the vanilla js file):
```Bash
npm run dev
```
