import { NewGameButton } from '../objects/Buttons/NewGameButton'
export class MenuScene extends Phaser.Scene {
  private startKey: Phaser.Input.Keyboard.Key
  private bitmapTexts: Phaser.GameObjects.BitmapText[] = []

  constructor() {
    super({
      key: 'MenuScene'
    })
  }

  init(): void {
    this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    this.startKey.isDown = false
  }

  create(): void {
    this.add.image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'start')

    new NewGameButton({
      scene: this,
      x: this.sys.canvas.width / 2,
      y: this.sys.canvas.height - 200,
      texture: 'play-button'
    })

    this.bitmapTexts.push(
      this.add
        .bitmapText(this.sys.canvas.width / 2.8, this.sys.canvas.height - 100, 'font', 'PRESS S TO PLAY', 30)
        .setTintFill(0xffffff)
    )

    this.registry.set('time', 400)
    this.registry.set('score', 0)
  }

  update(): void {
    this.scene.start('GameScene')

    if (this.startKey.isDown) {
      this.scene.start('GameScene')
    }
  }
}
