import { IBulletConstructor } from '../interfaces/bullet.interface';
import eventsCenter from '../scenes/EventsCenter';

export class Bomb extends Phaser.GameObjects.Image {
    body: Phaser.Physics.Arcade.Body;

    private speed: number;
    private damage: number;
    private zoneWidth: number;
    private zoneHeight: number;

    reInitWithAngle(_rotation: number) {
        this.rotation = _rotation

        this.scene.physics.velocityFromRotation(
            this.rotation - Math.PI / 2,
            this.speed,
            this.body.velocity
        );

        this.setActive(true)
            .setVisible(true)

        this.body.enable = true;

        this.initExploreCounter();

    }


    constructor(aParams: IBulletConstructor) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture);

        this.rotation = aParams.rotation;
        
        this.init();
        this.scene.add.existing(this);
        this.body.enable = false;
        this.setActive(false)
        this.setVisible(false)
    }

    private initExploreCounter() {
        this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                this.explode();
            }
        })
    }

    private init(): void {
        // variables
        this.speed = 1000;
        this.damage = 1;
        this.zoneWidth = 300;
        this.zoneHeight = 300;

        // image
        this.setOrigin(0.5, 0.5);
        this.setScale(0.2);

        // physics
        this.scene.physics.world.enable(this);
        this.scene.physics.velocityFromRotation(
            this.rotation - Math.PI / 2,
            this.speed,
            this.body.velocity
        );
        this.body.setSize(this.width/2,this.height/2)
        this.body.setBounce(1, 1)

        //init tweens
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 500,
            repeat: -1,
            ease: 'Power0'
        })
    }


    private explode() {
        this.pushCreateDeadZoneEvent();
        this.createExplosionEmitter();
        this.setVisible(false);
        this.setActive(false);
        this.body.enable = false;
    }

    private createExplosionEmitter() {
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


    private pushCreateDeadZoneEvent() {
        eventsCenter.emit('bomb-explode', this.x, this.y, this.zoneWidth, this.zoneHeight, this.damage)
    }
}

export class BombsPool extends Phaser.GameObjects.Group {
    constructor(scene: Phaser.Scene, config: Phaser.Types.GameObjects.Group.GroupConfig = {})
	{

		const defaults: Phaser.Types.GameObjects.Group.GroupConfig = {
			active: false,
            maxSize: 10,
            runChildUpdate: true
		}

		super(scene, Object.assign(defaults, config));

        for (let i = 0; i < this.maxSize; i++ ) {
            this.add(
                new Bomb({
                    scene: this.scene,
                    rotation: -1,
                    x: -1,
                    y: -1,
                    texture: 'bomb',
                    damage: 100
                })
            )
        }
	}
}
