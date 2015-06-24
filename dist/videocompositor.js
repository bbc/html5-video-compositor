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

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _sourcesVideoJs = __webpack_require__(1);

	var _sourcesVideoJs2 = _interopRequireDefault(_sourcesVideoJs);

	var _sourcesImageJs = __webpack_require__(3);

	var _sourcesImageJs2 = _interopRequireDefault(_sourcesImageJs);

	var _sourcesWebglJs = __webpack_require__(4);

	var _sourcesWebglJs2 = _interopRequireDefault(_sourcesWebglJs);

	var updateables = [];
	var previousTime = undefined;
	var mediaSourceMapping = {
	    "video": _sourcesVideoJs2["default"],
	    "image": _sourcesImageJs2["default"],
	    "webgl": _sourcesWebglJs2["default"]
	};

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

	        console.log("Hello VideoCompositor");
	        this.canvas = canvas;
	        this.ctx = canvas.getContext("webgl");
	        this.playing = false;

	        this.mediaSources = [];
	        this.playlist = undefined;
	        this.currentTime = 0;
	        registerUpdateable(this);
	    }

	    _createClass(VideoCompositor, [{
	        key: "play",
	        value: function play() {
	            this.playing = true;
	            for (var i = 0; i < this.mediaSources.length; i++) {
	                this.mediaSources[i].play();
	            };
	        }
	    }, {
	        key: "setPlaylist",
	        value: function setPlaylist(playlist) {}
	    }, {
	        key: "update",
	        value: function update(dt) {
	            if (this.playlist === undefined || this.playing === false) return;
	            this.currentTime += dt;
	        }
	    }]);

	    return VideoCompositor;
	})();

	exports["default"] = VideoCompositor;
	module.exports = exports["default"];

	// Playlist
	//
	// var playlist = {
	//      "tracks":{
	//          "1":[{type:"video", start:0, duration:5, src:"video1.mp4"},                        {type:"video", start:7.5, duration:5, src:"video2.mp4"}],
	//          "2":[                        {type:"image", start:2.5, duration:5, src:"image.png"}],
	//      }
	// }
	//

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
	    }

	    _createClass(Wrapper, [{
	        key: "play",
	        value: function play() {
	            console.log("Playing", this.id);
	        }
	    }, {
	        key: "stop",
	        value: function stop() {
	            console.log("Stopping", this.id);
	        }
	    }]);

	    return Wrapper;
	})();

	exports["default"] = Wrapper;
	module.exports = exports["default"];

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

	var WebGL = (function (_Wrapper) {
	    function WebGL(properties) {
	        _classCallCheck(this, WebGL);

	        _get(Object.getPrototypeOf(WebGL.prototype), "constructor", this).call(this, properties);
	        console.log("Hello WebGL");
	    }

	    _inherits(WebGL, _Wrapper);

	    _createClass(WebGL, [{
	        key: "play",
	        value: function play() {
	            _get(Object.getPrototypeOf(WebGL.prototype), "play", this).call(this);
	        }
	    }, {
	        key: "stop",
	        value: function stop() {
	            _get(Object.getPrototypeOf(WebGL.prototype), "stop", this).call(this);
	        }
	    }]);

	    return WebGL;
	})(_wrapper2["default"]);

	exports["default"] = WebGL;
	module.exports = exports["default"];

/***/ }
/******/ ]);