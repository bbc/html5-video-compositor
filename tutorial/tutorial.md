Tutorial
========

Ingredients
-----------
Lets use Shia LaBeouf's performance in [#introductions](https://vimeo.com/125095515) as one of our media sources. Follow the link to Vimeo video, press the download button and copy the link for the SD version into the following command, replacing $DOWNLOADLINK (keep the surrounding quotes).

```Bash
wget -O introductions.mp4 '$DOWNLOADLINK'
```

The VideoCompositor works best on videos which have been encoded with a fast decode profile. You can run the following command to trans-code the video.

```Bash
avconv -i introductions.mp4 -tune fastdecode -strict experimental introductions-fast.mp4
```

Copy the introductions-fast.mp4 file into a directory with the videocompositor.js file from the /dist directory of the git repository. Also create an empty index.html file. All code form now on will live in the index.html file.

Your working directory should look like the following.

```
./
    videocompositor.js
    introductions-fast.mp4
    index.html
```

Open the index.html file and add the following.

```HTML
<!DOCTYPE html>
<html>
<head>
    <title>VideoCompositor Demo</title>
    <script type="text/javascript" src="videocompositor.js"></script>
</head>
<body>
    <canvas id="vc-cavnas"></canvas>
    <script type="text/javascript">
    
    var videocompositor;
    
    window.onload = function(){
        var canvas = document.getElementById('vc-cavnas');
        canvas.width = 640;
        canvas.height = 360;
        videocompositor = new VideoCompositor(canvas);
    };
    
    </script>
</body>
</html>
```


