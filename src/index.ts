import * as Phaser from 'phaser';

class QuizGame extends Phaser.Scene {
  private questions: any[] = [];
  private currentQuestionIndex: number = 0;
  private currentStep: string = 'question';

  constructor() {
    super('quiz-game');
  }

  preload() {
    this.load.json('questions', 'assets/questions.json');
  }

  create() {
    this.questions = this.cache.json.get('questions');
    this.displayStep(this.currentStep);
  }

  displayStep(step: string) {
    this.clearScene();

    switch (step) {
      case 'question':
        this.displayQuestion();
        break;
      case 'input':
        this.displayInput();
        break;
      case 'answer':
        this.displayAnswer();
        break;
      case 'explanation':
        this.displayExplanation();
        break;
      default:
        console.log('Invalid step: ' + step);
        break;
    }
  }

  displayQuestion() {
    const currentQuestion = this.questions[this.currentQuestionIndex];
    const questionText = currentQuestion.question;

    this.add.text(100, 100, 'Question ' + (this.currentQuestionIndex + 1), {
      fontSize: '24px',
      color: '#ffffff'
    });
    this.add.text(100, 150, questionText, {
      fontSize: '18px',
      color: '#ffffff'
    });

    // ユーザ入力に進むためのキーボードリスナーを設定
    this.input.keyboard?.on('keydown', (event: any) => {
      if (event.key === 'Enter') {
        this.currentStep = 'input';
        this.displayStep(this.currentStep);
      }
    });
  }

  displayInput() {
    // ユーザ入力を受け付けるUIを表示するコードをここに実装
    // 例えば、テキストボックスなどを表示し、ユーザからの入力を受け付ける

    // 入力が完了したら、回答に進むためのキーボードリスナーを設定
    this.input.keyboard?.on('keydown', (event: any) => {
      if (event.key === 'Enter') {
        this.currentStep = 'answer';
        this.displayStep(this.currentStep);
      }
    });
  }

  displayAnswer() {
    const currentQuestion = this.questions[this.currentQuestionIndex];
    const userAnswer = ''; // ユーザの回答をここで取得

    // ユーザの回答と正解を比較し、パーセンテージの差を計算
    const correctAnswer = currentQuestion.answer;
    const difference = Math.abs((correctAnswer - parseInt(userAnswer)) / correctAnswer) * 100;

    this.add.text(100, 250, 'Your answer: ' + userAnswer, {
      fontSize: '18px',
      color: '#ffffff'
    });
    this.add.text(100, 300, 'Correct answer: ' + correctAnswer, {
      fontSize: '18px',
      color: '#ffffff'
    });
    this.add.text(100, 350, 'Difference: ' + difference.toFixed(2) + '%', {
      fontSize: '18px',
      color: '#ffffff'
    });

    // 解説に進むためのキーボードリスナーを設定
    this.input.keyboard?.on('keydown', (event: any) => {
      if (event.key === 'Enter') {
        this.currentStep = 'explanation';
        this.displayStep(this.currentStep);
      }
    });
  }

  displayExplanation() {
    const currentQuestion = this.questions[this.currentQuestionIndex];
    const explanationText = currentQuestion.explanation;

    this.add.text(100, 400, 'Explanation:', {
      fontSize: '24px',
      color: '#ffffff'
    });
    this.add.text(100, 450, explanationText, {
      fontSize: '18px',
      color: '#ffffff'
    });

    // 次の問題に進むためのキーボードリスナーを設定
    this.input.keyboard?.on('keydown', (event: any) => {
      if (event.key === 'Enter') {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions.length) {
          this.currentStep = 'question';
          this.displayStep(this.currentStep);
        } else {
          // ゲーム終了
          this.add.text(100, 500, 'Game Over', {
            fontSize: '24px',
            color: '#ffffff'
          });
        }
      }
    });
  }

  clearScene() {
    this.children.removeAll();
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
