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

	var _sourcesVideoJs = __webpack_require__(1);

	var _sourcesVideoJs2 = _interopRequireDefault(_sourcesVideoJs);

	var _sourcesImageJs = __webpack_require__(3);

	var _sourcesImageJs2 = _interopRequireDefault(_sourcesImageJs);

	var _sourcesCanvasJs = __webpack_require__(4);

	var _sourcesCanvasJs2 = _interopRequireDefault(_sourcesCanvasJs);

	var updateables = [];
	var previousTime = undefined;
	var mediaSourceMapping = new Map();
	mediaSourceMapping.set("video", _sourcesVideoJs2["default"]).set("image", _sourcesImageJs2["default"]).set("canvas", _sourcesCanvasJs2["default"]);

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
	        this._ctx = this._canvas.getContext("webgl");
	        this._playing = false;
	        this._mediaSources = [];

	        this.playlist;
	        this.currentTime = 0;
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
	            for (var i = 0; i < this._mediaSources.length; i++) {
	                this._mediaSources[i].pause();
	            };
	        }
	    }, {
	        key: "stop",
	        value: function stop() {
	            this.pause();
	            this.currentTime = 0;
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
	                    if (playhead < segment.start) {
	                        toPlay.push(segment);
	                        continue;
	                    }
	                };
	            }

	            return [toPlay, currentlyPlaying, finishedPlaying];
	        }
	    }, {
	        key: "update",
	        value: function update(dt) {
	            if (this.playlist === undefined || this._playing === false) return;
	            this.currentTime += dt;

	            var _getPlaylistStatusAtTime2 = this._getPlaylistStatusAtTime(this.playlist, this.currentTime);

	            //console.log(toPlay, currentlyPlaying, finishedPlaying);

	            var _getPlaylistStatusAtTime22 = _slicedToArray(_getPlaylistStatusAtTime2, 3);

	            var toPlay = _getPlaylistStatusAtTime22[0];
	            var currentlyPlaying = _getPlaylistStatusAtTime22[1];
	            var finishedPlaying = _getPlaylistStatusAtTime22[2];
	        }
	    }, {
	        key: "currentTime",
	        set: function set(currentTime) {
	            console.log("Seeking to", currentTime);
	        }
	    }, {
	        key: "playlist",
	        set: function set(playlist) {
	            // Playlist
	            //
	            // var playlist = {
	            //      "tracks":{
	            //          "1":[{type:"video", start:0, duration:5, src:"video1.mp4", uuid:"1"},                        {type:"video", start:7.5, duration:5, src:"video2.mp4", uuid:"3"}],
	            //          "2":[                        {type:"image", start:2.5, duration:5, src:"image.png", uuid:"2"}],
	            //      }
	            // }
	            //
	            VideoCompositor.validatePlaylist(playlist);
	            this.duration = VideoCompositor.calculatePlaylistDuration(playlist);
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
	        value: function renderPlaylist(playlist, canvas) {
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
	                    console.log(msX, msY, msW, msH);
	                    ctx.fillRect(msX, msY, msW, msH);
	                    ctx.fill();
	                };
	            };
	        }
	    }]);

	    return VideoCompositor;
	})();

	exports["default"] = VideoCompositor;
	module.exports = exports["default"];

/***/ },
/* 1 */
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

	var _wrapper = __webpack_require__(2);

	var _wrapper2 = _interopRequireDefault(_wrapper);

	var Video = (function (_Wrapper) {
	    function Video(properties) {
	        _classCallCheck(this, Video);

	        _get(Object.getPrototypeOf(Video.prototype), "constructor", this).call(this, properties);
	        this.src = properties.src;
	        console.log("Hello Video");
	    }

	    _inherits(Video, _Wrapper);

	    _createClass(Video, [{
	        key: "play",
	        value: function play() {
	            _get(Object.getPrototypeOf(Video.prototype), "play", this).call(this);
	        }
	    }, {
	        key: "stop",
	        value: function stop() {
	            _get(Object.getPrototypeOf(Video.prototype), "stop", this).call(this);
	        }
	    }]);

	    return Video;
	})(_wrapper2["default"]);

	exports["default"] = Video;
	module.exports = exports["default"];

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Wrapper = (function () {
	    function Wrapper(properties) {
	        _classCallCheck(this, Wrapper);

	        this.id = properties.id;
	        this.currentTime = 0;
	        this.texture = undefined;
	        this.playing = false;
	        this.ready = true;
	    }

	    _createClass(Wrapper, [{
	        key: "play",
	        value: function play() {
	            console.log("Playing", this.id);
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
	        value: function seek(seekTime) {
	            this.currentTime = seekTime;
	        }
	    }, {
	        key: "isReady",
	        value: function isReady() {
	            return this.ready;
	        }
	    }, {
	        key: "destroy",
	        value: function destroy() {}
	    }]);

	    return Wrapper;
	})();

	exports["default"] = Wrapper;
	module.exports = exports["default"];

	//this.texture.destroy();

/***/ },
/* 3 */
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

	var _wrapper = __webpack_require__(2);

	var _wrapper2 = _interopRequireDefault(_wrapper);

	var Image = (function (_Wrapper) {
	    function Image(properties) {
	        _classCallCheck(this, Image);

	        _get(Object.getPrototypeOf(Image.prototype), "constructor", this).call(this, properties);
	        this.src = properties.src;
	        console.log("Hello Image");
	    }

	    _inherits(Image, _Wrapper);

	    _createClass(Image, [{
	        key: "play",
	        value: function play() {
	            _get(Object.getPrototypeOf(Image.prototype), "play", this).call(this);
	        }
	    }, {
	        key: "stop",
	        value: function stop() {
	            _get(Object.getPrototypeOf(Image.prototype), "stop", this).call(this);
	        }
	    }]);

	    return Image;
	})(_wrapper2["default"]);

	exports["default"] = Image;
	module.exports = exports["default"];

/***/ },
/* 4 */
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

	var _wrapper = __webpack_require__(2);

	var _wrapper2 = _interopRequireDefault(_wrapper);

	var Canvas = (function (_Wrapper) {
	    function Canvas(properties) {
	        _classCallCheck(this, Canvas);

	        _get(Object.getPrototypeOf(Canvas.prototype), "constructor", this).call(this, properties);
	        console.log("Hello Canvas");
	    }

	    _inherits(Canvas, _Wrapper);

	    _createClass(Canvas, [{
	        key: "play",
	        value: function play() {
	            _get(Object.getPrototypeOf(Canvas.prototype), "play", this).call(this);
	        }
	    }, {
	        key: "stop",
	        value: function stop() {
	            _get(Object.getPrototypeOf(Canvas.prototype), "stop", this).call(this);
	        }
	    }]);

	    return Canvas;
	})(_wrapper2["default"]);

	exports["default"] = Canvas;
	module.exports = exports["default"];

/***/ }
/******/ ]);