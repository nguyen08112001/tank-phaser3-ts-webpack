import { Bullet, BulletsPool } from '../Bullet'
import { IImageConstructor } from '../../interfaces/image.interface'
import eventsCenter from '../../scenes/EventsCenter'

export class Enemy extends Phaser.GameObjects.Container {
  body: Phaser.Physics.Arcade.Body

  // variables
  protected currentHealth: number
  protected maxHealth: number
  protected nextShoot: number
  protected damage: number
  protected bulletTexture: string
  protected deadPoint: number
  protected shootingDelayTime: number
  private canShoot: boolean

  // children
  protected tank: Phaser.GameObjects.Image
  protected barrel: Phaser.GameObjects.Image
  protected lifeBar: Phaser.GameObjects.Graphics
  private targetHudCircle: Phaser.GameObjects.Image

  // game objects
  protected tween: Phaser.Tweens.Tween
  private bullets: BulletsPool
  private explosionSound: Phaser.Sound.BaseSound
  private whiteSmoke: Phaser.GameObjects.Particles.ParticleEmitter
  private darkSmoke: Phaser.GameObjects.Particles.ParticleEmitter
  private fire: Phaser.GameObjects.Particles.ParticleEmitter

  getBarrel(): Phaser.GameObjects.Image {
    return this.barrel
  }

  getBullets(): Phaser.GameObjects.Group {
    return this.bullets
  }

  setDying() {
    this.lifeBar.setScale(1)
    this.targetHudCircle.setVisible(false)
    this.body.checkCollision.none = true
    this.createDeadEffectAndSetActive()
    eventsCenter.emit('enemy-dead', this.x, this.y, this.deadPoint)
  }

  gotHitWithDamage(_x: number, _y: number, _damage: number): void {
    this.currentHealth -= _damage
    if (this.currentHealth < 0) {
      this.currentHealth = 0;
      this.setDying()
    }
    this.createGotHitEffect(_x, _y)
    this.reDrawLifeBar()
  }

  protected initProperties() {
    // variables
    this.currentHealth = this.maxHealth = 1
    this.nextShoot = 0
    this.damage = 0.05
    this.shootingDelayTime = 400
    this.canShoot = false
  }

  protected init() {
    this.initContainer()

    this.initProperties()

    this.initWeapons()

    this.initBehavior()
  }

  protected initBehavior() {
    // tweens
    this.tween = this.scene.tweens.add({
      targets: this,
      props: { y: this.y - 200 },
      delay: 0,
      duration: 2000,
      ease: 'Linear',
      easeParams: null,
      hold: 0,
      repeat: -1,
      repeatDelay: 0,
      yoyo: true
    })
  }
  
  protected initContainer() {
    // image
    this.tank = this.scene.add.image(0, 0, 'tankRed')
    this.add(this.tank)
    this.setDepth(0)

    this.barrel = this.scene.add.image(0, 0, 'barrelRed')
    this.barrel.setOrigin(0.5, 1)
    this.barrel.setDepth(0)
    this.add(this.barrel)

    //sound
    this.explosionSound = this.scene.sound.add('explosion')

    this.targetHudCircle = this.scene.add.image(0, 0, 'hud-target-red').setScale(0.5).setVisible(false)
    this.scene.tweens.add({
      targets: this.targetHudCircle,
      duration: 1000,
      angle: 90,
      ease: 'Power0',
      yoyo: true,
      repeat: -1
    })
    this.add(this.targetHudCircle)

    this.lifeBar = this.scene.add.graphics().setDepth(10)
    this.add(this.lifeBar)

    // physics
    this.scene.physics.world.enable(this)

  }
  protected initWeapons() {
    // game objects
    this.bullets = new BulletsPool(this.scene, {
      texture: this.bulletTexture || 'bulletRed',
      damage: this.damage,
      PoolMaxSize: 5
    })
  }

  constructor(aParams: IImageConstructor) {
    super(aParams.scene, aParams.x, aParams.y)
    // this.init();
    this.scene.add.existing(this)
    this.setSize(80, 80)

    this.setInteractive(new Phaser.Geom.Circle(0, 0, 150), Phaser.Geom.Circle.Contains)
    this.createHandleEventsCenter();

    // this.scene.time.addEvent({
    //   delay: 1000,
    //   callback: () => {
        
    //   },
    //   repeat: -1
    // })
  }
  

  update(_playerX: number, _playerY: number): void {
    this.updateShootingStatus()
    if (this.active) {
      this.updateTankImage(_playerX, _playerY)
      this.handleShooting()
    } else {
      this.destroy()
    }
  }

  private createHandleEventsCenter() {
    eventsCenter.on('enemy-over', (gameObject: any) => {
      if (this == gameObject) {
        this.targetHudCircle.setVisible(true)
        this.lifeBar.setScale(2)
      }
    })

    eventsCenter.on('enemy-out', (gameObject: any) => {
      if (this == gameObject) {
        this.targetHudCircle.setVisible(false)
        this.lifeBar.setScale(1)
      }
    })

    this.once('destroy', this.onDestroy, this)
  }
  private updateShootingStatus() {
    this.setCanShoot(this.scene.cameras.main.worldView.contains(this.x, this.y))
  }

