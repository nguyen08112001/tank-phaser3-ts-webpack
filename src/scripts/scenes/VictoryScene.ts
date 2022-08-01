import { PlayButton } from './../objects/Buttons/PlayButton'
import { BackButton } from '../objects/Buttons/BackButton'
import { NewGameButton } from '../objects/Buttons/NewGameButton'

export class VictoryScene extends Phaser.Scene {
  private bitmapTexts: Phaser.GameObjects.BitmapText[] = []
  private bestScore = Number.parseInt(localStorage.getItem('best') as string, 10) || 0
  score: number
  constructor() {
    super({
      key: 'VictoryScene'
    })
  }

  init(props: { score: number }): void {
    this.score = props.score

    let bestScore = Math.max(this.score, this.bestScore)
    localStorage.setItem('best', bestScore + '')
  }

  create(): void {
    this.createTrunk()
    this.time.addEvent({
      delay: 2500, // ms
      callback: () => {
        this.addImage()
      },
      //args: [],
      callbackScope: this,
      loop: true
    })
  }

  update(): void {
    // this.scene.start('GameScene')
  }

  private addImage() {
    let img = this.add.image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'victory').setScale(1)

    new BackButton({
      scene: this,
      x: this.sys.canvas.width / 2 - 100,
      y: this.sys.canvas.height - 200,
      texture: 'back-button'
    })

    new NewGameButton({
      scene: this,
      x: this.sys.canvas.width / 2 + 100,
      y: this.sys.canvas.height - 200,
      texture: 'play-button'
    })

    this.bitmapTexts.push(
      // this.add
      //   .bitmapText(this.sys.canvas.width / 2 - 180, this.sys.canvas.height - 100, 'font', 'RETURN  REPLAY', 30)
      //   .setTintFill(0xffffff),

      this.add
        .bitmapText(
          this.sys.canvas.width / 2 - 180,
          this.sys.canvas.height / 2 + 200,
          'font',
          'SCORE      ' + this.score + '\n\nBEST SCORE ' + this.bestScore,
          30
        )
        .setTintFill(0xffffff)
    )
    this.createFirework()
  }

  private createFirework() {
    let p0 = new Phaser.Math.Vector2(this.sys.canvas.width / 3, this.sys.canvas.height / 3)
    let p1 = new Phaser.Math.Vector2(this.sys.canvas.width / 3, 0)
    let p2 = new Phaser.Math.Vector2(this.sys.canvas.width / 1.5, 0)
    let p3 = new Phaser.Math.Vector2(this.sys.canvas.width / 1.5, this.sys.canvas.height / 3)

    let curve = new Phaser.Curves.CubicBezier(p0, p1, p2, p3)

    let max = 28
    let points = []
    let tangents = []

    for (let c = 0; c <= max; c++) {
      let t = curve.getUtoTmapping(c / max, 0)

      points.push(curve.getPoint(t))
      tangents.push(curve.getTangent(t))
    }

    let tempVec = new Phaser.Math.Vector2()

    let spark0 = this.add.particles('red-spark')
    let spark1 = this.add.particles('blue-spark')

    for (let i = 0; i < points.length; i++) {
      let p = points[i]

      tempVec.copy(tangents[i]).normalizeRightHand().scale(-32).add(p)

      let angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.BetweenPoints(p, tempVec))

      let particles = i % 2 === 0 ? spark0 : spark1

      particles.createEmitter({
        x: tempVec.x,
        y: tempVec.y,
        angle: angle,
        speed: { min: -100, max: 500 },
        gravityY: 200,
        scale: { start: 0.4, end: 0.1 },
        lifespan: 800,
        blendMode: 'SCREEN'
      })
    }
  }

  private createTrunk() {
    let trunk = new Phaser.Geom.Rectangle(-130, -250, 1150, 860)
    let particles = this.add.particles('flares')
    particles.createEmitter({
      frame: 'blue',
      x: 360,
      y: 420,
      speed: 0,
      lifespan: 500,
      delay: 500,
      frequency: 0,
      quantity: 1,
      scale: 0.2,
      blendMode: 'ADD',
      emitZone: { type: 'edge', source: trunk, quantity: 48 }
    })
  }
}
