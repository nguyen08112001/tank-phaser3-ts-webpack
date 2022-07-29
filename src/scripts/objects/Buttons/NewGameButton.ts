import { IImageConstructor } from '../../interfaces/image.interface';
import { Button } from './Button';

export class NewGameButton extends Button {
    body: Phaser.Physics.Arcade.Body;

    constructor(aParams: IImageConstructor) {
        super(aParams);
    }

    public handlePointerDown() {
        this.scene.scene.stop('GameScene')
        this.scene.scene.stop('GameOverScene')
        this.scene.scene.stop('MenuScene')
        this.scene.scene.stop('PauseScene')
        this.scene.scene.stop('VictoryScene')
        this.scene.scene.start('GameScene');
    }

    update(): void {
    }

}
