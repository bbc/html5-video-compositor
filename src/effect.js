function refreshTextures(playlistEffectObject, textures, gl){
    let textureOffset = 1;

    if (playlistEffectObject.parameters === undefined) return;

    let parameterKeys = Object.keys(playlistEffectObject.parameters);
    for (let i = 0; i < parameterKeys.length; i++) {
        let key = parameterKeys[i];
        let parameter = playlistEffectObject.parameters[key];
        if (typeof parameter !== "number"){
            let texture = textures[textureOffset-1];
            gl.activeTexture(gl.TEXTURE0 + textureOffset);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, parameter);
            textureOffset += 1;
        }  
    }
}

function loadTextures(playlistEffectObject, gl){
    if (playlistEffectObject.parameters === undefined) return [];
    let parameterKeys = Object.keys(playlistEffectObject.parameters);
    let textures = [];
    for (let i = 0; i < parameterKeys.length; i++) {
        let key = parameterKeys[i];
        let parameter = playlistEffectObject.parameters[key];
        if (typeof parameter !== "number"){
            let texture = gl.createTexture();
            textures.push(texture);                
        }
    }
    refreshTextures(playlistEffectObject, textures, gl);
    return textures;
}


function compileShader(gl, shaderSource, shaderType) {
    let shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        throw "could not compile shader:" + gl.getShaderInfoLog(shader);
    }
    return shader;
}


function createShaderProgram(gl, vertexShaderSource, fragmentShaderSource){
    let vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    let fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    let program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
   
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)){
        throw {"error":4,"msg":"Can't link shader program for track", toString:function(){return this.msg;}};
    }
    return program;
}


class Effect {
    constructor(playlistEffectObject, gl){
        this.gl = gl;
        this.vertexShaderSrc = playlistEffectObject.effect.vertexShader;
        if (this.vertexShaderSrc === undefined){
            this.vertexShaderSrc = "\
                uniform float progress;\
                uniform float duration;\
                uniform vec2 source_resolution;\
                uniform vec2 output_resolution;\
                attribute vec2 a_position;\
                attribute vec2 a_texCoord;\
                varying vec2 v_texCoord;\
                varying float v_progress;\
                varying float v_duration;\
                varying vec2 v_source_resolution;\
                varying vec2 v_output_resolution;\
                void main() {\
                    v_progress = progress;\
                    v_duration = duration;\
                    v_source_resolution = source_resolution;\
                    v_output_resolution = output_resolution;\
                    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                    v_texCoord = a_texCoord;\
                }";
        }
        this.fragmentShaderSrc = playlistEffectObject.effect.fragmentShader;
        if (this.fragmentShaderSrc === undefined){
            this.fragmentShaderSrc = "\
            precision mediump float;\
            uniform sampler2D u_image;\
            varying vec2 v_texCoord;\
            varying float v_progress;\
            varying float v_duration;\
            varying vec2 v_source_resolution;\
            varying vec2 v_output_resolution;\
            void main(){\
                gl_FragColor = texture2D(u_image, v_texCoord);\
            }";
        }

        this.parameters = playlistEffectObject.parameters;
        if (this.parameters === undefined){
            this.parameters = {};
        }
        if (playlistEffectObject.effect.defaultParameters !== undefined){
            for (let key in playlistEffectObject.effect.defaultParameters) {
                if (this.parameters[key]===undefined){
                    this.parameters[key] = playlistEffectObject.effect.defaultParameters[key];
                }
            }
        }
        this.inputs = playlistEffectObject.inputs;
        if (this.inputs === undefined){
            this.inputs = [];
        }

        this.textures = loadTextures(playlistEffectObject, this.gl);
        this.program = createShaderProgram(this.gl, this.vertexShaderSrc, this.fragmentShaderSrc);
    }


    update(playlistEffectObject){
        refreshTextures(playlistEffectObject, this.textures, this.gl);
        this.inputs = playlistEffectObject.inputs;
        if (this.inputs === undefined){
            this.inputs = [];
        }
    }

}

export default Effect;