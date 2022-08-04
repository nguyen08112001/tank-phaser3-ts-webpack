import { Bullet, BulletsPool } from './Bullet'
import { IImageConstructor } from '../interfaces/image.interface'
import { GameScene } from '../scenes/GameScene'
import { Bomb, BombsPool } from './Bomb'
import eventsCenter from '../scenes/EventsCenter'
import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick.js'

export class Player extends Phaser.GameObjects.Container {
  body: Phaser.Physics.Arcade.Body

  // variables
  private currentHealth: number
  private maxHealth: number
  private nextShoot: number
  private speed: number
  private nextBomb: number
  private damage: number
  private shootingDelayTime: number
  private increaseHealthWhenEnemyDead: number
  private bombingDelayTime: number

  // children
  private barrel: Phaser.GameObjects.Image
  private lifeBar: Phaser.GameObjects.Graphics
  private tank: Phaser.GameObjects.Image

  // game objects
  private bullets: BulletsPool
  private bombs: BombsPool

  // input
  private spaceKey: Phaser.Input.Keyboard.Key
  private moveJoystick: VirtualJoystick
  private shootingJoystick: VirtualJoystick
  private isMobileDevice: boolean

  //sound
  private shootSound: Phaser.Sound.BaseSound
  private hitSound: Phaser.Sound.BaseSound

  //utils
  private _shield: Phaser.GameObjects.Sprite
  private hasShield: boolean
  private circleAround: Phaser.GameObjects.Arc
  private lineToPointer: Phaser.Geom.Line

  //effect
  private whiteSmoke: Phaser.GameObjects.Particles.ParticleEmitter
  private darkSmoke: Phaser.GameObjects.Particles.ParticleEmitter
  private fireEffect: Phaser.GameObjects.Particles.ParticleEmitter
  private healingParticles: Phaser.GameObjects.Particles.ParticleEmitterManager
  private healingEmitter: Phaser.GameObjects.Particles.ParticleEmitter
  private shootingTween: Phaser.Tweens.Tween


  //UI
  private circleMove: Phaser.Geom.Circle
  private arrowMove: Phaser.GameObjects.Image

  getBullets(): Phaser.GameObjects.Group {
    return this.bullets
  }

  gotHitWithDamage(_x: number, _y: number, _dame: number): void {
    if (this.getShield()) return

    this.currentHealth -= _dame
    this.hitSound.play()
    this.scene.cameras.main.shake(20, 0.005)

    this.createGotHitEffect(_x, _y)
  }

  getBombs() {
    return this.bombs
  }

  setShield(shield: boolean) {
    this._shield.setVisible(shield)
    this.hasShield = shield
  }

  getShield() {
    return this.hasShield
  }

  isDead() {
    return !this.active
  }

  update(): void {
    this.updateLifebar()
    this.handleInput()
    this.updateEffectState()
  }

