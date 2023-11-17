import * as Phaser from 'phaser';

class QuizGame extends Phaser.Scene {
  private questions: any[] = []; // 問題データを格納する配列
  private currentQuestionIndex: number = 0;

  constructor() {
    super('quiz-game');
  }

  preload() {
    // 問題データを読み込む
    this.load.json('questions', 'assets/questions.json');
  }
  
  create() {
    // 問題データを取得
    this.questions = this.cache.json.get('questions');
  
    console.log(this.questions); // 問題データが正しく格納されているか確認
  }
  

  displayQuestion(index: number) {
    const questionData = this.questions[index];
    
    // 問題文を表示
    const questionText = this.add.text(400, 300, questionData.question, { fontFamily: 'Arial', fontSize: '24px' });
    questionText.setOrigin(0.5);
  
    // 他のUI要素やユーザ入力の処理を追加
  }
  


}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-app',
  scene: QuizGame,
};

new Phaser.Game(config);
