import { IImageConstructor } from '../interfaces/image.interface'

export class Shield extends Phaser.GameObjects.Image {
  body: Phaser.Physics.Arcade.Body

  constructor(aParams: IImageConstructor) {
    super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame)

    this.init()
    this.scene.add.existing(this)
  }

  private init() {
    // image
    this.setScale(0.15)

    // physics
    this.scene.physics.world.enable(this)
    this.body.setSize(500, 500)

    //tween
    this.scene.tweens.add({
      targets: this,
      scale: 0.2,
      ease: 'Power0',
      yoyo: true,
      duration: 500,
      repeat: -1
    })
  }

  update(): void {}
}
