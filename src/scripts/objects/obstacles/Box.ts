import { IImageConstructor } from '../../interfaces/image.interface';
import eventsCenter from '../../scenes/EventsCenter';
import { GameScene } from '../../scenes/GameScene';

export class Box extends Phaser.GameObjects.Image {
    body: Phaser.Physics.Arcade.Body;

    // variables
    private health: number;
    private zoneWidth: number;
    private zoneHeight: number;
    private damage: number;

    // game objects
    private explosionSound: Phaser.Sound.BaseSound;

    gotDamage(_x: number, _y:number, _damage: number): void {
        this.health -= _damage;
        this.createEmitter(_x, _y);
        this.explode();
        
        if (this.health > 0) {
            
        } else {
            this.explode()
        }
    }

    explode() {
        if (!this.active) return;

        this.health = 0;
        this.active = false;
        this.setVisible(false)
        
        this.emitCreateDeadZoneEvent()
        this.createExplosionEffect()

        this.destroy()
    }

    constructor(aParams: IImageConstructor) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);

        this.initImage();
        this.scene.add.existing(this);
    }

    private initImage() {
        // variables
        this.health = 1;
        this.zoneWidth = 400;
        this.zoneHeight = 400;
        this.damage = 1;

        // image
        this.setDepth(0);

        //sound
        this.explosionSound = this.scene.sound.add('explosion');

        // physics
        this.scene.physics.world.enable(this);
        this.body.setImmovable(true)
    }

    

    private createExplosionEffect() {
        let particles = this.scene.add.particles('explosion');

        particles.createEmitter({
            frame: [ 'smoke-puff', 'cloud', 'smoke-puff' ],
            angle: { min: 240, max: 300 },
            speed: { min: 200, max: 300 },
            quantity: 6,
            lifespan: 2000,
            alpha: { start: 1, end: 0 },
            scale: { start: 1.5, end: 0.5 },
            on: false
        });

        particles.createEmitter({
            frame: 'red',
            angle: { start: 0, end: 360, steps: 32 },
            lifespan: 1000,
            speed: 400,
            quantity: 32,
            scale: { start: 0.3, end: 0 },
            on: false
        });

        particles.createEmitter({
            frame: 'stone',
            angle: { min: 240, max: 300 },
            speed: { min: 400, max: 600 },
            quantity: { min: 2, max: 10 },
            lifespan: 4000,
            alpha: { start: 1, end: 0 },
            scale: { min: 0.05, max: 0.4 },
            rotate: { start: 0, end: 360, ease: 'Back.easeOut' },
            gravityY: 800,
            on: false
        });

        particles.createEmitter({
            frame: 'muzzleflash2',
            lifespan: 200,
            scale: { start: 2, end: 0 },
            rotate: { start: 0, end: 180 },
            on: false
        });
        particles.emitParticleAt(this.x, this.y)
    }
    private emitCreateDeadZoneEvent() {
        eventsCenter.emit('bomb-explode', this.x, this.y, this.zoneWidth, this.zoneHeight, this.damage)
    }

    private createEmitter(_x: number, _y:number) {
        let emitter = this.scene.add.particles('red-spark').createEmitter({
            x: _x,
            y: _y,
            speed: { min: -800, max: 800 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            //active: false,
            lifespan: 200,
            gravityY: 800,
        });
        this.scene.time.delayedCall(200, ()=>{
            emitter.stop();
        });
    }
}
