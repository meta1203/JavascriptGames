class AnimatableClass {
    //The _ leading char means it should be accessible in someway from outside
    //Everything else is explicitly private
    #_ssm;
    #_animation_profile;
    #_animloop_start = 0;
    #_animloop_cur = 0;
    #_animloop_end = 0;
    #position = { real: {x: undefined, y: undefined},
                  centered: {x: undefined, y: undefined}
                };
    #_x_centering_offset;
    #_y_centering_offset;
    #scale;

    constructor(ssm, animation_profile, px, py, scale=0) {
        this.#_ssm = ssm;
        this.#_animation_profile = animation_profile;
        if(!scale){
            scale = this.#_animation_profile.default_scale;
        }
        this.#scale = scale;
        this.#_x_centering_offset = this.#_animation_profile.sprite_width*this.#scale/2;
        this.#_y_centering_offset = this.#_animation_profile.sprite_height*this.#scale/2;
        this.x = px;
        this.y = py;
    }

    set scale(s) {
        this.#scale = s;
    }

    get scale() {
        return this.#scale;
    }

    get real_x() {
        return this.#position.real.x;
    }

    get real_y() {
        return this.#position.real.y;
    }

    get x() {
        return this.#position.centered.x;
    }

    get y() {
        return this.#position.centered.y;
    }

    set x(x) {
        this.#position.centered.x = x;
        this.#position.real.x = x - this.#_x_centering_offset;
    }

    set y(y) {
        this.#position.centered.y = y;
        this.#position.real.y = y - this.#_y_centering_offset;
    }

    set pos(p) {
        this.x = p.x;
        this.y = p.y;
    }

    get pos() {
        return {x: this.x, y: this.y};
    }

    defineAnimationLoop(start, end, currentIndex=-1) {
        if(currentIndex == -1) {
            currentIndex = start;
        }
        this.#_animloop_start = start;
        this.#_animloop_cur = currentIndex;
        this.#_animloop_end = end;
    }

    defineAnimationLoopFromKey(key) {
        this.defineAnimationLoop(this.#_animation_profile.animations[key].start, this.#_animation_profile.animations[key].stop);
    }

    draw(index) {
        this.#_ssm.drawSprite(this.#_animation_profile.id, index, this.real_x, this.real_y, this.#scale);
    }

    drawNext() {
        this.#_ssm.drawSprite(this.#_animation_profile.id, this.#_animloop_cur, this.real_x, this.real_y, this.#scale);
        this.#_animloop_cur += 1;
        if(this.#_animloop_cur > this.#_animloop_end){
            this.#_animloop_cur = this.#_animloop_start;
        }
    }

    drawPrev() {
        this.#_ssm.drawSprite(this.#_animation_profile.id, this.#_animloop_cur, this.#position.real.x, this.#position.real.y, this.#scale);
        this.#_animloop_cur -= 1;
        if(this.#_animloop_cur < this.#_animloop_start){
            this.#_animloop_cur = this.#_animloop_end;
        }
    }
}

class CharacterAnimatable {
    #_idle;
    #_move;
    #_attack;
    #_cur_animatable;

    #_win;
    constructor(win, player_class, px, py, scale=0) {
        this.#_win = win;
        var animation_super_profile;
        if(!(animation_super_profile = AnimationProfiles.CharacterClasses[player_class])) {
            throw new Error("Trying to load unloadable class.");
            return undefined;
        }
        this.#_idle = new AnimatableClass(this.#_win.ssm, animation_super_profile.Idle, px, py, scale);
        this.#_move = new AnimatableClass(this.#_win.ssm, animation_super_profile.Move, px, py, scale);
        this.#_attack = new AnimatableClass(this.#_win.ssm, animation_super_profile.Attack, px, py, scale);
        this.#_cur_animatable = this.#_idle;
    }

    draw() {
        this.#_cur_animatable.drawNext();
    }

    animate(type, key) {
        switch(type) {
            case "attack":
                this.#_cur_animatable = this.#_attack;
                this.#_attack.defineAnimationLoopFromKey(key);
                break;
            case "idle":
                this.#_cur_animatable = this.#_idle;
                this.#_idle.defineAnimationLoopFromKey(key);
                break;
            case "move":
                this.#_cur_animatable = this.#_move;
                this.#_move.defineAnimationLoopFromKey(key);
                break;
            default:
                this.#_cur_animatable = this.#_idle;
                this.#_idle.defineAnimationLoopFromKey("KeyS");
        }
    }

    set pos(p) {
        this.#_idle.pos = p;
        this.#_move.pos = p;
        this.#_attack.pos = p;
    }

    set x(x) {
        this.#_idle.x = x;
        this.#_move.x = x;
        this.#_attack.x = x;
    }

    set y(y) {
        this.#_idle.y = y;
        this.#_move.y = y;
        this.#_attack.y = y;
    }
}