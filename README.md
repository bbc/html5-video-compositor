# HTML5-Video-Compositor
A shader based video composition engine for the browser.

## Introduction
This is an experimental video composition engine which can play edit descision lists in the browser.

In video editing terms an EDL defines the points at which to cut and assemble video sources. VideoCompositor uses a simple JSON based EDL to describe how to cut and assemble HTML5 video sources, images, and WebGL contexts, it also provides a framework for performing shader based compositing operations (i.e cross-fades, green-screen).

Content can also be dynamically appended to the EDL as it's playing to create interactive and responsive content.
