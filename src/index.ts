import * as Phaser from 'phaser';
import { Test } from './Test';
import { QuizGame } from './QuizGame';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-app',
  scene: [QuizGame],
  //  scene: [TitleScene, QuizGame],
  fps: {
    target: 30,
    forceSetTimeOut: true
  }
};


new Phaser.Game(config);
