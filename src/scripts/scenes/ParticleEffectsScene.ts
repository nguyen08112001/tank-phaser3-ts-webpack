interface TrailToData
{
	fromX: number
	fromY: number
	toX: number
	toY: number
}

export default class ParticleEffects extends Phaser.Scene
{
	constructor()
	{
		super('particle-effects')
	}

    create() {
        const particles = this.add.particles('flares')

        this.events.on('trail-to', (data: TrailToData) => {
            const emitter = particles.createEmitter({
                frame: ['red', 'blue', 'yellow', 'blue'],
                x: data.fromX,
                y: data.fromY,
                quantity: 5,
                speed: { random: [50, 100] },
                lifespan: { random: [200, 400]},
                scale: { start: 0.5, end: 0 },
                rotate: { random: true, start: 0, end: 180 },
                angle: { random: true, start: 0, end: 270 },
                blendMode: 'ADD'
            })
    
            const xVals = [data.fromX, 300, 100, data.toX]
            const yVals = [data.fromY, 100, 150, data.toY]
            
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