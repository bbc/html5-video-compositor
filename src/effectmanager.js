import Effect from "./effect.js";

class EffectManager {
    constructor(gl){
        this.effects = new Map();
        this.gl = gl;
        //Setup the default effect
        this.newEffect("default",{"effect":{}});
    }
    
    newEffect(id, playlistEffectObject){
        //The playlist effect object is the representation of the effect stored in the playlist object
        let effect = new Effect(playlistEffectObject, this.gl);
        this.effects.set(id, effect);
    }

    updateEffects(playlistEffectObjects){
        if (playlistEffectObjects === undefined) return;
        for (let key in playlistEffectObjects){
            if (this.effects.has(key)){
                //udpate the effect
                this.effects.get(key).update(playlistEffectObjects[key]);
            } else {
                //create the effect
                this.newEffect(key, playlistEffectObjects[key]);
            }
        }
        //TODO clean-up effects that don't exist
    }

    getEffectForInputId(inputId){
        let effectIdList = this.effects.keys();
        for (let key of effectIdList) {
            var effect = this.effects.get(key);
            if (effect.inputs.indexOf(inputId) > -1){
                return effect;
            }
        }
        return this.effects.get("default");
    }
}

export default EffectManager;
