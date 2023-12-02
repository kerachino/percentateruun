import * as Phaser from 'phaser';

class QuizGame extends Phaser.Scene {
  private totalBalloons: number = 100; // 風船の初期数
  private questions: any[] = [];
  private currentQuestionIndex: number = 0;
  private currentStep: string = 'question';
  private keydownListener: any; //イベントリスナーの参照保持 ?必要っぽい
  private allQuestions = 3;
  private balloons: Phaser.GameObjects.Image[];
  private balloonPositions: { id: number, x: number, y: number, colorId: number }[] = [];

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
    for (let i = 0; i <= 7; i++) {
      this.load.image(`balloon${i}`, `assets/imgs/balloon${i}.png`);
    }
    this.load.image('progressBarFull', 'assets/imgs/progressBarFull.jpg');
    this.load.image('progressBarCover', 'assets/imgs/progressBarCover.png');

    for (let i = 0; i < 100; i++) {
      this.balloonPositions.push({
        id: i,
        x: Phaser.Math.Between(100, this.cameras.main.width - 100),
        y: Phaser.Math.Between(100, this.cameras.main.height - 100),
        colorId: Phaser.Math.Between(0, 7) // 色IDをランダムに設定
      });
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
    this.balloons = this.balloonPositions.map(pos => {
      const balloonType = `balloon${pos.colorId}`; // 色IDに基づいてバルーンタイプを選択
      const balloon = this.add.image(pos.x, pos.y, balloonType);
      balloon.setData('id', pos.id); // バルーンにIDを設定
      return balloon;
    });
  }
  updateBalloonsCount() {
    while (this.balloons.length > this.totalBalloons) {
      const balloonToRemove = this.balloons.pop();
      if (balloonToRemove) {
        balloonToRemove.destroy();
      }
    }
  }
  
  createBalloosCountBg() {
    const bg = this.add.image(0, 0, 'balloon0');
    const gameWidth = this.cameras.main.width;
    const bgWidth = bg.width;
    const scale = gameWidth / bgWidth;
    bg.setScale(scale/8);
    bg.setOrigin(0.5, 1);
    bg.setPosition(100, this.cameras.main.height + this.cameras.main.height/5);
  }
  showBalloonsCount() {
    this.createBalloosCountBg();
    const balloonsText = `${this.totalBalloons}`;
    this.add.text(100, this.cameras.main.height-90, '残り', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);
    this.add.text(100, this.cameras.main.height - 50, balloonsText, {
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);
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
    this.updateBalloonsCount();
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
    const difference = Math.round(Math.abs(correctAnswer - userAnswer));

    // 差の分だけ風船の数を減らす
    this.totalBalloons -= difference;
    
    // 風船の数が0以下にならないようにする
    if (this.totalBalloons < 0) {
      this.totalBalloons = 0;
    }

      // バーの作成と初期化
      const barHeight = 20;
      const barWidth = this.cameras.main.width * 0.8;
      const barX = (this.cameras.main.width - barWidth) / 2;
      const barY = this.cameras.main.height - 100;

      // バーを表す画像の配置
      const progressBarFull = this.add.image(barX, barY, 'progressBarFull').setOrigin(0, 0);

      // バーを隠す黒い画像の配置
      const progressBarCover = this.add.image(progressBarFull.width+barX, barY, 'progressBarCover').setOrigin(1, 0);
      progressBarCover.displayWidth = progressBarFull.width;
      progressBarCover.displayHeight = progressBarFull.height;
    
      // アニメーション
      // まず2秒で100%
      this.tweens.add({
        targets: progressBarCover,
        displayWidth: 0,
        ease: 'Linear',
        duration: 2000,
        onComplete: () => {
          // 次に5秒かけて答えの位置まで幅を縮める
          this.tweens.add({
            targets: progressBarCover,
            setOrigin: barX,
            displayWidth: progressBarFull.width - (correctAnswer / 100) * progressBarFull.width, // 答えの位置まで幅を縮める
            ease: 'Linear',
            duration: 5000,
            onComplete: () => {
              // 最後に素早く上がったり下がったりするアニメーション
              this.tweens.add({
                targets: progressBarCover,
                displayWidth: {
                  from: progressBarFull.width - (correctAnswer / 100) * progressBarFull.width,
                  to: progressBarFull.width - (correctAnswer / 100) * progressBarFull.width + Phaser.Math.Between(15, 30) // 細かい左右の揺れ
                },
                ease: 'Linear',
                duration: 100, // 揺れの速さ
                yoyo: true,
                repeat: 5 // 数回繰り返す
              });
            }
          });
        }
      });

      // ユーザの回答位置を示す線の描画
      const userAnswerPosition = barX + (userAnswer / 100) * progressBarFull.width;
      const lineGraphics = this.add.graphics();
      lineGraphics.lineStyle(2, 0xFF0000, 1); // 赤い線、太さ2px
      lineGraphics.lineBetween(userAnswerPosition, barY - 10, userAnswerPosition, barY + progressBarFull.height + 10);


    // 解説に進むためのキーボードリスナーを設定
    this.input.keyboard?.on('keydown', (event: any) => {
      if (event.key === 'Enter') {
        this.currentStep = 'explanation';
        this.displayStep(this.currentStep);
      }
    });
    this.showBalloonsCount();
    this.updateBalloonsCount();
  }

  displayExplanation() {
    this.showBalloonsCount();
    this.updateBalloonsCount();
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
