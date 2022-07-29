import { IImageConstructor } from '../../interfaces/image.interface';
import eventsCenter from '../../scenes/EventsCenter';
import { Button } from './Button';

export class VolumeButton extends Button {
    body: Phaser.Physics.Arcade.Body;

    constructor(aParams: IImageConstructor) {
        super(aParams);
        if (!this.scene.registry.get('hasSound')) {
            this.setTint(0x808080)
        }
    }

    create() {
        
    }

    public handlePointerDown() {
        if (this.scene.registry.get('hasSound')) 
        {
            this.setTint(0x808080);
            this.scene.registry.set('hasSound', false);
            eventsCenter.emit('update-sound');
        }
        else {
            this.clearTint();
            this.scene.registry.set('hasSound', true);
            eventsCenter.emit('update-sound');
        }   
    }

    update(): void {
    }

}