  constructor(aParams: IImageConstructor) {
    super(aParams.scene, aParams.x, aParams.y)

    this.createContainer(aParams.texture)
    this.createProperties()
    this.createWeaponObject()
    this.createEffect()
    this.createSound()
    this.createInput()
    this.createPhysic()
    this.createHandleEvents()
    this.createCircleMoveUtil()

    this.scene.add.existing(this)

    //debug
    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        // this.currentHealth = this.maxHealth * 0.1
      },
      repeat: -1
    })
  }

  private createEffect() {
    this.createHealingEffect();
    this.createShootingEffect();
    this.createFireEffect();
    this.createSmokeEffect();
  }

  private createHandleEvents() {
    eventsCenter.on('enemy-dead', this.handleEnemyDead, this)
  }

  private handleEnemyDead() {
    this.currentHealth += this.increaseHealthWhenEnemyDead
    if (this.currentHealth > this.maxHealth) {
      this.currentHealth = this.maxHealth
    }
    this.playHealingEffect()
  }

  private createPhysic() {
    // physics
    this.scene.physics.world.enable(this)
    this.body.setOffset(-30, -30)
  }
  private createInput() {
    // input
    this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    if (this.scene.sys.game.device.input.touch) {
      this.isMobileDevice = true

      this.scene.input.addPointer(1)
      this.moveJoystick = this.createJoyStick(-this.scene.sys.canvas.width * 0.2, this.scene.sys.canvas.height)
      this.shootingJoystick = this.createJoyStick(this.scene.sys.canvas.width * 1.2, this.scene.sys.canvas.height)

      this.moveJoystick.setVisible(true)
      this.shootingJoystick.setVisible(true)
    }
  }

  private createJoyStick(x: number, y: number) {
    var base = this.scene.add.image(0, 0, 'baseJoystick').setOrigin(0.5, 0.5)
    var thump = this.scene.add.image(0, 0, 'thumpJoystick').setOrigin(0.5, 0.5)
    return new VirtualJoystick(this.scene, {
      x: x,
      y: y,
      radius: 50,
      base: base,
      thumb: thump
    })
  }

  private createSound() {
    //sound
    this.shootSound = this.scene.sound.add('shoot')
    this.hitSound = this.scene.sound.add('hit')
  }
  private createProperties() {
    this.currentHealth = this.maxHealth = 2
    this.nextShoot = 0
    this.nextBomb = 0
    this.speed = 300
    this.damage = 0.05
    this.shootingDelayTime = 80
    this.setShield(false)
    this.increaseHealthWhenEnemyDead = 0.5
    this.bombingDelayTime = 1000
  }

  private createWeaponObject() {
    this.createBombsPool()
    this.createBulletsPool()
  }

  private createBombsPool() {
    this.bombs = new BombsPool(this.scene)
  }

  private createBulletsPool() {
    this.bullets = new BulletsPool(this.scene, {
      texture: 'bulletBlue',
      damage: this.damage,
      PoolMaxSize: 10
    })

    this.getBullets().children.iterate(bullet => {
      var _bullet = bullet as Bullet
      _bullet.createFireEffect('blue')
    })
  }

  private createContainer(texture: string) {
    //blue circle
    this.circleAround = this.scene.add.circle(0, 0, 100, 0x0000ff).setAlpha(0.1)
    this.circleAround.setStrokeStyle(1, 0x1a65ac)
    this.add(this.circleAround)

    //tank
    this.tank = this.scene.add.image(0, 0, texture)
    this.tank.setOrigin(0.5, 0.5)
    this.tank.angle = 180
    this.add(this.tank)

    // barrel
    this.barrel = this.scene.add.image(0, 0, 'barrelBlue')
    this.barrel.setOrigin(0.5, 1)
    this.barrel.angle = 180
    this.add(this.barrel)

    //lifebar
    this.lifeBar = this.scene.add.graphics()
    this.add(this.lifeBar)

    //shield
    this._shield = this.scene.add.sprite(0, 0, 'shield').setOrigin(0.5, 0.5).setScale(0.3)
    this.scene.tweens.add({
      targets: this._shield,
      duration: 1000,
      angle: 90,
      ease: 'Power0',
      yoyo: true,
      repeat: -1
    })
    this.add(this._shield)

    this.arrowMove = this.scene.add.image(0, 0, 'move-arrow').setScale(0.15).setOrigin(0.5, 2)
    this.add(this.arrowMove)

    this.setDepth(1)
  }

  private createCircleMoveUtil() {
    this.lineToPointer = new Phaser.Geom.Line(
      this.x,
      this.y,
      this.scene.input.activePointer.worldX,
      this.scene.input.activePointer.worldY
    )

    this.circleMove = new Phaser.Geom.Circle(this.x, this.y, 100)
  }

  private handleBomb() {
    if (this.spaceKey.isDown && this.scene.time.now > this.nextBomb) {
      let bomb = this.bombs.get(this.x, this.y) as Bomb

      if (bomb) {
        //if bomb exists
        eventsCenter.emit('change-score', bomb.getDecreaseScore())

        this.playShootingEffect()

        bomb.reInitWithAngle(this.barrel.rotation)

        this.nextBomb = this.scene.time.now + this.bombingDelayTime
      }
    }
  }

  private handleInput() {

    this.updateArrowMove()
    this.updateBarrel()

    this.handleMove()
    this.handleShooting()
    this.handleBomb()

  }
  private updateArrowMove() {
    if (this.isMobileDevice) {
      let angle = this.tank.rotation
      this.arrowMove.angle = (angle + (Math.PI / 2) * 2) * Phaser.Math.RAD_TO_DEG
    } else {
      this.lineToPointer.setTo(
        this.x,
        this.y,
        this.scene.input.activePointer.worldX,
        this.scene.input.activePointer.worldY
      )

      this.circleMove.setPosition(this.x, this.y)

      let intersectPoint = Phaser.Geom.Intersects.GetLineToCircle(this.lineToPointer, this.circleMove)
      let angle = Phaser.Math.Angle.Between(intersectPoint[0]?.x, intersectPoint[0]?.y, this.x, this.y)

      this.arrowMove.angle = (angle + (Math.PI / 2) * 3) * Phaser.Math.RAD_TO_DEG
    }
  }

  private handleMove() {
    if (this.isMobileDevice) {
      if (this.moveJoystick?.force != 0) {
        this.tank.rotation = this.moveJoystick?.rotation - Phaser.Math.DegToRad(90)
        this.scene.physics.velocityFromRotation(this.moveJoystick.rotation, this.speed, this.body.velocity)
      } else {
        this.body.setVelocity(0)
      }
    } else {
      this.tank.rotation = this.barrel.rotation
      this.scene.physics.velocityFromRotation(
        this.barrel.rotation - Phaser.Math.DegToRad(90),
        this.speed,
        this.body.velocity
      )
    }
  }

  private updateBarrel() {
    if (this.shootingJoystick !== undefined) {
      if (this.shootingJoystick.force != 0) {
        this.barrel.rotation = this.shootingJoystick.rotation + Phaser.Math.DegToRad(90)
      }
    } else {
      this.barrel.rotation =
        Phaser.Math.Angle.Between(
          this.x,
          this.y,
          this.scene.input.activePointer.worldX,
          this.scene.input.activePointer.worldY
        ) +
        Math.PI / 2
    }
  }

  private handleShooting(): void {
    if (this.isMobileDevice) {
      this.handleShootingMobile()
    } else {
      this.handleShootingPC()
    }
  }
  private handleShootingMobile() {
    if (
      this.shootingJoystick !== undefined &&
      this.shootingJoystick?.force !== 0 &&
      this.scene.time.now > this.nextShoot
    ) {
      let bullet = this.bullets.get(this.x, this.y) as Bullet

      if (bullet) {
        //if bullet exists
        eventsCenter.emit('change-score', -1)

        this.shootSound.play({
          volume: 0.3
        })

        this.playShootingEffect()
        bullet.reInitWithAngle(this.barrel.rotation)

        this.nextShoot = this.scene.time.now + this.shootingDelayTime
      }
    }
  }
  private handleShootingPC() {
    if (this.scene.input.activePointer.isDown) {
      this.speed = -100
      if (this.scene.time.now <= this.nextShoot) return
      let bullet = this.bullets.get(this.x, this.y) as Bullet

      if (bullet) {
        //if bullet exists
        eventsCenter.emit('change-score', -1)

        this.shootSound.play({
          volume: 0.3
        })

        this.playShootingEffect()
        bullet.reInitWithAngle(this.barrel.rotation)

        this.nextShoot = this.scene.time.now + this.shootingDelayTime
      }
    } else {
      this.speed = 300
    }
  }

  private createShootingEffect() {
    this.shootingTween = this.scene.tweens.add({
      targets: [this.tank, this.barrel],
      props: { alpha: 0.8 },
      duration: 100,
      ease: 'Power1',
      yoyo: true,
      onComplete: () => {
        this.tank.setAlpha(1)
        this.barrel.setAlpha(1)
      }
    })
  }

  private playShootingEffect() {
    this.shootingTween.play();
  }

  private updateLifebar(): void {
    if (this.isDead()) {
      this.lifeBar.destroy()
    }
    this.lifeBar.clear()
    this.lifeBar.fillStyle(0x1ea7e1, 1)
    this.lifeBar.fillRect(
      -this.tank.width / 2,
      this.tank.height / 2,
      (this.tank.width * this.currentHealth) / this.maxHealth,
      15
    )
    this.lifeBar.lineStyle(2, 0xffffff)
    this.lifeBar.strokeRect(-this.tank.width / 2, this.tank.height / 2, this.tank.width, 15)
  }

  private createGotHitEffect(_x: number, _y: number) {
    this.setAlpha(0)

    this.scene.tweens.add({
      targets: this,
      props: {
        alpha: 1
      },
      duration: 150
    })

    let emitter = this.scene.add.particles('blue-spark').createEmitter({
      x: _x,
      y: _y,
      speed: { min: -800, max: 800 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD',
      lifespan: 200,
      gravityY: 800
    })
    this.scene.time.delayedCall(200, () => {
      emitter.stop()
    })
  }

  private setDead() {
    this.active = false
    this.visible = false
    eventsCenter.emit('player-dead')
  }

  private stopAllEffect() {
    this.fireEffect?.stop()
    this.darkSmoke?.stop()
    this.whiteSmoke?.stop()
  }

  private createFireEffect() {
    this.fireEffect = this.scene.add.particles('fire')
    .setDepth(10)
    .createEmitter({
      alpha: { start: 1, end: 0 },
      scale: { start: 0.5, end: 2.5 },
      tint: { start: 0xff945e, end: 0xff945e },
      speed: { min: 20, max: 100 },
      angle: { min: -85, max: -95 },
      rotate: { min: -180, max: 180 },
      lifespan: { min: 1000, max: 1100 },
      blendMode: 'ADD',
      frequency: 110,
      follow: this,
      on: false,
    })
  }

  private playFireEffect() {
    this.fireEffect.on = true
  }

  private createSmokeEffect() {
    this.whiteSmoke = this.scene.add.particles('white-smoke').setDepth(10).createEmitter({
      speed: { min: 20, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0, end: 0.5 },
      lifespan: 2000,
      follow: this,
      on: false
    })
    this.whiteSmoke.reserve(1000)

    this.darkSmoke = this.scene.add.particles('dark-smoke').createEmitter({
      speed: { min: 20, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0, end: 0.1 },
      blendMode: 'SCREEN',
      lifespan: 2000,
      follow: this,
      on: false
    })
    this.darkSmoke.reserve(1000)
  }

  private playSmokeEffect() {
    this.whiteSmoke.on = true
    this.darkSmoke.on = true
  }

  private stopSmokeEffect() {
    this.whiteSmoke?.stop()
    this.darkSmoke?.stop()
  }

  private updateEffectState() {
    if (this.currentHealth > 0) {
      if (0.7 < this.currentHealth / this.maxHealth && this.currentHealth / this.maxHealth <= 1) {
        this.stopAllEffect()
      }
      if (0.4 < this.currentHealth / this.maxHealth && this.currentHealth / this.maxHealth <= 0.7) {
        this.fireEffect?.stop()
        this.playSmokeEffect()
      }
      if (this.currentHealth / this.maxHealth <= 0.4) {
        this.stopSmokeEffect()
        this.playFireEffect()
      }
    } else {
      this.stopAllEffect()
      this.setDead()
    }
  }

  private createHealingEffect() {
    this.healingParticles = this.scene.add.particles('healing-effect')
    this.healingEmitter = this.healingParticles.createEmitter({
      x: { min: -100, max: 100 },
      y: { min: -100, max: 100 },
      lifespan: 500,
      speedY: { min: -200, max: -400 },
      scale: { start: 0.05, end: 0 },
      quantity: 1,
      blendMode: 'ADD'
    })
    this.healingEmitter.stop()
    this.add(this.healingParticles)
  }

  private playHealingEffect() {
    this.healingEmitter.start()
    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        this.healingEmitter.stop()
      }
    })
  }
}
