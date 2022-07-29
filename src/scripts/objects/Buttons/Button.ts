import { IImageConstructor } from '../../interfaces/image.interface';

export class Button extends Phaser.GameObjects.Image {
    body: Phaser.Physics.Arcade.Body;

    constructor(aParams: IImageConstructor) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);

        this.initImage(aParams);
        this.scene.add.existing(this);
    }

    private initImage(aParams: IImageConstructor) {
        // image
        this.scene.add.image(aParams.x, aParams.y , aParams.texture)
        this.setScale(4)
        this.setInteractive({ useHandCursor: true })
        this.on('pointerdown', () => {
                this.handlePointerDown()
            })
            this.on('pointerover', () => {
                this.setScale(6)
            })
            this.on ('pointerout', () => {
                this.setScale(4)
            })

    }
    protected handlePointerDown(): void {
    }

    update(): void {
    }

}
