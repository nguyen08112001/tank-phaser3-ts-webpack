import { IImageConstructor } from '../../interfaces/image.interface'
import { Bullet } from '../Bullet'
import { Enemy } from './Enemy'

export class BigDamageTank extends Enemy {
  constructor(aParams: IImageConstructor) {
    super(aParams)
    super.initProperties()
    this.customParentProperties()
    super.initContainer()
    this.customContainer()
    super.initWeapons()
    this.customWeapons()
    super.initBehavior()
    this.customBehavior()
  }
  private customBehavior() {
    this.tween = this.scene.tweens.add({
      targets: this,
      props: { y: this.y - 200 },
      delay: 0,
      duration: 1000,
      ease: 'Linear',
      easeParams: null,
      hold: 0,
      repeat: -1,
      repeatDelay: 0,
      yoyo: true
    })
  }
  private customContainer() {
    this.barrel.setScale(1.5)
  }
  private customParentProperties() {
    this.deadPoint = 200
    this.damage = 0.1
    this.bulletTexture = 'lightning-ball'
  }
  private customWeapons() {
    this.getBullets().children.iterate(bullet => {
      var _bullet = bullet as Bullet
      _bullet.createFireEffect('blue')
      // _bullet.setTexture('shield-white'),
      _bullet.setDisplaySize(100, 100)
      _bullet.body.setSize(500, 500)
    })
  }
}
