import { Tilemaps } from "phaser";
import { Button } from "../objects/Buttons/Button";
import { CloseButton } from "../objects/Buttons/CloseButton";
import { PlayButton } from "../objects/Buttons/PlayButton";
import { RestartButton } from "../objects/Buttons/RestartButton";
import { VolumeButton } from "../objects/Buttons/VolumeButton";
// import { PlayButton } from "../objects/Buttons/PlayButton";

export class PauseScene extends Phaser.Scene {
    private resumeKey: Phaser.Input.Keyboard.Key;
    private bitmapTexts: Phaser.GameObjects.BitmapText[] = [];

    constructor() {
        super({
            key: 'PauseScene'
        });
    }

    init(): void {
        this.resumeKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.P
        );
        this.resumeKey.isDown = false;
    }

    create(): void {
        // this.cameras.main.setBackgroundColor(0x000000);  
        
        this.add.image(this.sys.canvas.width / 2,this.sys.canvas.height / 2, 'pause')

        new CloseButton({
            scene: this,
            x: this.sys.canvas.width - 300 ,
            y: 230,
            texture: 'close-button',
        })
        
        new PlayButton({
            scene: this,
            x: (this.sys.canvas.width / 2 - 100),
            y: this.sys.canvas.height -200,
            texture: 'play-button',
        })
        
        new VolumeButton({
            scene: this,
            x: (this.sys.canvas.width / 2),
            y: this.sys.canvas.height -200,
            texture: 'volume-button',
        })
        
        new RestartButton({
            scene: this,
            x: this.sys.canvas.width / 2 +100,
            y: this.sys.canvas.height -200,
            texture: 'restart-button',
        })
            
        this.bitmapTexts.push(
            this.add.bitmapText(
                this.sys.canvas.width / 2 - 160,
                100,
                'font',
                'PAUSED',
                100
            )
        );
    }

    update(): void {
        if (this.resumeKey.isDown) {
            this.scene.stop()
            this.scene.resume('GameScene');
        }
    }
}
