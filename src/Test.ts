import * as Phaser from 'phaser';

// これ保留
export class Test extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    // タイトルテキストを表示
    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'ゲームタイトル(enter押して', { fontSize: '32px', color: '#FFFFFF' }).setOrigin(0.5);


    // enterでQuizGameへ
    this.input.keyboard?.once('keydown-ENTER', () => {
      this.scene.start('QuizGame');
    });
  }
}
