import { IImageConstructor } from '../../interfaces/image.interface'
import { Button } from './Button'

export class PlayButton extends Button {
  body: Phaser.Physics.Arcade.Body

  constructor(aParams: IImageConstructor) {
    super(aParams)
    this.scene.add.existing(this)
  }

  public handlePointerDown() {
    this.scene.scene.stop()
    let gameScene = this.scene.scene.get('GameScene')
    gameScene.cameras.main.setAlpha(1)
    this.scene.cameras.main.setAlpha(1)
    this.scene.scene.resume('GameScene')
  }

  update(): void {}
}
