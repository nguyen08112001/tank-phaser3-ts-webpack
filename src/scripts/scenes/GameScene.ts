import { Player } from '../objects/Player'
import { Enemy } from '../objects/Enemies/Enemy'
import { Obstacle } from '../objects/obstacles/Obstacle'
import { Bullet } from '../objects/Bullet'
import { Shield } from '../objects/Shield'
import { Box } from '../objects/obstacles/Box'
import eventsCenter from './EventsCenter'
import { SettingsButton } from '../objects/Buttons/SettingsButton'
import { BigDamageTank } from '../objects/Enemies/BigDamageTank'
import { HugeTank } from '../objects/Enemies/HugeTank'
import { GhostTank } from '../objects/Enemies/GhostTank'

const kindOfEnemy: string[] = ['BigDamageTank', 'HugeTank', 'GhostTank']
export class GameScene extends Phaser.Scene {
  //map
  private map: Phaser.Tilemaps.Tilemap
  private tileset: Phaser.Tilemaps.Tileset
  private layer: Phaser.Tilemaps.TilemapLayer

  //objects
  private player: Player
  private enemies: Phaser.GameObjects.Group
  private obstacles: Phaser.GameObjects.Group
  private minimap: Phaser.Cameras.Scene2D.Camera
  private boxes: Phaser.GameObjects.Group
  private shield: Shield

  //UI
  private scoreText: Phaser.GameObjects.BitmapText
  private score: number

  constructor() {
    super({
      key: 'GameScene'
    })
  }

