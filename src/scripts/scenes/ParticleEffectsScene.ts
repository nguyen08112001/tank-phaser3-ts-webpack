import { TrailToData } from '../interfaces/trail-to.interface'
import eventsCenter from './EventsCenter'

export default class ParticleEffects extends Phaser.Scene {
  constructor() {
    super('particle-effects')
  }

  create() {
    const particles = this.add.particles('flares')

    eventsCenter.on('enemy-trail-to-score', (data: TrailToData) => {
      const emitter = particles.createEmitter({
        frame: ['red', 'blue', 'yellow', 'blue'],
        x: data.fromX,
        y: data.fromY,
        quantity: 5,
        speed: { random: [50, 100] },
        lifespan: { random: [200, 400] },
        scale: { start: 0.5, end: 0 },
        rotate: { random: true, start: 0, end: 180 },
        angle: { random: true, start: 0, end: 270 },
        blendMode: 'ADD'
      })

      const xVals = [
        data.fromX,
        Phaser.Math.Between(0, this.sys.canvas.width),
        Phaser.Math.Between(0, this.sys.canvas.width),
        data.toX
      ]
      const yVals = [
        data.fromY,
        Phaser.Math.Between(0, this.sys.canvas.height),
        Phaser.Math.Between(0, this.sys.canvas.height),
        data.toY
      ]

      this.tweens.addCounter({
        from: 0,
        to: 1,
        ease: Phaser.Math.Easing.Sine.InOut,
        duration: 1000,
        onUpdate: tween => {
          const v = tween.getValue()
          const x = Phaser.Math.Interpolation.CatmullRom(xVals, v)
          const y = Phaser.Math.Interpolation.CatmullRom(yVals, v)

          emitter.setPosition(x, y)
        },
        onComplete: () => {
          emitter.explode(50, data.toX, data.toY)
          emitter.stop()

          this.time.delayedCall(1000, () => {
            particles.removeEmitter(emitter)
          })
        }
      })
    })
  }
}
