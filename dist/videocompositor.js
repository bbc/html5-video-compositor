var VideoCompositor =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _sourcesVideosourceJs = __webpack_require__(5);

	var _sourcesVideosourceJs2 = _interopRequireDefault(_sourcesVideosourceJs);

	var _sourcesImagesourceJs = __webpack_require__(6);

	var _sourcesImagesourceJs2 = _interopRequireDefault(_sourcesImagesourceJs);

	var _sourcesCanvassourceJs = __webpack_require__(7);

	var _sourcesCanvassourceJs2 = _interopRequireDefault(_sourcesCanvassourceJs);

	var updateables = [];
	var previousTime = undefined;
	var mediaSourceMapping = new Map();
	mediaSourceMapping.set("video", _sourcesVideosourceJs2["default"]).set("image", _sourcesImagesourceJs2["default"]).set("canvas", _sourcesCanvassourceJs2["default"]);

	function registerUpdateable(updateable) {
	    updateables.push(updateable);
	}
	function update(time) {
	    if (previousTime === undefined) previousTime = time;
	    var dt = (time - previousTime) / 1000;
	    for (var i = 0; i < updateables.length; i++) {
	        updateables[i].update(dt);
	    }
	    previousTime = time;
	    requestAnimationFrame(update);
	}
	update();

	var VideoCompositor = (function () {
	    function VideoCompositor(canvas) {
	        _classCallCheck(this, VideoCompositor);

	        this._canvas = canvas;
	        this._ctx = this._canvas.getContext("2d");
	        this._playing = false;
	        this._mediaSources = new Map();
	        this._mediaSourcePreloadNumber = 1; // define how many mediaSources to preload. This is influenced by the number of simultanous AJAX requests available.
	        this._playlist = undefined;

	        this._currentTime = 0;
	        this.duration = 0;
	        registerUpdateable(this);
	    }

	    _createClass(VideoCompositor, [{
	        key: "play",
	        value: function play() {
	            this._playing = true;
	        }
	    }, {
	        key: "pause",
	        value: function pause() {
	            this._playing = false;
	            this._mediaSources.forEach(function (mediaSource, id, mediaSources) {
	                value.pause();
	            });
	        }
	    }, {
	        key: "stop",
	        value: function stop() {
	            this.pause();
	            this._currentTime = 0;
	        }
	    }, {
	        key: "_getPlaylistStatusAtTime",
	        value: function _getPlaylistStatusAtTime(playlist, playhead) {
	            var toPlay = [];
	            var currentlyPlaying = [];
	            var finishedPlaying = [];

	            //itterate tracks
	            for (var i = 0; i < playlist.tracks.length; i++) {
	                var track = playlist.tracks[i];
	                for (var j = 0; j < track.length; j++) {
	                    var segment = track[j];
	                    var segmentEnd = segment.start + segment.duration;

	                    if (playhead > segmentEnd) {
	                        finishedPlaying.push(segment);
	                        continue;
	                    }
	                    if (playhead > segment.start && playhead < segmentEnd) {
	                        currentlyPlaying.push(segment);
	                        continue;
	                    }
	                    if (playhead <= segment.start) {
	                        toPlay.push(segment);
	                        continue;
	                    }
	                };
	            }

	            return [toPlay, currentlyPlaying, finishedPlaying];
	        }
	    }, {
	        key: "_sortMediaSourcesByStartTime",
	        value: function _sortMediaSourcesByStartTime(mediaSources) {
	            mediaSources.sort(function (a, b) {
	                return a.start - b.start;
	            });
	            return mediaSources;
	        }
	    }, {
	        key: "_loadMediaSource",
	        value: function _loadMediaSource(mediaSourceReference) {
	            switch (mediaSourceReference.type) {
	                case "video":
	                    var video = new _sourcesVideosourceJs2["default"](mediaSourceReference);
	                    video.load();
	                    this._mediaSources.set(mediaSourceReference.id, video);
	                    break;
	                case "image":
	                    var image = new _sourcesImagesourceJs2["default"](mediaSourceReference);
	                    image.load();
	                    this._mediaSources.set(mediaSourceReference.id, image);
	                    break;
	                case "canvas":
	                    var canvas = new _sourcesCanvassourceJs2["default"](mediaSourceReference);
	                    canvas.load();
	                    this._mediaSources.set(mediaSourceReference.id, canvas);
	                    break;
	                default:
	                    throw { "error": 2, "msg": "mediaSourceReference " + mediaSourceReference.id + " has unrecognized type " + mediaSourceReference.type, toString: function toString() {
	                            console.log(this.msg);
	                        } };
	                    break;
	            }
	        }
	    }, {
	        key: "update",
	        value: function update(dt) {
	            if (this._playlist === undefined || this._playing === false) return;

	            var _getPlaylistStatusAtTime2 = this._getPlaylistStatusAtTime(this._playlist, this._currentTime);

	            var _getPlaylistStatusAtTime22 = _slicedToArray(_getPlaylistStatusAtTime2, 3);

	            var toPlay = _getPlaylistStatusAtTime22[0];
	            var currentlyPlaying = _getPlaylistStatusAtTime22[1];
	            var finishedPlaying = _getPlaylistStatusAtTime22[2];

	            toPlay = this._sortMediaSourcesByStartTime(toPlay);

	            //Preload mediaSources
	            for (var _i2 = 0; _i2 < this._mediaSourcePreloadNumber; _i2++) {
	                if (_i2 === toPlay.length) break;
	                if (this._mediaSources.has(toPlay[_i2].id) === false) {
	                    this._loadMediaSource(toPlay[_i2]);
	                }
	            };

	            //Clean-up any mediaSources which have already been played
	            for (var _i3 = 0; _i3 < finishedPlaying.length; _i3++) {
	                var mediaSourceReference = finishedPlaying[_i3];
	                if (this._mediaSources.has(mediaSourceReference.id)) {
	                    var mediaSource = this._mediaSources.get(mediaSourceReference.id);
	                    mediaSource.destroy();
	                    this._mediaSources["delete"](mediaSourceReference.id);
	                }
	            };

	            //Play mediaSources on the currently playing queue.
	            var w = this._canvas.width;
	            var h = this._canvas.height;
	            currentlyPlaying.reverse(); //reverse the currently playing queue so track 0 renders last

	            for (var i = 0; i < currentlyPlaying.length; i++) {
	                var mediaSourceID = currentlyPlaying[i].id;
	                var mediaSource = this._mediaSources.get(mediaSourceID);
	                mediaSource.play();
	                this._ctx.drawImage(mediaSource.render(), 0, 0, w, h);
	            };
	            this._currentTime += dt;
	        }
	    }, {
	        key: "currentTime",
	        set: function set(currentTime) {
	            console.log("Seeking to", currentTime);
	            this._currentTime = currentTime;
	        },
	        get: function get() {
	            return this._currentTime;
	        }
	    }, {
	        key: "playlist",
	        set: function set(playlist) {
	            VideoCompositor.validatePlaylist(playlist);
	            this.duration = VideoCompositor.calculatePlaylistDuration(playlist);
	            this._playlist = playlist;
	        }
	    }], [{
	        key: "calculateTrackDuration",
	        value: function calculateTrackDuration(track) {
	            var maxPlayheadPosition = 0;
	            for (var j = 0; j < track.length; j++) {
	                var playheadPosition = track[j].start + track[j].duration;
	                if (playheadPosition > maxPlayheadPosition) {
	                    maxPlayheadPosition = playheadPosition;
	                }
	            };
	            return maxPlayheadPosition;
	        }
	    }, {
	        key: "calculatePlaylistDuration",
	        value: function calculatePlaylistDuration(playlist) {
	            var maxTrackDuration = 0;

	            for (var i = 0; i < playlist.tracks.length; i++) {
	                var track = playlist.tracks[i];
	                var trackDuration = VideoCompositor.calculateTrackDuration(track);
	                if (trackDuration > maxTrackDuration) {
	                    maxTrackDuration = trackDuration;
	                }
	            }

	            return maxTrackDuration;
	        }
	    }, {
	        key: "validatePlaylist",
	        value: function validatePlaylist(playlist) {
	            /*     
	            This function validates a passed playlist, making sure it matches a 
	            number of properties a playlist must have to be OK.
	            
	            * Error 1. The playlist media sources have all the expected properties.
	            * Error 2. Media sources in single track are sequential.
	            * Error 3. Media sources in single track don't overlap
	            */

	            //Error 1. The playlist media sources have all the expected properties.
	            for (var i = 0; i < playlist.tracks.length; i++) {
	                var track = playlist.tracks[i];
	                for (var j = 0; j < track.length; j++) {
	                    var mediaSource = track[j];
	                    if (mediaSource.id === undefined) throw { "error": 2, "msg": "mediaSource " + mediaSource.id + " in track " + i + " is missing a id property", toString: function toString() {
	                            console.log(this.msg);
	                        } };
	                    if (mediaSource.start === undefined) throw { "error": 2, "msg": "mediaSource " + mediaSource.id + " in track " + i + " is missing a start property", toString: function toString() {
	                            console.log(this.msg);
	                        } };
	                    if (mediaSource.duration === undefined) throw { "error": 2, "msg": "mediaSource " + mediaSource.id + " in track " + i + " is missing a duration property", toString: function toString() {
	                            console.log(this.msg);
	                        } };
	                    if (mediaSource.type === undefined) throw { "error": 2, "msg": "mediaSource " + mediaSource.id + " in track " + i + " is missing a type property", toString: function toString() {
	                            console.log(this.msg);
	                        } };
	                    if (mediaSource.src != undefined && mediaSource.element != undefined) throw { "error": 2, "msg": "mediaSource " + mediaSource.id + " in track " + i + " has both a src and element, it must have one or the other", toString: function toString() {
	                            console.log(this.msg);
	                        } };
	                    if (mediaSource.src === undefined && mediaSource.element === undefined) throw { "error": 2, "msg": "mediaSource " + mediaSource.id + " in track " + i + " has neither a src or an element, it must have one or the other", toString: function toString() {
	                            console.log(this.msg);
	                        } };
	                }
	            }

	            // Error 2. Media sources in single track are sequential.
	            for (var i = 0; i < playlist.tracks.length; i++) {
	                var track = playlist.tracks[i];
	                var time = 0;
	                for (var j = 0; j < track.length; j++) {
	                    var mediaSource = track[j];
	                    if (mediaSource.start < time) {
	                        throw { "error": 2, "msg": "mediaSource " + mediaSource.id + " in track " + i + " starts before previous mediaSource", toString: function toString() {
	                                console.log(this.msg);
	                            } };
	                    }
	                    time = mediaSource.start;
	                }
	            }

	            //Error 3. Media sources in single track don't overlap
	            for (var i = 0; i < playlist.tracks.length; i++) {
	                var track = playlist.tracks[i];
	                var previousMediaSource = undefined;
	                for (var j = 0; j < track.length; j++) {
	                    var mediaSource = track[j];
	                    if (previousMediaSource === undefined) {
	                        previousMediaSource = mediaSource;
	                        continue;
	                    }
	                    var previousEnd = previousMediaSource.start + previousMediaSource.duration;
	                    var currentStart = mediaSource.start;
	                    if (previousEnd > currentStart) {
	                        throw { "error": 2, "msg": "Track mediaSource overlap. mediaSource " + previousMediaSource.id + " in track " + i + " finishes after mediaSource " + mediaSource.id + " starts.", toString: function toString() {
	                                console.log(this.msg);
	                            } };
	                    }
	                }
	            }
	        }
	    }, {
	        key: "renderPlaylist",
	        value: function renderPlaylist(playlist, canvas, currentTime) {
	            var ctx = canvas.getContext("2d");
	            var w = canvas.width;
	            var h = canvas.height;
	            var trackHeight = h / playlist.tracks.length;
	            var playlistDuration = VideoCompositor.calculatePlaylistDuration(playlist);
	            var pixelsPerSecond = w / playlistDuration;
	            var mediaSourceStyle = {
	                "video": "#a5a",
	                "image": "#5aa",
	                "canvas": "#aa5"
	            };

	            ctx.clearRect(0, 0, w, h);
	            ctx.fillStyle = "#999";
	            for (var i = 0; i < playlist.tracks.length; i++) {
	                var track = playlist.tracks[i];
	                for (var j = 0; j < track.length; j++) {
	                    var mediaSource = track[j];
	                    var msW = mediaSource.duration * pixelsPerSecond;
	                    var msH = trackHeight;
	                    var msX = mediaSource.start * pixelsPerSecond;
	                    var msY = trackHeight * i;
	                    ctx.fillStyle = mediaSourceStyle[mediaSource.type];
	                    ctx.fillRect(msX, msY, msW, msH);
	                    ctx.fill();
	                };
	            };

	            if (currentTime !== undefined) {
	                ctx.fillStyle = "#000";
	                ctx.fillRect(currentTime * pixelsPerSecond, 0, 1, h);
	            }
	        }
	    }]);

	    return VideoCompositor;
	})();

	exports["default"] = VideoCompositor;
	module.exports = exports["default"];

