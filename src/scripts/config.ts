import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'
import { GameOverScene } from './scenes/GameOverScene'
import { MenuScene } from './scenes/MenuScene'
import ParticleEffects from './scenes/ParticleEffectsScene'
import { PauseScene } from './scenes/PauseScene'
import { VictoryScene } from './scenes/VictoryScene'
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js'

export const GameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Tank',
  url: 'https://github.com/digitsensitive/phaser3-typescript',
  version: '2.0',
  width: window.innerWidth,
  height: window.innerHeight,
  type: Phaser.AUTO,
  parent: 'game',
  scene: [BootScene, MenuScene, GameScene, PauseScene, GameOverScene, VictoryScene, ParticleEffects],
  input: {
    keyboard: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true
    }
  },
  plugins: {
    global: [
      {
        key: 'rexVirtualJoystick',
        plugin: VirtualJoystickPlugin,
        start: true
      }
      // ...
    ]
  },
  backgroundColor: '#000000',
  render: { pixelArt: false, antialias: true }
}
