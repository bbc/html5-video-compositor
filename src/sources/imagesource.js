import MediaSource from "./mediasource";

class ImageSource extends MediaSource{
    constructor(properties, gl){
        super(properties, gl);
    }
    play(){
        super.play();
    }
    seek(time){
        super.seek(time);
    }
    pause(){
        super.pause();
    }
    load(){
        //check if we're using an already instatiated element, if so don't do anything.
        if (super.load()){
            this.seek(0);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.element);
            this.ready = true;
            // Upload the image into the texture.
            this.onready(this);
            return
        };

        //otherwise begin the loading process for this mediaSource
        this.element = new Image();
        let _this = this;
        this.element.onload = function(){
            _this.gl.texImage2D(_this.gl.TEXTURE_2D, 0, _this.gl.RGBA, _this.gl.RGBA, _this.gl.UNSIGNED_BYTE, _this.element);
            _this.ready = true;
            _this.onready(_this);
        }
        this.element.src = this.src;
    }
    render(program){
        super.render(program);
    }
}

export default ImageSource;