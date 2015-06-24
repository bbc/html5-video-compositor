# HTML5-Video-Compositor
A shader based video composition engine for the browser.

## Introduction
This is an experimental video composition engine which can play edit decision lists in the browser. Content can be dynamically appended to the EDL as it's playing to create interactive and responsive content.

In video editing terms an EDL defines the points at which to cut and assemble video sources. VideoCompositor uses a simple JSON based EDL to describe how to cut and assemble HTML5 video sources, images, and WebGL contexts, it also provides a framework for performing shader based compositing operations (i.e cross-fades, green-screen).



## API

```
var compositor = new VideoCompositor(canvas);
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