  private onDestroy() {
    this.barrel.destroy()
    this.lifeBar.destroy()
  }

  private updateTankImage(_playerX: number, _playerY: number) {
    // this.updateLifeBar()
    this.updateBarrel(_playerX, _playerY)
    this.updateSmokeEffect()
  }

  private updateSmokeEffect() {
    if (this.currentHealth <= 0) {
      this.stopAllSmokeEffect()
    }
    if (this.currentHealth / this.maxHealth <= 0.7) {
      this.createSmoke()
    }
    if (this.currentHealth / this.maxHealth <= 0.4) {
      this.whiteSmoke.stop()
      this.darkSmoke.stop()
      this.createFireEffect()
    }
  }

  private setCanShoot(_canShoot: boolean) {
    this.canShoot = _canShoot
  }

  private updateBarrel(_playerX: number, _playerY: number) {
    if (this.active) {
      let angle = Phaser.Math.Angle.Between(this.body.x, this.body.y, _playerX, _playerY)
      this.getBarrel().angle = (angle + Math.PI / 2) * Phaser.Math.RAD_TO_DEG
    }
  }

  private handleShooting(): void {
    if (!this.canShoot) return
    if (this.scene.time.now > this.nextShoot) {
      let bullet = this.bullets.get(this.x, this.y) as Bullet

      if (bullet) {
        //if bullet exists
        bullet.reInitWithAngle(this.barrel.rotation)

        this.nextShoot = this.scene.time.now + this.shootingDelayTime
      }
    }
  }

  private reDrawLifeBar(): void {
    this.lifeBar.clear()
    this.lifeBar.fillStyle(0xe66a28, 1)
    this.lifeBar.fillRect(
      -this.tank.width / 2,
      this.tank.height / 2,
      (this.tank.width * this.currentHealth) / this.maxHealth,
      15
    )
    this.lifeBar.lineStyle(2, 0xffffff)
    this.lifeBar.strokeRect(-this.tank.width / 2, this.tank.height / 2, this.tank.width, 15)
    this.lifeBar.setDepth(0)
  }

  private createDeadEffectAndSetActive() {
    this.tween.stop()

    this.scene.tweens.add({
      targets: this,
      props: {
        scaleX: 2,
        scaleY: 2
      },
      ease: 'Sine.easeInOut',
      duration: 300,
      onComplete: () => {
        this.explosionSound.play()
        this.currentHealth = 0
        this.active = false
      }
    })

    let particles = this.scene.add.particles('flares').createEmitter({
      frame: 'red',
      x: this.x,
      y: this.y,
      lifespan: { min: 600, max: 800 },
      angle: { start: 0, end: 360, steps: 64 },
      speed: 200,
      quantity: 64,
      scale: { start: 0.2, end: 0.1 },
      frequency: 32,
      blendMode: 'ADD'
    })

    this.scene.time.delayedCall(100, () => {
      particles.stop()
    })
  }

  private stopAllSmokeEffect() {
    this.fire?.stop()
    this.whiteSmoke?.stop()
    this.darkSmoke?.stop()
  }

  private createGotHitEffect(_x: number, _y: number) {
    let emitter = this.scene.add
      .particles('red-spark')
      .createEmitter({
        x: _x,
        y: _y,
        speed: { min: -800, max: 800 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0, ease: 'Power4' },
        blendMode: 'ADD',
        //active: false,
        lifespan: 200,
        gravityY: 800
      })
      .explode(10, _x, _y)
  }

  private createFireEffect() {
    if (this.fire) return

    this.fire = this.scene.add.particles('fire').createEmitter({
      alpha: { start: 1, end: 0 },
      scale: { start: 0.5, end: 2.5 },
      tint: { start: 0xff945e, end: 0xff945e },
      speed: 20,
      accelerationY: -300,
      angle: { min: -85, max: -95 },
      rotate: { min: -180, max: 180 },
      lifespan: { min: 1000, max: 1100 },
      blendMode: 'ADD',
      frequency: 110,
      follow: this
    })
  }
  private createSmoke() {
    if (this.whiteSmoke) return

    this.whiteSmoke = this.scene.add.particles('white-smoke').createEmitter({
      x: 400,
      y: 300,
      speed: { min: 20, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0, end: 0.5 },
      lifespan: 2000,
      //active: false,
      follow: this
    })
    this.whiteSmoke.reserve(1000)

    this.darkSmoke = this.scene.add.particles('dark-smoke').createEmitter({
      x: 400,
      y: 300,
      speed: { min: 20, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0, end: 0.1 },
      blendMode: 'SCREEN',
      lifespan: 2000,
      //active: false
      follow: this
    })
    this.darkSmoke.reserve(1000)
  }
}