/***/ },
/* 1 */,
/* 2 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var MediaSource = (function () {
	    function MediaSource(properties) {
	        _classCallCheck(this, MediaSource);

	        this.id = properties.id;
	        this.duration = properties.duration;
	        this.playing = false;
	        this.ready = false;
	        this.element;
	        this.src;

	        this.disposeOfElementOnDestroy = false;

	        //If the mediaSource is created from a src string then it must be resonsible for cleaning itself up.
	        if (properties.src !== undefined) {
	            this.disposeOfElementOnDestroy = true;
	            this.src = properties.src;
	        } else {
	            //If the MediaSource is created from an element then it should not clean the element up on destruction as it may be used elsewhere.
	            this.disposeOfElementOnDestroy = false;
	            this.element = properties.element;
	        }
	    }

	    _createClass(MediaSource, [{
	        key: "play",
	        value: function play() {
	            //console.log("Playing", this.id);
	            this.playing = true;
	        }
	    }, {
	        key: "stop",
	        value: function stop() {
	            console.log("Stopping", this.id);
	            this.playing = false;
	        }
	    }, {
	        key: "seek",
	        value: function seek(seekTime) {}
	    }, {
	        key: "isReady",
	        value: function isReady() {
	            return this.ready;
	        }
	    }, {
	        key: "load",
	        value: function load() {
	            console.log("Loading", this.id);
	            if (this.element !== undefined) {
	                this.ready = true;
	                return true;
	            }
	            return false;
	        }
	    }, {
	        key: "destroy",
	        value: function destroy() {
	            console.log("Destroying", this.id);
	            if (this.disposeOfElementOnDestroy) {
	                delete this.element;
	            }
	        }
	    }, {
	        key: "render",
	        value: function render(w, h) {}
	    }]);

	    return MediaSource;
	})();

	exports["default"] = MediaSource;
	module.exports = exports["default"];

	//this.currentTime = seekTime;

	//returns a render of this mediaSource which can be rendered to the display surface.

/***/ },
/* 3 */,
/* 4 */,
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _mediasource = __webpack_require__(2);

	var _mediasource2 = _interopRequireDefault(_mediasource);

	var VideoSource = (function (_MediaSource) {
	    function VideoSource(properties) {
	        _classCallCheck(this, VideoSource);

	        _get(Object.getPrototypeOf(VideoSource.prototype), "constructor", this).call(this, properties);
	        this.sourceStart = 0;
	        if (properties.sourceStart !== undefined) {
	            this.sourceStart = properties.sourceStart;
	        }
	        console.log("Hello Video");
	    }

	    _inherits(VideoSource, _MediaSource);

	    _createClass(VideoSource, [{
	        key: "play",
	        value: function play() {
	            _get(Object.getPrototypeOf(VideoSource.prototype), "play", this).call(this);
	            this.element.play();
	        }
	    }, {
	        key: "seek",
	        value: function seek() {
	            _get(Object.getPrototypeOf(VideoSource.prototype), "seek", this).call(this);
	        }
	    }, {
	        key: "stop",
	        value: function stop() {
	            _get(Object.getPrototypeOf(VideoSource.prototype), "stop", this).call(this);
	        }
	    }, {
	        key: "load",
	        value: function load() {
	            //check if we're using an already instatiated element, if so don't do anything.
	            if (_get(Object.getPrototypeOf(VideoSource.prototype), "load", this).call(this)) return;

	            //otherwise begin the loading process for this mediaSource
	            this.element = document.createElement("video");
	            //construct a fragement URL to cut the required segment from the source video
	            var fragment = "#t=" + this.sourceStart + "," + this.duration;
	            this.element.src = this.src + fragment;
	            console.log(this.element.src);
	            this.element.preload = "auto";
	            this.element.load();
	            var _this = this;
	            this.element.addEventListener("loadeddata", function () {
	                _this.ready = true;
	            }, false);
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            return this.element;
	        }
	    }]);

	    return VideoSource;
	})(_mediasource2["default"]);

	exports["default"] = VideoSource;
	module.exports = exports["default"];

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _mediasource = __webpack_require__(2);

	var _mediasource2 = _interopRequireDefault(_mediasource);

	var ImageSource = (function (_MediaSource) {
	    function ImageSource(properties) {
	        _classCallCheck(this, ImageSource);

	        _get(Object.getPrototypeOf(ImageSource.prototype), "constructor", this).call(this, properties);
	        console.log("Hello Image");
	    }

	    _inherits(ImageSource, _MediaSource);

	    _createClass(ImageSource, [{
	        key: "play",
	        value: function play() {
	            _get(Object.getPrototypeOf(ImageSource.prototype), "play", this).call(this);
	        }
	    }, {
	        key: "seek",
	        value: function seek() {
	            _get(Object.getPrototypeOf(ImageSource.prototype), "seek", this).call(this);
	        }
	    }, {
	        key: "stop",
	        value: function stop() {
	            _get(Object.getPrototypeOf(ImageSource.prototype), "stop", this).call(this);
	        }
	    }, {
	        key: "load",
	        value: function load() {
	            //check if we're using an already instatiated element, if so don't do anything.
	            if (_get(Object.getPrototypeOf(ImageSource.prototype), "load", this).call(this)) return;

	            //otherwise begin the loading process for this mediaSource
	            this.element = new Image();
	            var _this = this;
	            this.element.onload = function () {
	                _this.ready = true;
	            };
	            this.element.src = this.src;
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            return this.element;
	        }
	    }]);

	    return ImageSource;
	})(_mediasource2["default"]);

	exports["default"] = ImageSource;
	module.exports = exports["default"];

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _mediasource = __webpack_require__(2);

	var _mediasource2 = _interopRequireDefault(_mediasource);

	var CanvasSource = (function (_MediaSource) {
	    function CanvasSource(properties) {
	        _classCallCheck(this, CanvasSource);

	        _get(Object.getPrototypeOf(CanvasSource.prototype), "constructor", this).call(this, properties);
	        this.width = properties.width;
	        this.height = properties.height;
	        console.log("Hello Canvas");
	    }

	    _inherits(CanvasSource, _MediaSource);

	    _createClass(CanvasSource, [{
	        key: "play",
	        value: function play() {
	            _get(Object.getPrototypeOf(CanvasSource.prototype), "play", this).call(this);
	        }
	    }, {
	        key: "seek",
	        value: function seek() {
	            _get(Object.getPrototypeOf(CanvasSource.prototype), "seek", this).call(this);
	        }
	    }, {
	        key: "stop",
	        value: function stop() {
	            _get(Object.getPrototypeOf(CanvasSource.prototype), "stop", this).call(this);
	        }
	    }, {
	        key: "load",
	        value: function load() {
	            //check if we're using an already instatiated element, if so don't do anything.
	            if (_get(Object.getPrototypeOf(CanvasSource.prototype), "load", this).call(this)) return;

	            //otherwise begin the loading process for this mediaSource
	            this.element = document.createElement("canvas");
	            this.element.width = this.width;
	            this.element.height = this.height;
	            this.ready = true;
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            return this.element;
	        }
	    }]);

	    return CanvasSource;
	})(_mediasource2["default"]);

	exports["default"] = CanvasSource;
	module.exports = exports["default"];

/***/ }
/******/ ]);