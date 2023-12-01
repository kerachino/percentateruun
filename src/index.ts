import * as Phaser from 'phaser';

class QuizGame extends Phaser.Scene {
  private totalBalloons: number = 100; // 風船の初期数
  private questions: any[] = [];
  private currentQuestionIndex: number = 0;
  private currentStep: string = 'question';
  private keydownListener: any; //イベントリスナーの参照保持 ?必要っぽい
  private allQuestions = 3;
  private balloons: Phaser.GameObjects.Image[];

  constructor() {
    super('quiz-game');
    this.keydownListener = null; 
    this.questions = []; // 問題を格納する配列
    this.balloons = [];
  }

  preload() {
    this.load.json('questions', 'assets/questions.json');
    this.load.image('sky', 'assets/imgs/sky.png');
    this.load.image('vehicle', 'assets/imgs/vehicle.png');
    for (let i = 0; i <= 5; i++) {
      this.load.image(`balloon${i}`, `assets/imgs/balloon${i}.png`);
    }
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
    let husen=100;

    this.createSkybg();
    this.createVehicle();
    this.createBalloons();

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

  createSkybg() {
    // 背景画像
    const sky = this.add.image(0, 0, 'sky').setOrigin(0, 0);
    this.tweens.add({
      targets: sky,
      y: '-=50', // Y座標をピクセル上に移動
      // ease: 'Sine.easeInOut', // イージング関数
      duration: 15000, // 一回の動きにかける時間（ミリ秒）
      yoyo: true, // 元の位置に戻る
      repeat: -1 // 無限に繰り返す
    });
  }
  createVehicle() {
    const vehicle = this.add.image(0, 0, 'vehicle');
    const gameWidth = this.cameras.main.width;
    const vehicleWidth = vehicle.width;
  
    // 画像の比率を保ちつつ、画面の幅に合わせてサイズを調整
    const scale = gameWidth / vehicleWidth;//- gameWidth/8000
    vehicle.setScale(scale);
  
    // 画像の位置を設定（X軸は中心、Y軸は画面の下）
    vehicle.setOrigin(0.5, 1);
    vehicle.setPosition(gameWidth / 2, this.cameras.main.height + this.cameras.main.height/4);
  
    // // トゥイーンアニメーションの追加
    // this.tweens.add({
    //   targets: vehicle,
    //   y: '-=50',
    //   duration: 15000,
    //   yoyo: true,
    //   repeat: -1
    // });
  }

  createBalloons() {
    const objectX = this.cameras.main.width / 2;
    const objectY = this.cameras.main.height / 2;
    const balloonAreaSize = 400; // 風船が配置される領域のサイズ
  
    for (let i = 0; i < 100; i++) {
      const balloonType = `balloon${Phaser.Math.Between(0, 5)}`;
      const posX = objectX + Phaser.Math.Between(-balloonAreaSize, balloonAreaSize);
      const posY = objectY + Phaser.Math.Between(-balloonAreaSize, 0); // 物体の上に集中
  
      const balloon = this.add.image(posX, posY, balloonType);
      this.balloons.push(balloon);
    }
  }

  updateBalloonsCount() {
    const numberOfBalloonsToRemove = this.balloons.length - this.totalBalloons;
  
    // 風船の削除が必要な場合のみ処理を実行
    if (numberOfBalloonsToRemove > 0) {
      for (let i = 0; i < numberOfBalloonsToRemove; i++) {
        if (this.balloons.length > 0) {
          const balloonToRemove = this.balloons.pop(); // 配列の最後の風船を取得
          if (balloonToRemove) {
            balloonToRemove.destroy(); // 風船を削除
          }
        }
      }
    }
  }
  

  showBalloonsCount() {
    // 風船の数を表示するテキストを追加または更新
    const balloonsText = `残りの風船: ${this.totalBalloons}`;
    this.add.text(100, 50, balloonsText, { fontSize: '24px', color: '#ffffff' });
  }

  displayQuestion() {
    this.showBalloonsCount();
    this.updateBalloonsCount();
    this.input.keyboard?.removeAllListeners();// 既存のリスナーを削除 これやらんとエラー
    const currentQuestion = this.questions[this.currentQuestionIndex];
    const questionText = currentQuestion.question;


    // バルーンベースの画像を配置し、サイズを調整
    // const balloonBase = this.add.image(this.cameras.main.width / 2, this.cameras.main.height, 'balloonBase');
    // const scale = this.cameras.main.width / balloonBase.width;
    // balloonBase.setScale(scale, scale); // 高さも同じスケールで調整
    // balloonBase.setY(this.cameras.main.height - balloonBase.displayHeight / 2);
  
    //テキスト
    this.add.text(100, 100, 'Question ' + (this.currentQuestionIndex + 1), {
      fontSize: '24px',
      color: '#ffffff'
    });
    this.add.text(100, 150, questionText, {
      fontSize: '18px',
      color: '#ffffff',
      wordWrap: { width: this.cameras.main.width, useAdvancedWrap: true }
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
    this.showBalloonsCount();
    // ユーザ入力用のテキストフィールドを作成 (仮の実装)
    const inputText = this.add.text(100, 200, '', {
      fontSize: '18px',
      color: '#ffffff'
    });

    this.keydownListener = (event: any) => {
      if (!isNaN(parseInt(event.key))) {
        // 数字が入力された場合
        const potentialText = inputText.text + event.key;
        if (parseInt(potentialText) <= 100) {
          inputText.setText(potentialText);
        }
      } else if (event.key === 'Backspace' && inputText.text.length > 0) {
        // バックスペース ,文字削除
        inputText.setText(inputText.text.slice(0, -1));
      } else if (event.key === 'Enter') {
        // Enter
        const currentQuestion = this.questions[this.currentQuestionIndex];
        const userAnswer = inputText.text; // ユーザの回答を取得
        this.saveAnswerToLocalStorage(currentQuestion.number, parseInt(userAnswer));
        // 回答画面に進む
        this.currentStep = 'answer';
        this.displayStep(this.currentStep);
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
<<<<<<< HEAD
    const difference = Math.round(Math.abs(correctAnswer - userAnswer));
=======
    const difference = Math.abs((correctAnswer - parseInt(userAnswer)) / correctAnswer) * 100;
    // ここで関数呼び出し
>>>>>>> b68180f52b1a63a78637321b3959503ffa375287

    // 差の分だけ風船の数を減らす
    this.totalBalloons -= difference;
    
    // 風船の数が0以下にならないようにする
    if (this.totalBalloons < 0) {
      this.totalBalloons = 0;
    }

    this.add.text(100, 250, 'Your answer: ' + userAnswer, {
      fontSize: '18px',
      color: '#ffffff'
    });
    this.add.text(100, 300, 'Correct answer: ' + correctAnswer, {
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
    this.showBalloonsCount();
  }

  displayExplanation() {
    this.showBalloonsCount();
    const currentQuestion = this.questions[this.currentQuestionIndex];
    const explanationText = currentQuestion.explanation;

    // 四角い枠の作成
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff); // 白色で2ピクセルの線幅
    const rectHeight = 200; // 枠の高さ
    const rectY = this.cameras.main.height / 2; // 画面の下半分に配置
    graphics.strokeRect(50, rectY, this.cameras.main.width - 100, rectHeight);

    // テキストの追加
    this.add.text(60, rectY + 10, '短縮問題: ' + currentQuestion.omitQuestion, { fontSize: '16px', color: '#000000' });
    this.add.text(60, rectY + 40, '答え: ' + currentQuestion.answer, { fontSize: '16px', color: '#000000' });
    this.add.text(60, rectY + 70, '情報源: ' + currentQuestion.source, { fontSize: '16px', color: '#000000' });


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
  width: window.innerWidth, // ウィンドウの幅に設定
  height: window.innerHeight, // ウィンドウの高さに設定
  parent: 'game-app',
  scene: QuizGame,
  fps: {
    target: 30,
    forceSetTimeOut: true // 高いフレームレートを強制する
  }
};

new Phaser.Game(config);
