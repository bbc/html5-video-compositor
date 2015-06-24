# HTML5-Video-Compositor
A shader based video composition engine for the browser.

## Introduction
This is an experimental video composition engine which can play edit decision lists in the browser. Content can be dynamically appended to the EDL as it's playing to create interactive and responsive content.

In video editing terms an EDL defines the points at which to cut and assemble video sources. VideoCompositor uses a simple JSON based EDL to describe how to cut and assemble HTML5 video sources, images, and WebGL contexts, it also provides a framework for performing shader based compositing operations (i.e cross-fades, green-screen).



## API

```
var compositor = new VideoCompositor(canvas);

var playlist = {
    "tracks":{
        "1":[{type:"video", start:0, duration:5, src:"video1.mp4"},                        {type:"video", start:7.5, duration:5, src:"video2.mp4"}],
        "2":[                        {type:"image", start:2.5, duration:5, src:"image.png"}],
    }
}

compositor.setPlaylist(playlist);
compositor.play();

```

## Video Encoding

You will probably only see acceptable video performance if you encode videos with some kind of "fast decode" option. Using the avconv tool this can be done with the following command.

```
avconv -i input.mp4 -tune fastdecode -strict experimental output.mp4
```

## Build

This project uses npm to manage dependencies. To start development in the root of the project run:

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
