import * as Phaser from 'phaser';

class QuizGame extends Phaser.Scene {
  private questions: any[] = [];
  private currentQuestionIndex: number = 0;
  private currentStep: string = 'question';
  private keydownListener: any; //イベントリスナーの参照保持 ?必要っぽい
  private allQuestions = 3;

  constructor() {
    super('quiz-game');
    this.keydownListener = null; 
    this.questions = []; // 問題を格納する配列
  }

  preload() {
    this.load.json('questions', 'assets/questions.json');
    this.load.image('sky', 'assets/imgs/sky.png');
    this.load.image('balloonBase', 'assets/imgs/balloon_base.png');
  }

  create() {
    const allQuestions = this.cache.json.get('questions');
    // 問題数を制限するため、ランダムに5つの問題を選ぶ
    this.questions = this.getRandomQuestions(allQuestions, 5);
    this.currentQuestionIndex = 0;
    this.displayStep(this.currentStep);

  }
  
  getRandomQuestions(allQuestions: any[], count: number) {
    // 問題数を制限するため、ランダムに問題を選ぶ関数
    const shuffled = allQuestions.slice(); // コピーを作成
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // 要素をシャッフル
    }
    return shuffled.slice(0, count); // 制限された数の問題を返す
  }

  displayStep(step: string) {
    // 既存のリスナーを削除
    if (this.keydownListener) {
      this.input.keyboard?.off('keydown', this.keydownListener);
    }

    
    if (this.currentQuestionIndex >= this.questions.length) {
      // インデックスが範囲外の場合の処理（例：ゲーム終了）
      console.log("No more questions available. Game Over.");
      return; // ここで処理を終了
    }
  
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
    this.input.keyboard?.removeAllListeners();// 既存のリスナーを削除 これやらんとエラー
    const currentQuestion = this.questions[this.currentQuestionIndex];
    const questionText = currentQuestion.question;

    // 背景画像の配置
    this.add.image(0, 0, 'sky').setOrigin(0, 0);

    // バルーンベースの画像を配置
    const balloonBase = this.add.image(this.cameras.main.width / 2, this.cameras.main.height, 'balloonBase');
    balloonBase.setY(this.cameras.main.height - balloonBase.height / 2);

    //テキスト
    this.add.text(100, 100, 'Question ' + (this.currentQuestionIndex + 1), {
      fontSize: '24px',
      color: '#ffffff'
    });
    this.add.text(100, 150, questionText, {
      fontSize: '18px',
      color: '#ffffff'
    });

    

    // ユーザ入力に進むためのキーボードリスナーを設定
    this.keydownListener = (event: any) => {
      if (event.key === 'Enter') {
        this.currentStep = 'input';
        this.displayStep(this.currentStep);
      }
    };
    this.input.keyboard?.on('keydown', this.keydownListener);
  }

  displayInput() {
    // ユーザ入力用のテキストフィールドを作成 (仮の実装)
    const inputText = this.add.text(100, 200, '', {
      fontSize: '18px',
      color: '#ffffff'
    });

    this.keydownListener = (event: any) => {
      if (event.key === 'Enter') {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        // ユーザの回答を取得し、ローカルストレージに保存
        const userAnswer = inputText.text; // ユーザの回答を取得
        this.saveAnswerToLocalStorage(currentQuestion.number, parseInt(userAnswer));
        // 回答画面に進む
        this.currentStep = 'answer';
        this.displayStep(this.currentStep);
      } else {
        // ユーザの入力をテキストフィールドに反映
        inputText.setText(inputText.text + event.key);
      }
    };
    this.input.keyboard?.on('keydown', this.keydownListener);
  }
  

  displayAnswer() {
    const currentQuestion = this.questions[this.currentQuestionIndex];
    // ローカルストレージからユーザの回答を取得
    const answers = JSON.parse(localStorage.getItem('userAnswers') || '{}');
    const userAnswer = answers[currentQuestion.number] || 0;
    

    // ユーザの回答と正解を比較し、パーセンテージの差を計算
    const correctAnswer = currentQuestion.answer;
    const difference = Math.abs((correctAnswer - parseInt(userAnswer)) ) ;

    this.add.text(100, 250, 'Your answer: ' + userAnswer + '%', {
      fontSize: '18px',
      color: '#ffffff'
    });
    this.add.text(100, 300, 'Correct answer: ' + correctAnswer + '%', {
      fontSize: '18px',
      color: '#ffffff'
    });
    this.add.text(100, 350, 'Difference: ' + difference + '%', {
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

    // 四角い枠の作成
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff); // 白色で2ピクセルの線幅
    const rectHeight = 200; // 枠の高さ
    const rectY = this.cameras.main.height / 2; // 画面の下半分に配置
    graphics.strokeRect(50, rectY, this.cameras.main.width - 100, rectHeight);

    // テキストの追加
    this.add.text(60, rectY + 10, '短縮問題: ' + currentQuestion.omitQuestion, { fontSize: '16px', color: '#ffffff' });
    this.add.text(60, rectY + 40, '答え: ' + currentQuestion.answer, { fontSize: '16px', color: '#ffffff' });
    this.add.text(60, rectY + 70, '情報源: ' + currentQuestion.source, { fontSize: '16px', color: '#ffffff' });


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

  saveAnswerToLocalStorage(questionNumber: number, userAnswer: number) {
    const answers = JSON.parse(localStorage.getItem('userAnswers') || '{}');
    answers[questionNumber] = userAnswer;
    localStorage.setItem('userAnswers', JSON.stringify(answers));
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