Serve
-----
In order for the VideoCompositor to work correctly it must be served from an asynchronous capable web-server (unfortunately this means "python -m SimpleHTTPServer" won't work). 

A simple web-server can be acquired from the node package manager (npm).

```Bash
npm install -g http-server
```

Once it has installed start the web-server in the working directory.

```Bash
http-server
```

Navigating to [http://localhost:8080](http://localhost:8080) in a web browser should show a blank page with a black rectangle in the top left.


Controls
--------
By default the VideoCompositor only provides the compositing engine, playback controls must be added manually. 

We'll add some simple controls using button elements to play and pause the playback. Add the following after the canvas tag.

```HTML
    <p>
        <button onclick="videocompositor.play();">Play</button>
        <button onclick="videocompositor.pause();">Pause</button>
    </p>
```

You'll note that there's no stop function for the VideoCompositor. This mirrors the functionality of a HTML5 video where you must combine a pause with a setting of video.currentTime to 0.

Not to worry, we can [duck-punch](http://ericdelabar.com/2008/05/metaprogramming-javascript.html) one in to provide the functionality. This is generally considered bad practice, but we'll roll with it for now. Add the following code fragment after the video compositor is initialised.

```JavaScript
        videocompositor.stop= function(){
            videocompositor.pause();
            videocompositor.currentTime = 0;
        };
```

Then add a button to control stop playback.

```HTML
        <button onclick="videocompositor.stop();">Stop</button>
```

This has put a structure in place which will allow you to control the playback of a VideoCompositor instance. You full index.html file should now look like the following:

```HTML
<!DOCTYPE html>
<html>
<head>
    <title>VideoCompositor Demo</title>
    <script type="text/javascript" src="videocompositor.js"></script>
</head>
<body>
    <canvas id="vc-cavnas"></canvas>
    <p>
        <button onclick="videocompositor.play();">Play</button>
        <button onclick="videocompositor.pause();">Pause</button>
        <button onclick="videocompositor.stop();">Stop</button>
    </p>
    <script type="text/javascript">

    var videocompositor;

    window.onload = function(){
        var canvas = document.getElementById('vc-cavnas');
        canvas.width = 640;
        canvas.height = 360;
        videocompositor = new VideoCompositor(canvas);

        videocompositor.stop= function(){
            videocompositor.pause();
            videocompositor.currentTime = 0;
        };
    };

    </script>
</body>
</html>
```

Play
----
We'll now look at actually playing back some content. To do this we set the playlist property of the VideoCompositor instance to a playlist object representing the media we want to play. The following will play the first 4 seconds of the introductions video.


```HTML
<!DOCTYPE html>
<html>
<head>
    <title>VideoCompositor Demo</title>
    <script type="text/javascript" src="videocompositor.js"></script>
</head>
<body>
    <canvas id="vc-cavnas"></canvas>
    <p>
        <button onclick="videocompositor.play();">Play</button>
        <button onclick="videocompositor.pause();">Pause</button>
        <button onclick="videocompositor.stop();">Stop</button>
    </p>
    <script type="text/javascript">
    
    var videocompositor;
    
    window.onload = function(){
        var canvas = document.getElementById('vc-cavnas');
        canvas.width = 640;
        canvas.height = 360;
        videocompositor = new VideoCompositor(canvas);

        videocompositor.stop= function(){
            videocompositor.pause();
            videocompositor.currentTime = 0;
        };

        var playlist = {
            "tracks":[
                [{type:"video", id:"clip-1", src:"introductions-fast.mp4", start:0, duration:4}]
            ]
        }

        videocompositor.playlist = playlist;
    };
    
    </script>
</body>
</html>
```

If that has worked successfully you should see Shia telling you "something is happening".

The playlist object in the above code is the most basic form of playlist. We have an object with a property called "tracks". This is an array of arrays. The inner arrays are tracks, each of these tracks gets played in parallel. In the above example we only have a single track.

Each of the track arrays is a sequence of objects which represent clips from some source of media, we call these MediaSourceReferences. These must be arranged in the track array in the order in which they are to be played.


Cut
---

We can cut together more clips on the playlist. Replace it with the following 

```JavaScript
var playlist = {
    "tracks":[
        [
            {type:"video",id:"clip-1", src:"introductions-fast.mp4", start:0, duration:4},
            {type:"video", id:"clip-2", src:"introductions-fast.mp4", start:4, sourceStart:140, duration:2},
            {type:"video", id:"clip-3", src:"introductions-fast.mp4", start:6, sourceStart:1469, duration:4}]
    ]
};
```

We now have more MediaSourceReferences on the same track. Of note is the addition of the sourceStart property to the new MediaSourceReferences, this is the offset within the source file to start playing.

It's also worth noting that every MediaSourceReference has a start and duration property. The start property is the time that clip should start playing when the playlist is played, the duration is how long to play it for.

MediaSourceReferences on the same track should never overlap. For example, you can't have a MediaSourceRefernce with start:0 and duration:4 and one with start:3 and duration:4 on the same track as they would overlap by one second. To have MediaSourceReferences overlapping they must be on separate tracks.


Visualize
---------
It can often be quite difficult to visualize what's happening on a playlist. Fortunately there is a static method on the VideoCompositor which will render a visual representation of a playlist to a canvas.


```HTML
<!DOCTYPE html>
<html>
<head>
    <title>VideoCompositor Demo</title>
    <script type="text/javascript" src="videocompositor.js"></script>
</head>
<body>
    <canvas id="vc-cavnas"></canvas>
    <p>
        <canvas id="visualization-canvas"></canvas>
    </p>
    <p>
        <button onclick="videocompositor.play();">Play</button>
        <button onclick="videocompositor.pause();">Pause</button>
        <button onclick="videocompositor.stop();">Stop</button>
    </p>
    <script type="text/javascript">
    var videocompositor;

    window.onload = function(){
        var canvas = document.getElementById('vc-cavnas');
        canvas.width = 640;
        canvas.height = 360;
        videocompositor = new VideoCompositor(canvas);

        videocompositor.stop= function(){
            videocompositor.pause();
            videocompositor.currentTime = 0;
        };

        var playlist = {
            "tracks":[
                [
                    {type:"video", id:"clip-1", src:"introductions-fast.mp4", start:0, duration:4},
                    {type:"video", id:"clip-2", src:"introductions-fast.mp4", start:4, sourceStart:140, duration:2},
                    {type:"video", id:"clip-3", src:"introductions-fast.mp4", start:6, sourceStart:1469, duration:4}
                ]
            ]
        };

        videocompositor.playlist = playlist;

        //Render a playlist visualization
        var visCanvas = document.getElementById('visualization-canvas');
        visCanvas.width = 640;
        visCanvas.height = 30;
        VideoCompositor.renderPlaylist(playlist, visCanvas);

    };

    </script>
</body>
</html>
```

This visualization will be useful later on once we start adding more tracks to a playlist.

Composite
---------
We're now going to introduce two important concepts, parallel tracks, and effects. To introduce these concepts we're going to need more source material. Download a [suitable image](https://pixabay.com/en/cat-animals-cats-portrait-of-cat-778315/) and place it in the working directory of project with the name "image.jpg". 

The following playlist shows how to play the image on a parallel track.


```JavaScript
        var playlist = {
            "tracks":[
                [
                    {type:"video", id:"clip-1", src:"introductions-fast.mp4", start:0, duration:4},
                    {type:"video", id:"clip-2", src:"introductions-fast.mp4", start:4, sourceStart:140, duration:2},
                    {type:"video", id:"clip-3", src:"introductions-fast.mp4", start:6, sourceStart:1469, duration:4}
                ],
                [{type:"image", id:"cats", src:"image.jpg", start:0, duration:10}]
            ]
        };
```

Running the above playlist will seemingly make no changes to the rendered output, but you'll see a new track on the playlist visualisation. This is because tracks are rendered in order, starting at the highest index track first and rendering the track at index 0 on-top of everything. This means our Shia LeBeouf video will be rendered on-top of the static image.

Try replacing the playlist object with the following:
```
var playlist = {
    "tracks":[
        [
            {type:"video", id:"clip-1", src:"introductions-fast.mp4", start:0, duration:4},
            {type:"video", id:"clip-2", src:"introductions-fast.mp4", start:4, sourceStart:140, duration:2},
            {type:"video", id:"clip-3", src:"introductions-fast.mp4", start:6, sourceStart:1469, duration:4}
        ],
        [{type:"image", id:"bg-image", src:"image.jpg", start:0, duration:10}]

    ],
    "effects":{
        "greenscreen-effect":{
            "inputs":["clip-1","clip-2","clip-3"],
            "effect":VideoCompositor.Effects.GREENSCREEN,
            "parameters":{
                "yLowerThreshold": 0.1,
                "yUpperThreshold": 1.0
            }
        }
    }
};
```

This will apply a greenscreen effect to the Shia LaBeouf videos, causing the green pixels to be transparent allowing the underlying image to show through.

Your full index.html file should now look like the following.

```HTML
<!DOCTYPE html>
<html>
<head>
    <title>VideoCompositor Demo</title>
    <script type="text/javascript" src="videocompositor.js"></script>
</head>
<body>
    <canvas id="vc-cavnas"></canvas>
    <p>
        <canvas id="visualization-canvas"></canvas>
    </p>
    <p>
        <button onclick="videocompositor.play();">Play</button>
        <button onclick="videocompositor.pause();">Pause</button>
        <button onclick="videocompositor.stop();">Stop</button>
    </p>
    <script type="text/javascript">

    var videocompositor;

    window.onload = function(){
        var canvas = document.getElementById('vc-cavnas');
        canvas.width = 640;
        canvas.height = 360;
        videocompositor = new VideoCompositor(canvas);

        videocompositor.stop= function(){
            videocompositor.pause();
            videocompositor.currentTime = 0;
        };

        var playlist = {
            "tracks":[
                [
                    {type:"video", id:"clip-1", src:"introductions-fast.mp4", start:0, duration:4},
                    {type:"video", id:"clip-2", src:"introductions-fast.mp4", start:4, sourceStart:140, duration:2},
                    {type:"video", id:"clip-3", src:"introductions-fast.mp4", start:6, sourceStart:1469, duration:4}
                ],
                [{type:"image", id:"bg-image", src:"image.jpg", start:0, duration:10}]

            ],
            "effects":{
                "greenscreen-effect":{
                    "inputs":["clip-1","clip-2","clip-3"],
                    "effect":VideoCompositor.Effects.GREENSCREEN,
                    "parameters":{
                        "yLowerThreshold": 0.1,
                        "yUpperThreshold": 1.0
                    }
                }
            }
        };

        videocompositor.playlist = playlist;

        //Render a playlist visualization
        var visCanvas = document.getElementById('visualization-canvas');
        visCanvas.width = 640;
        visCanvas.height = 30;
        VideoCompositor.renderPlaylist(playlist, visCanvas);

    };

    </script>
</body>
</html>
```



Interact
--------