  preload(): void {
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.time.timeScale = 1
      this.tweens.timeScale = 1
    })
  }

  init() {
    this.scene.run('particle-effects')
    this.score = 0
  }

  create(): void {
    this.cameras.main.fadeIn()

    this.createMap()
    this.createObjectFromTileMap()
    this.createColliderAndOverlap()
    this.createUI()
    this.setSound()
    // this.createMiniMap()
    this.createMainCamera()
    this.initEventListener()
  }

  update(): void {
    console.log(window.innerWidth, window.innerHeight)
    this.updateScore()

    this.player.update()

    this.enemies.children.each((enemy: any) => {
      enemy.update(this.player.body.x, this.player.body.y)
    }, this)

    // this.updateMiniMap();
  }

  private createMainCamera() {
    this.cameras.main.startFollow(this.player)
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
    this.cameras.main.setZoom(0.4)
  }

  private createMiniMap() {
    this.minimap = this.cameras.add(0, 10, 400, 400).setZoom(0.2).setName('mini').setAlpha(0.8)
    this.minimap.setBackgroundColor(0x002244)
    this.minimap.scrollX = 1600
    this.minimap.scrollY = 300

    this.minimap.ignore(this.scoreText)
  }
  private createUI() {
    this.input.setDefaultCursor('url(./assets/blue.cur), pointer')
    this.createButton()
    this.createScoreText()
  }
  private createButton() {
    new SettingsButton({
      scene: this,
      x: this.sys.canvas.width - 60,
      y: 60,
      texture: 'settings-button'
    }).setScrollFactor(0, 0)
  }

  private createScoreText() {
    //add score text
    this.scoreText = this.add.bitmapText(this.sys.canvas.width / 4 + 50, 50, 'font', 'SCORE: 0', 30)
    this.scoreText.setScrollFactor(0, 0)
    this.scoreText.setTintFill(0xffffff)
  }
  private createColliderAndOverlap() {
    // collider layer and obstacles
    this.physics.add.collider(this.player, this.layer)
    this.physics.add.collider(this.player, this.obstacles)

    this.physics.add.collider(this.enemies, this.layer)
    this.physics.add.collider(this.enemies, this.obstacles)

    this.physics.add.collider(this.player.getBombs(), this.layer)

    // collider for bullets
    this.physics.add.collider(this.player.getBullets(), this.layer, this.bulletHitLayer)

    this.physics.add.collider(this.player.getBullets(), this.obstacles, this.bulletHitObstacles)

    this.enemies.children.each((enemy: any) => {
      this.physics.add.overlap(this.player.getBullets(), enemy, this.playerBulletHitEnemy)
      this.physics.add.overlap(enemy.getBullets(), this.player, this.enemyBulletHitPlayer)

      this.physics.add.collider(enemy.getBullets(), this.obstacles, this.bulletHitObstacles)
      this.physics.add.collider(enemy.getBullets(), this.layer, this.bulletHitLayer)

      this.physics.add.collider(this.boxes, enemy.getBullets(), (_barrel: any, _bullet: any) => {
        _bullet.gotHit()
        _barrel.gotDamage(_bullet.x, _bullet.y, _bullet.getDamage())
      })
    }, this)

    this.physics.add.collider(this.boxes, this.player.getBullets(), (_barrel: any, _bullet: any) => {
      _bullet.gotHit()
      _barrel.gotDamage(_bullet.x, _bullet.y, _bullet.getDamage())
    })

    this.physics.add.overlap(this.player, this.shield, () => {
      this.player.setShield(true)
      this.time.addEvent({
        delay: 5000,
        callback: () => {
          this.player.setShield(false)
        }
      })
      this.shield.destroy()
    })
  }

  private createMap() {
    // create tilemap from tiled JSON
    this.map = this.make.tilemap({ key: 'levelMap' })

    this.tileset = this.map.addTilesetImage('tiles')
    this.layer = this.map.createLayer('tileLayer', this.tileset, 0, 0)
    this.layer.setCollisionByProperty({ collide: true })
  }

  private initEventListener() {
    eventsCenter.on('bomb-explode', this.createBombExplodeZone, this)
    eventsCenter.on('update-sound', this.setSound, this)
    eventsCenter.on('player-dead', this.setGameOver, this)
    eventsCenter.on('enemy-dead', this.handleEnemyDead, this)
    eventsCenter.on('pause-game', this.setPauseGame, this)
    eventsCenter.on('change-score', this.changeScoreWithAmount, this)

    // clean up when Scene is shutdown
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventsCenter.removeAllListeners()
    })
  }
  private changeScoreWithAmount(_amount: number) {
    if (this.score > 0) {
      this.score += _amount
    }
  }

  private handleEnemyDead(_x: number, _y: number, _point: number) {
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.score += _point
        this.tweens.add({
          targets: this.scoreText,
          props: {
            scale: 2
          },
          ease: 'Sine.easeInOut',
          duration: 300,
          yoyo: true
        })
      }
    })

    const particleEffects = this.scene.get('particle-effects')
    particleEffects.events.emit('trail-to', {
      fromX: _x,
      fromY: _y,
      toX: 450 + 200,
      toY: 50
    })

    this.checkVictory()
  }
  private checkVictory() {
    if (this.enemies.countActive() === 1) {
      this.physics.world.timeScale = 10
      this.time.timeScale = 10
      this.cameras.main.setAlpha(0.5)
      this.scene.launch('VictoryScene', { score: this.score + 100 })
    }
  }

  private setGameOver() {
    this.physics.world.timeScale = 10
    this.time.timeScale = 10
    this.tweens.timeScale = 0.5
    this.cameras.main.setAlpha(0.5)
    this.scene.launch('GameOverScene')
  }

  private createBombExplodeZone(_x: number, _y: number, _width: number, _height: number, _damage: number) {
    console.log(_width, _height)
    let zone = this.add.zone(_x, _y, _width, _height)
    this.physics.world.enable(zone, 1) // (0) DYNAMIC (1) STATIC

    this.physics.add.overlap(this.enemies, zone, (_enemy: any, _zone: any) => {
      zone.destroy()
      _enemy.gotDamage(_x, _y, _damage)
    })

    this.physics.add.overlap(this.player, zone, () => {
      zone.destroy()
      this.player.gotHitWithDamage(_x, _y, _damage)
    })

    this.time.addEvent({
      delay: 20,
      callback: () => {
        zone.destroy()
      }
    })
  }

  private setSound() {
    if (this.registry.get('hasSound')) {
      this.sound.volume = 1
    } else {
      this.sound.volume = 0
    }
  }

  private updateMiniMap() {
    this.minimap.scrollX = Phaser.Math.Clamp(this.player.x - 200, 800, 2000)
    this.minimap.scrollY = Phaser.Math.Clamp(this.player.y - 200, 800, 1200)
  }

  private updateScore() {
    this.scoreText.text = 'SCORE: ' + this.score
  }

  private createObjectFromTileMap(): void {
    this.obstacles = this.add.group({
      /*classType: Obstacle,*/
      runChildUpdate: true
    })

    this.enemies = this.add.group({
      /*classType: Enemy*/
    })

    this.boxes = this.add.group({
      /*classType: Enemy*/
      runChildUpdate: true
    })

    // find the object layer in the tilemap named 'objects'
    const objects = this.map.getObjectLayer('objects').objects as any[]

    objects.forEach(object => {
      switch (object.type) {
        case 'player':
          this.createNewPlayer(object.x, object.x)
          break
        case 'enemy':
          this.createNewEnemy(object.x, object.y)
          break
        case 'barrelGreyTop':
        case 'barrelGreySideRust':
        case 'barrelRedTop':
          this.createNewBox(object.x, object.y, object.type)
          break
        case 'shield':
          this.createNewShield(object.x, object.y)
          break
        default:
          this.createNewObstacle(object.x, object.y, object.type)
          break
      }
    })
  }

  private createNewObstacle(_x: number, _y: number, _type: string) {
    let obstacle = new Obstacle({
      scene: this,
      x: _x,
      y: _y - 40,
      texture: _type
    })

    this.obstacles.add(obstacle)
  }

  private createNewShield(_x: number, _y: number) {
    this.shield = new Shield({
      scene: this,
      x: _x,
      y: _y,
      texture: 'shield'
    })
  }

  private createNewBox(_x: number, _y: number, _type: string) {
    let box = new Box({
      scene: this,
      x: _x,
      y: _y - 40,
      texture: _type
    })
    this.boxes.add(box)
  }

  private createNewEnemy(_x: number, _y: number) {
    let enemy

    switch (kindOfEnemy[Math.floor(Math.random() * kindOfEnemy.length)]) {
      case 'BigDamageTank':
        enemy = new BigDamageTank({
          scene: this,
          x: _x,
          y: _y,
          texture: 'tankRed'
        })
        break
      case 'HugeTank':
        enemy = new HugeTank({
          scene: this,
          x: _x,
          y: _y,
          texture: 'tankRed'
        })
        break
      case 'GhostTank':
        enemy = new GhostTank({
          scene: this,
          x: _x,
          y: _y,
          texture: 'tankRed'
        })
        break
    }

    this.enemies.add(enemy)
  }

  private createNewPlayer(_x: number, _y: number) {
    this.player = new Player({
      scene: this,
      x: _x,
      y: _y,
      texture: 'tankBlue'
    })
  }

  private bulletHitLayer(bullet: any): void {
    bullet.gotHit()
  }

  private bulletHitObstacles(bullet: any, obstacle: any): void {
    bullet.gotHit()
  }

  private enemyBulletHitPlayer(bullet: any, player: any): void {
    bullet.gotHit()
    player.gotHitWithDamage(bullet.x, bullet.y, bullet.getDamage())
  }

  private playerBulletHitEnemy(bullet: any, enemy: any): void {
    bullet.gotHit()
    enemy.gotDamage(bullet.x, bullet.y, bullet.getDamage())
  }

  private setPauseGame() {
    this.scene.pause()
    this.scene.launch('PauseScene')
  }
}
