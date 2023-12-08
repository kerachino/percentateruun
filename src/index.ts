import * as Phaser from 'phaser';

class QuizGame extends Phaser.Scene {
  private totalBalloons: number = 100; // 風船の初期数
  private questions: any[] = [];
  private currentQuestionIndex: number = 0;
  private currentStep: string = 'firstStep';
  private keydownListener: any; //イベントリスナーの参照保持 ?必要っぽい
  private allQuestions = 3;
  private balloons: Phaser.GameObjects.Image[];
  private balloonPositions: { id: number, x: number, y: number, colorId: number }[] = [];
  private balloonsData: any[] = [];
  private bgImage: any;

  private differences: number[] = [0, 0, 0, 0, 0];
  constructor() {
    super('quiz-game');
    this.keydownListener = null;
    this.questions = []; // 問題を格納する配列
    this.balloons = [];
  }

  preload() {
    this.load.json('questions', 'assets/questions.json');
    this.load.json('balloonsData', 'assets/balloons.json');
    this.load.image('bg2', 'assets/imgs/bg2.png');
    this.load.image('bg1', 'assets/imgs/bg1.jpg');
    this.load.image('vehicle', 'assets/imgs/vehicle.png');
    for (let i = 0; i <= 7; i++) {
      this.load.image(`balloon${i}`, `assets/imgs/balloon${i}.png`);
    }
    this.load.image(`balloon`, `assets/imgs/balloon.png`);

    this.load.image('progressBarFull', 'assets/imgs/progressBarFull.png');
    this.load.image('progressBarCover', 'assets/imgs/progressBarCover.png');
    this.load.image('qFrame', 'assets/imgs/qFrame3.png');

    // for (let i = 0; i < 100; i++) {
    //   this.balloonPositions.push({
    //     id: i,
    //     x: Phaser.Math.Between(100, this.cameras.main.width - 100),
    //     y: Phaser.Math.Between(100, this.cameras.main.height - 100),
    //     colorId: Phaser.Math.Between(0, 7) // 色IDをランダムに設定
    //   });
    // }
  }

  create() {
    const allQuestions = this.cache.json.get('questions');
    // 問題数を制限するため、ランダムに5つの問題を選ぶ
    this.questions = this.getRandomQuestions(allQuestions, 5);
    this.currentQuestionIndex = 0;
    this.displayStep(this.currentStep);
    // this.bgImage = this.add.image(0, 0, 'bg2').setOrigin(0, 0);


    // JSONデータの読み込み
    this.balloonsData = this.cache.json.get('balloonsData');
    

  }

  showBalloons(){
     // 風船配列をクリア
    this.balloons.forEach(balloon => balloon.destroy());
    this.balloons = [];
    // バルーンの配置
    this.balloonsData.forEach((balloonData: { id: number, x: number, y: number, colorId: number }) => {
      const balloonType = `balloon${balloonData.colorId}`;
      const posX = this.calculateBalloonX(balloonData.x);
      const posY = this.calculateBalloonY(balloonData.y);
      const balloon = this.add.image(posX, posY, balloonType).setOrigin(0.5, 0);
      // その他のバルーン設定...
      this.balloons.push(balloon);
    });
  }
  createText(x: number, y: number, text: string, fontsize: number, color: string): Phaser.GameObjects.Text {
    return this.add.text(x, y, text, {
      fontFamily: 'Arial',
      fontSize: fontsize,
      color: color
    });
  }

  calculateBalloonX(columnIndex: number): number {
    const padding = 10; // バルーン間の余白
    const balloonWidth = 50; // バルーンの幅
    return columnIndex * (balloonWidth + padding) + this.cameras.main.width / 2;
  }

  calculateBalloonY(rowIndex: number): number {
    const padding = 10; // バルーン間の余白
    const balloonHeight = 50; // バルーンの高さ
    return rowIndex * (balloonHeight + padding) + 50;
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
      alert("No more questions available. Game Over.");
      return;
    }
    
    this.clearScene(); //処理を軽くするには下をfirstStepに入れ、これを削除できるようにする
    this.updateBg();
    this.showBalloons();
    this.createVehicle();

    this.displayQuestionNumber();
    
