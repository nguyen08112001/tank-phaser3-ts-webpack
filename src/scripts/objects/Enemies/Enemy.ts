import { Bullet, BulletsPool } from '../Bullet';
import { IImageConstructor } from '../../interfaces/image.interface';
import eventsCenter from '../../scenes/EventsCenter';

export class Enemy extends Phaser.GameObjects.Image {
    body: Phaser.Physics.Arcade.Body;

    // variables
    protected health: number ;
    protected nextShoot: number ;
    protected damage: number ;
    protected bulletTexture: string;
    protected deadPoint: number ;
    protected shootingDelayTime: number;


    // children
    protected barrel: Phaser.GameObjects.Image;
    protected lifeBar: Phaser.GameObjects.Graphics;

    // game objects
    protected tween: Phaser.Tweens.Tween;
    private bullets: BulletsPool;
    private explosionSound: Phaser.Sound.BaseSound;
    private whiteSmoke: Phaser.GameObjects.Particles.ParticleEmitter;
    private darkSmoke: Phaser.GameObjects.Particles.ParticleEmitter;
    private fire: Phaser.GameObjects.Particles.ParticleEmitter;

    getBarrel(): Phaser.GameObjects.Image {
        return this.barrel;
    }

    getBullets(): Phaser.GameObjects.Group {
        return this.bullets;
    }

    setDying() {
        this.body.checkCollision.none = true;
        this.createDeadEffectAndSetActive();
        console.log(this.deadPoint);
        eventsCenter.emit('enemy-dead', this.x, this.y, this.deadPoint);
    }

    gotDamage(_x: number, _y:number, _damage: number): void {
        this.health -= _damage;
        this.createGotHitEffect(_x, _y);
        this.reDrawLifebar();
        if (this.health > 0) {
            
        } else {
            this.setDying();
        }
    }

    constructor(aParams: IImageConstructor) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);
        // this.init();
        this.scene.add.existing(this);
        this.once('destroy', this.onDestroy, this);
    }

    update(_playerX: number, _playerY: number): void {
        this.reDrawLifebar();
        if (this.active) {
            this.updateTankImage(_playerX, _playerY);
            this.handleShooting();
        } else {
            this.destroy();
        }
    }

    private onDestroy () {
        this.barrel.destroy();
        this.lifeBar.destroy();
    }

    protected initProperties() {
        // variables
        this.health = 1;
        this.nextShoot = 0;
        this.damage = 0.05;
        this.shootingDelayTime = 400;
    }

    protected init() {
        this.initContainer();

        this.initProperties()

        this.initWeapons();

        this.initBehavior();
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
        });
    }
    protected initContainer() {
        // image
        this.setDepth(0);

        this.barrel = this.scene.add.image(0, 0, 'barrelRed');
        this.barrel.setOrigin(0.5, 1);
        this.barrel.setDepth(1);

        //sound
        this.explosionSound = this.scene.sound.add('explosion');

        this.lifeBar = this.scene.add.graphics();

        // physics
        this.scene.physics.world.enable(this);
    }
    protected initWeapons() {
        // game objects

        console.log(this.damage)
        this.bullets = new BulletsPool(this.scene,  {
            texture: this.bulletTexture || 'bulletRed',
            damage: this.damage
        })
    }

    private createNewBullet() {
        return new Bullet({
            scene: this.scene,
            rotation: this.barrel.rotation,
            x: this.x,
            y: this.y,
            texture: 'bulletRed',
            damage: this.damage
        })
        .setActive(false)
        .setVisible(false)
    }

    private updateTankImage(_playerX: number, _playerY: number) {
        this.updateLifeBar()
        this.updateBarrel(_playerX, _playerY);
        this.updateSmokeEffect()
    }
    private updateSmokeEffect() {
        if (this.health <= 0) {
            this.stopAllSmokeEffect()
        }
        if (this.health <= 0.7) {
            this.createSmoke();
        } 
        else if (this.health <= 0.4) {
            this.whiteSmoke.stop();
            this.darkSmoke.stop();
            this.createFireEffect();
        }
    }
    private updateLifeBar() {
        this.lifeBar.x = this.x;
        this.lifeBar.y = this.y;
    }

    private updateBarrel(_playerX: number, _playerY: number) {
        this.barrel.x = this.x;
        this.barrel.y = this.y;
        if (this.active) {
            let angle = Phaser.Math.Angle.Between(
            this.body.x,
            this.body.y,
            _playerX,
            _playerY,
            );
            this.getBarrel().angle =
            (angle + Math.PI / 2) * Phaser.Math.RAD_TO_DEG;
        }
    }

    

    private handleShooting(): void {
        if (this.scene.time.now > this.nextShoot) {

            let bullet = this.bullets.get(this.x, this.y) as Bullet
                
            if (bullet) {
                //if bullet exists
                bullet.reInitWithAngle(this.barrel.rotation);

                this.nextShoot = this.scene.time.now + this.shootingDelayTime;
            }
        }
    }

    private reDrawLifebar(): void {
        this.lifeBar.clear();
        this.lifeBar.fillStyle(0xe66a28, 1);
        this.lifeBar.fillRect(
            -this.width / 2,
            this.height / 2,
            this.width * this.health,
            15
        );
        this.lifeBar.lineStyle(2, 0xffffff);
        this.lifeBar.strokeRect(-this.width / 2, this.height / 2, this.width, 15);
        this.lifeBar.setDepth(1);
    }

    private createDeadEffectAndSetActive() {
        this.tween.stop();
        
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
                this.health = 0;
                this.active = false;
            }
        })

        let particles = this.scene.add.particles('flares').createEmitter({
            frame: 'red',
            x: this.x, y: this.y,
            lifespan: { min: 600, max: 800 },
            angle: { start: 0, end: 360, steps: 64 },
            speed: 200,
            quantity: 64,
            scale: { start: 0.2, end: 0.1 },
            frequency: 32,
            blendMode: 'ADD'
        });

        this.scene.time.delayedCall(100, ()=>{
            particles.stop();
        });
    }

    private stopAllSmokeEffect() {
        this.fire?.stop();
        this.whiteSmoke?.stop();
        this.darkSmoke?.stop();
    }

    private createGotHitEffect(_x: number, _y:number) {
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
        }).explode(10, _x, _y);
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
        });

    }
    private createSmoke() {
        if (this.whiteSmoke) return

        this.whiteSmoke = this.scene.add.particles('white-smoke').createEmitter({
            x: 400,
            y: 300,
            speed: { min: 20, max: 100 },
            angle: { min: 0, max: 360},
            scale: { start: 1, end: 0},
            alpha: { start: 0, end: 0.5},
            lifespan: 2000,
            //active: false,
            follow: this
        });
        this.whiteSmoke.reserve(1000);
    
        this.darkSmoke = this.scene.add.particles('dark-smoke').createEmitter({
            x: 400,
            y: 300,
            speed: { min: 20, max: 100 },
            angle: { min: 0, max: 360},
            scale: { start: 1, end: 0},
            alpha: { start: 0, end: 0.1},
            blendMode: 'SCREEN',
            lifespan: 2000,
            //active: false
            follow: this
        });
        this.darkSmoke.reserve(1000);
    }

}
