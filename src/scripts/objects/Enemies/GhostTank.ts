import { IImageConstructor } from "../../interfaces/image.interface";
import { Bullet } from "../Bullet";
import { Enemy } from "./Enemy";

export class GhostTank extends Enemy {
    constructor(aParams: IImageConstructor) {
        super(aParams);
        super.initProperties();
        this.customParentProperties();
        super.initContainer();
        super.initBehavior();
        this.customConfig();
        super.initWeapons();
    }

    private customParentProperties() {
        this.deadPoint = 300;
    }

    private customConfig() {
        this.tween.stop();
        this.body.setBounce(1, 1);
        this.body.setVelocity(Phaser.Math.RND.between(-200, 200), 300);

        this.scene.tweens.add({
            targets: [ this, this.barrel, this.lifeBar],
            props: { 
                alpha: 0,
            },
            delay: 1000,
            duration: 1000,
            ease: 'Power3',
            easeParams: null,
            hold: 1000,
            repeat: -1,
            repeatDelay: 1000,
            yoyo: true
        });
    }
}