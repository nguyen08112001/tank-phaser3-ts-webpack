import { IImageConstructor } from '../../interfaces/image.interface'
import { Enemy } from './Enemy'

export class HugeTank extends Enemy {
  constructor(aParams: IImageConstructor) {
    super(aParams)
    super.initProperties()
    this.customParentProperties()
    super.init()
    super.initBehavior()
    this.customConfig()
    super.initWeapons()
  }

  private customParentProperties() {
    this.deadPoint = 200
    this.damage /= 2
    this.currentHealth = this.maxHealth = 2
  }

  private customConfig() {
    this.tank.setTint(0x5a5a5a)
    this.barrel.setTint(0x5a5a5a)
    this.setScale(1.5)
  }
}
