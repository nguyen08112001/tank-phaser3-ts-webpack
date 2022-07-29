import { IImageConstructor } from '../../interfaces/image.interface';
import { Button } from './Button';

export class PlayButton extends Button {
    body: Phaser.Physics.Arcade.Body;

    constructor(aParams: IImageConstructor) {
        super(aParams);
    }

    public handlePointerDown() {
        this.scene.scene.stop();
        this.scene.scene.resume('GameScene');
    }

    update(): void {
    }

}
