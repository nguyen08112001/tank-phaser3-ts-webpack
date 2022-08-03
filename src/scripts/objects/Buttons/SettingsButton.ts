import { IImageConstructor } from '../../interfaces/image.interface'
import eventsCenter from '../../scenes/EventsCenter'
import { Button } from './Button'

export class SettingsButton extends Button {
  body: Phaser.Physics.Arcade.Body

  constructor(aParams: IImageConstructor) {
    super(aParams)
    this.scene.add.existing(this)
  }

  public handlePointerDown() {
    eventsCenter.emit('pause-game')
  }

  update(): void {}
}
