import * as Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    // タイトルテキストを表示
    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'ゲームのタイトル', { fontSize: '32px', color: '#FFFFFF' }).setOrigin(0.5);

    // スペースキーの入力を検知するための設定
    this.input.keyboard?.once('keydown-SPACE', () => {
      // スペースキーが押されたらゲームシーンを開始
      this.scene.start('QuizGame');
    });
  }
}
