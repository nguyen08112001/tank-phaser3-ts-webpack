import { IBulletConstructor } from '../interfaces/bullet.interface';

export class Bullet extends Phaser.GameObjects.Image {
    body: Phaser.Physics.Arcade.Body;

    private speed: number;
    private damage: number;
    fireEffect: Phaser.GameObjects.Particles.ParticleEmitter;

    getDamage() {
        return this.damage;
    }

    setDamage(_newDamage: number) {
        this.damage = _newDamage;
    }

    gotHit() {
        this.fireEffect?.setVisible(false)
        this.setVisible(false);
        this.setActive(false)
        this.body.enable = false;
    }

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

        this.fireEffect?.setVisible(true)
    }

    constructor(aParams: IBulletConstructor) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture);

        this.rotation = aParams.rotation;
        this.init();
        this.damage = aParams.damage;
        this.scene.add.existing(this);

        this.body.enable = false;
        this.setActive(false)
        this.setVisible(false)
    }

    update(): void {
    }

    private init(): void {
        // variables
        this.speed = 1000;

        // image
        this.setOrigin(0.5, 0.5);
        this.setDepth(2);

        // physics
        this.scene.physics.world.enable(this);

        // this.createFireEffect();

    }

    
    createFireEffect() {
        let particles = this.scene.add.particles('flares');

        this.fireEffect = particles.createEmitter({
            frame: 'red',
            radial: false,
            lifespan: 100,
            speedX: { min: 200, max: 400 }, 
            quantity: 4,
            gravityY: -50,
            scale: { start: 0.6, end: 0, ease: 'Power3' },
            blendMode: 'ADD',
            follow: this
        }).setVisible(false);
    }
    
}

export class BulletsPool extends Phaser.GameObjects.Group {

    constructor(scene: Phaser.Scene, customBulletConfig: any, config: Phaser.Types.GameObjects.Group.GroupConfig = {})
	{

		const defaults: Phaser.Types.GameObjects.Group.GroupConfig = {
			active: false,
            maxSize: 10,
            runChildUpdate: true
		}

		super(scene, Object.assign(defaults, config));
        this.createBulletsWithConfig(customBulletConfig)
        
	}
    private createBulletsWithConfig(customBulletConfig: any) {
        for (let i = 0; i < this.maxSize; i++ ) {
            this.add(
                new Bullet({
                    scene: this.scene,
                    rotation: -1,
                    x: -1,
                    y: -1,
                    texture: customBulletConfig.texture,
                    damage: customBulletConfig.damage
                })
            )
        }
    }
}
