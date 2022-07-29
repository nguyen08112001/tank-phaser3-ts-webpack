import { IImageConstructor } from '../interfaces/image.interface';

export class Shield extends Phaser.GameObjects.Image {
    body: Phaser.Physics.Arcade.Body;

    constructor(aParams: IImageConstructor) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);

        this.init();
        this.scene.add.existing(this);
    }

    private init() {
        // image
        this.setScale(0.2)

        // physics
        this.scene.physics.world.enable(this);

        //tween
        this.scene.tweens.add({
            targets: this,
            scale: 0.25,
            ease: 'Power0',
            yoyo: true,
            duration: 500,
            repeat: -1
        })
    }

    update(): void {
    }

}