    switch (step) {
      case 'firstStep':
        this.firstStep();
        break;
      case 'question':
        this.displayQuestion();
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

  displayQuestionNumber() {//上バー
    const circleRadius = 20;
    const circleSpacing = 50;
    const startX = this.cameras.main.width / 2 - (circleSpacing * (this.questions.length - 1)) / 2;
    const startY = 50;
  
    for (let i = 0; i < this.questions.length; i++) {
      const circleX = startX + i * circleSpacing;
      const color = i === this.currentQuestionIndex ? 0xFF0000 : 0xAAAAAA; // 現在の問題は赤、それ以外は灰色
  
      const circle = this.add.circle(circleX, startY, circleRadius, color);
      const difference = this.differences[i]; // 配列からdifferenceの値を取得
      this.createText(circleX, startY, difference.toString(), 16, '#FFFFFF').setOrigin(0.5);
    }
  }
  
  
  firstStep(){
    // this.updateBg();
    // this.showBalloons();
    // this.createVehicle();

    this.currentStep = 'question';
    this.displayStep(this.currentStep);
  }

  changeBackground(newBgKey: string) {
    const newBg = this.add.image(0, 0, newBgKey).setOrigin(0, 0);

    this.tweens.add({
      targets: newBg,
      y: '-=50', // Y座標をピクセル上に移動
      // ease: 'Sine.easeInOut', // イージング関数
      duration: 15000, // 一回の動きにかける時間
      yoyo: true, // 元の位置に戻る
      repeat: -1, // 無限に繰り返す
    });
  }
  createVehicle() { //バスケット、乗り物、搭乗位置
    const vehicle = this.add.image(0, 0, 'vehicle');
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    // 画像のサイズを取得
    const vehicleWidth = vehicle.width;
    const vehicleHeight = vehicle.height;

    // 画像のスケールを設定して、下半分が画面下に隠れるようにする
    const desiredScale = (gameWidth / vehicleWidth) * 0.5; // 画像の幅の50%にスケール
    vehicle.setScale(desiredScale);

    // 画像の位置を設定
    vehicle.setOrigin(0.5, 1);
    vehicle.setPosition(gameWidth / 2, gameHeight + 50);

    // 画像の下半分が画面下に隠れるように調整
    if (vehicleHeight * desiredScale / 2 > gameHeight) {
      vehicle.setPosition(gameWidth / 2, gameHeight + vehicleHeight * desiredScale / 2 - gameHeight);
    }

    // アニメーション
    // this.tweens.add({
    //   targets: vehicle,
    //   y: '-=50',
    //   duration: 15000,
    //   yoyo: true,
    //   repeat: -1
    // });
  }

  updateBalloonsCount() {
    while (this.balloons.length > this.totalBalloons) {
      const balloonToRemove = this.balloons.pop();
      if (balloonToRemove) {
        balloonToRemove.destroy();
      }
    }
  }

  updateBg(){
    // 風船の数に応じて背景を変更
    if (this.totalBalloons > 50) {
      this.changeBackground('bg2');
    } else if (this.totalBalloons <= 50) {
      this.changeBackground('bg1');
    }
  }

  createBalloosCountBg() {
    const bg = this.add.image(0, 0, 'balloon');
    const gameWidth = this.cameras.main.width;
    const bgWidth = bg.width;
    const scale = gameWidth / bgWidth;
    bg.setOrigin(1, 1);
    bg.setPosition(this.cameras.main.width, this.cameras.main.height);
    bg.setScale(120 / bg.width);
  }
  showBalloonsCount() {
    this.createBalloosCountBg();
    const balloonsText = `${this.totalBalloons}`;
    this.createText(this.cameras.main.width - 15, this.cameras.main.height - 110, '残り', 30, '#FFF').setOrigin(1.25, 1);
    this.createText(this.cameras.main.width - 15, this.cameras.main.height - 60, balloonsText, 50, '#FFF').setAlign('center').setOrigin(1.25, 1);
  }


  displayQuestion() {
    this.showBalloonsCount();
    this.updateBalloonsCount();
    this.input.keyboard?.removeAllListeners();// 既存のリスナーを削除 これやらんとエラー
    const currentQuestion = this.questions[this.currentQuestionIndex];
    const questionText = currentQuestion.question;

    const qFrame = this.add.image(0, 0, 'qFrame');
    const gameWidth = this.cameras.main.width;
    const bgWidth = qFrame.width;
    qFrame.setOrigin(0.5, 0);
    qFrame.setPosition(this.cameras.main.width / 2, 60);
    qFrame.setScale((gameWidth - 80) / bgWidth);

    this.createText(100, 100, 'Question ' + (this.currentQuestionIndex + 1), 24, '#000');
    this.add.text(100, 150, questionText, {
      fontSize: '18px',
      color: '#000',
      wordWrap: { width: this.cameras.main.width, useAdvancedWrap: true }
    });

    // タイマーを設定して、一定時間経過後に自動的に入力画面に進む
    const timerDuration = 5000; // タイマーの総時間（ミリ秒）

    // 赤い背景のテキストを作成
    const countdownTextBg = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      '',
      {
        fontSize: '60px',
        color: '#000', // 赤色
        backgroundColor: '#FF0000', // 背景色（黒色）
        padding: {
          left: 20,
          right: 20,
          top: 10,
          bottom: 10,
        },
      }
    );
    countdownTextBg.setOrigin(0.5);
    countdownTextBg.setVisible(false); // 最初は非表示

    // 残り3秒になったら数字を表示
    const countdownText = this.createText(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      '',
      64,
      '#FFF'
    );
    countdownText.setOrigin(0.5);

    // タイマーイベントを設定
    const timerEvent = this.time.addEvent({
      delay: timerDuration,
      callback: () => {
        this.currentStep = 'answer';
        this.input.keyboard?.removeAllListeners(); // タイマーが発動したのでリスナーをクリア
        this.displayStep(this.currentStep);
      },
    });

    // カウントダウン用の関数を定義
    let countdownValue = Math.floor(timerDuration / 1000);
    const updateCountdown = () => {
      if (countdownValue <= 0) {
        countdownValue = 0;
      }
      if (countdownValue <= 3) {
        countdownText.setText(countdownValue.toString());

        // 強調アニメーション
        countdownTextBg.setPosition(countdownText.x, countdownText.y);
        countdownTextBg.setScale(1.5); // 文字が一瞬大きくなる
        countdownTextBg.setVisible(true);

        // Tweenアニメーションでサイズを元に戻す
        this.tweens.add({
          targets: countdownTextBg,
          scaleX: 1,
          scaleY: 1,
          duration: 300, // 0.3秒間で元のサイズに戻る
          onComplete: () => {
            countdownTextBg.setVisible(false); // アニメーション終了後に非表示にする
          },
        });
      } else {
        countdownText.setText('');
      }
      countdownValue--;
    };

    // カウントダウン用のタイマーを1秒ごとに起動
    const countdownInterval = setInterval(updateCountdown, 1000);

    // カウントダウン用のタイマーを即座に発動させる
    updateCountdown();

    // タイマーが終了したらクリア
    setTimeout(() => {
      clearInterval(countdownInterval);
    }, timerDuration);

    // ユーザ入力に進むためのキーボードリスナーを設定
    // this.keydownListener = (event: any) => {
    //   if (event.key === 'Enter') {
    //     this.currentStep = 'input';
    //     this.displayStep(this.currentStep);
    //   }
    // };
    // this.input.keyboard?.on('keydown', this.keydownListener);


    //input
    this.updateBalloonsCount();
    // ユーザ入力用のテキストフィールドを作成 (仮の実装)
    const inputText = this.add.text(100, 200, '', {
      fontSize: '18px',
      color: '#000'
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
      } else if (event.key === 'Enter' && inputText.text) {
        // タイマーを停止
        timerEvent.remove();
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

    //上バー表示用
    this.differences[this.currentQuestionIndex] = difference;

    // バーの作成と初期化
    const barHeight = 20;
    const barWidth = this.cameras.main.width * 0.8;
    // const barX = (this.cameras.main.width - barWidth) / 2 +100;
    const barX = (this.cameras.main.width - barWidth) / 2;
    const barY = this.cameras.main.height - 100;

    // バーを表す画像の配置
    const progressBarFull = this.add.image(barX, barY, 'progressBarFull')
    progressBarFull.setOrigin(0, 0).setScale(barWidth / progressBarFull.width, 1);
    //console.log(this.cameras.main.width+","+barWidth+","+barX);
    //console.log(progressBarFull.width+",");

    // バーを隠す黒い画像の配置
    // const progressBarCover = this.add.image(progressBarFull.width+barX, barY, 'progressBarCover')
    const progressBarCover = this.add.image(barWidth + barX, barY, 'progressBarCover')
    progressBarCover.setOrigin(1, 0).setScale(barWidth / progressBarCover.width, 1);
    progressBarCover.displayWidth = progressBarFull.width;
    progressBarCover.displayHeight = progressBarFull.height;

    this.tweens.add({
      targets: progressBarCover,
      displayWidth: 0,
      ease: 'Linear',
      duration: 2000,
      onComplete: () => {
        this.tweens.add({
          targets: progressBarCover,
          displayWidth: barWidth,
          ease: 'Linear',
          duration: 2000,
          onComplete: () => {
            // 次に5秒かけて答えの位置まで幅を縮める
            this.tweens.add({
              targets: progressBarCover,
              //setOrigin: barX,
              displayWidth: barWidth - (correctAnswer / 100) * barWidth, // 答えの位置まで幅を縮める
              ease: 'Linear',
              duration: 5000,
              onComplete: () => {
                // 最後に素早く上がったり下がったりするアニメーション
                this.tweens.add({
                  targets: progressBarCover,
                  displayWidth: {
                    from: barWidth - (correctAnswer / 100) * barWidth,
                    to: barWidth - (correctAnswer / 100) * barWidth + Phaser.Math.Between(15, 30) // 細かい左右の揺れ
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
      }
    });

    // ユーザの回答位置を示す線の描画
    const userAnswerPosition = barX + (userAnswer / 100) * barWidth;
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
    this.createText(60, rectY + 10, '短縮問題: ' + currentQuestion.omitQuestion, 16, '#000000');
    this.createText(60, rectY + 40, '答え: ' + currentQuestion.answer, 16, '#000000');
    this.createText(60, rectY + 70, '情報源: ' + currentQuestion.source, 16, '#000000');

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
