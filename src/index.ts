import * as Phaser from 'phaser';
declare global {
  interface Window {
    showInputField: (isVisible: boolean) => void;
    inputText: Phaser.GameObjects.Text;
  }
}

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
  private inputText: any;
  private mbBool: boolean;
  private mainWidth: number;
  private mainHeight: number;

  private differences: number[] = [0, 0, 0, 0, 0];
  constructor() {
    super('quiz-game');
    this.keydownListener = null;
    this.questions = []; // 問題を格納する配列
    this.balloons = [];
    this.mbBool = true;
    this.mainWidth = 0;
    this.mainHeight = 0;
  }

  preload() {
    this.mainWidth = this.cameras.main.width;
    this.mainHeight = this.cameras.main.height;
    if(this.mainWidth < 799){
      this.mbBool = true;
    }else{
      this.mbBool = false;
    }
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

    this.load.image('qImg0', 'assets/imgs/qImg/0.jpg');

    // for (let i = 0; i < 100; i++) {
    //   this.balloonPositions.push({
    //     id: i,
    //     x: Phaser.Math.Between(100, this.mainWidth - 100),
    //     y: Phaser.Math.Between(100, this.mainHeight - 100),
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
      fontFamily: 'Verdana',
      fontSize: fontsize,
      color: color
    });
  }

  calculateBalloonX(columnIndex: number): number {
    const padding = 10; // バルーン間の余白
    const balloonWidth = 50; // バルーンの幅
    return columnIndex * (balloonWidth + padding) + this.mainWidth / 2;
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
    // 既存のリスナーを削除　たぶん解決済み
    // if (this.keydownListener) {
    //   this.input.keyboard?.off('keydown', this.keydownListener);
    // }

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
    const circleRadius = 15; // 丸の半径を少し小さくする
    const circleSpacing = 60; // 丸の間隔を増やす
    const startX = this.mainWidth / 2 - (circleSpacing * (this.questions.length - 1)) / 2;
    const startY = 40; // 丸のY座標を上に移動
    const lineColor = 0xAAAAAA; // 線の色
  
    for (let i = 0; i < this.questions.length; i++) {
      const circleX = startX + i * circleSpacing;
      const color = i === this.currentQuestionIndex ? 0xFF0000 : 0xAAAAAA;
  
      // 丸の描画
      const circle = this.add.circle(circleX, startY, circleRadius, color);
  
      // 隣の丸との間に線を引く
      if (i < this.questions.length - 1) {
        const nextCircleX = circleX + circleSpacing;
        const line = this.add.line(0, 0, circleX + circleRadius, startY, nextCircleX - circleRadius, startY, lineColor).setOrigin(0, 0);
        line.setLineWidth(2);
      }
  
      // diffrenceの値の表示
      const difference = this.differences[i];
      this.createText(circleX, startY, difference.toString(), 14, '#FFFFFF').setOrigin(0.5);
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
    const gameWidth = this.mainWidth;
    const gameHeight = this.mainHeight;

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
    const gameWidth = this.mainWidth;
    const bgWidth = bg.width;
    const scale = gameWidth / bgWidth;
    bg.setOrigin(1, 1);
    bg.setPosition(this.mainWidth, this.mainHeight);
    bg.setScale(120 / bg.width);
  }
  showBalloonsCount() {
    this.createBalloosCountBg();
    const balloonsText = `${this.totalBalloons}`;
    this.createText(this.mainWidth - 15, this.mainHeight - 110, '残り', 30, '#FFF').setOrigin(1.25, 1);
    this.createText(this.mainWidth - 15, this.mainHeight - 60, balloonsText, 50, '#FFF').setAlign('center').setOrigin(1.25, 1);
  }


  displayQuestion() {
    this.showBalloonsCount();
    this.updateBalloonsCount();
    this.input.keyboard?.removeAllListeners();// 既存のリスナーを削除 これやらんとエラー
    const currentQuestion = this.questions[this.currentQuestionIndex];
    const questionText = currentQuestion.question;

    // qFrame サイズと位置 (よく分からんけどそのまま持ってきた)
    const qFrame = this.add.image(0, 0, 'qFrame');
    const gameWidth = this.mainWidth;
    const gameHeight = this.mainHeight;
    qFrame.setOrigin(0.5, 0);
    qFrame.setPosition(this.mainWidth / 2, 60);
  
    const scaleForWidth = (gameWidth - 80) / qFrame.width;
    const scaleForHeight = (gameHeight - 120) / qFrame.height;
    qFrame.setScale(Math.min(scaleForWidth, scaleForHeight));
  
    const qFrameDisplayWidth = qFrame.width * qFrame.scaleX;
    const qFrameDisplayHeight = qFrame.height * qFrame.scaleY;
  
    const qFrameTopHalfY = qFrame.y + qFrameDisplayHeight / 4;
    const qFrameLeft = qFrame.x - qFrame.displayWidth / 2;

    // テキスト
    const textX = qFrameLeft + 40;
    const textY = 70 + qFrame.displayHeight / 2;

    this.createText(textX, textY, 'Question ' + (this.currentQuestionIndex + 1), 24, '#000');
    this.add.text(textX, textY + 80, questionText, {
      fontSize: '42px',
      color: '#fff',
      wordWrap: { width: qFrame.displayWidth - 60, useAdvancedWrap: true }
    }).setOrigin(0, 0.5);


    // qImgの配置
    const qImg = this.add.image(0, 0, `qImg${currentQuestion.imgId}`);
    qImg.setOrigin(0.5, 0.5);
    qImg.setPosition(this.mainWidth / 2, qFrameTopHalfY);

    // qImgをqFrameの上半分に収めるようにスケール調整
    const maxQImgWidth = qFrameDisplayWidth * 0.8; // qFrame幅の80%
    const maxQImgHeight = qFrameDisplayHeight / 2 * 0.8; // qFrame高さの上半分の80%
    const qImgScale = Math.min(maxQImgWidth / qImg.width, maxQImgHeight / qImg.height);
    qImg.setScale(qImgScale);

    // タイマー
    const timerDuration = 5000; // タイマーの総時間

    // 赤い背景のテキスト
    const countdownTextBg = this.add.text(
      this.mainWidth / 2,
      this.mainHeight / 2,
      '',
      {
        fontSize: '60px',
        color: '#000',
        backgroundColor: '#FF0000',
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
      this.mainWidth / 2,
      this.mainHeight / 2,
      '',
      64,
      '#FFF'
    );
    countdownText.setOrigin(0.5);

    // タイマーイベント
    const timerEvent = this.time.addEvent({
      delay: timerDuration,
      callback: () => {
        window.showInputField(false);
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
    // ユーザ入力テキストフィールド
    // 四角い背景
    const bgGraphics = this.add.graphics();
    const rectWidth = 300;
    const rectHeight = 120;

    this.add.text(textX + 10, this.mainHeight - rectHeight + 10, '数字を入力してください', {
      fontSize: '14px',
      color: '#2a5aa5'
    });

    bgGraphics.fillStyle(0xffffff, 1);
    bgGraphics.fillRect(textX, this.mainHeight -rectHeight, rectWidth, rectHeight);

    // テキストフィールド
    this.inputText = this.add.text(textX + 20, this.mainHeight - rectHeight+40, '', {
      fontSize: '64px',
      color: '#2a5aa5',
      fontFamily: 'Lobster',
    });
    window.inputText = this.inputText;

    // const inputText = this.createOutlinedText(textX + 10, this.mainHeight - rectHeight+40, '', 64, '#2a5aa5', '#2a5aa5');

    if(this.mbBool){//モバイルなら
      window.showInputField(true);
    }
    
    // 点滅するカーソル
    const cursor = this.add.text(this.inputText.x -25 + this.inputText.width + 5, this.inputText.y, '|', {
      fontSize: '64px',
      color: '#000000'
    });
    // 点滅
    const cursorBlinkEvent = this.time.addEvent({
      delay: 500,
      callback: () => {
        cursor.setVisible(!cursor.visible);
      },
      loop: true
    });



    this.keydownListener = (event: any) => {
      if (!isNaN(parseInt(event.key))) {
        // 数字が入力された場合
        const potentialText = this.inputText.text + event.key;
        if (parseInt(potentialText) <= 100) {
          this.inputText.setText(potentialText);
        }

        // カーソルの点滅を停止
        cursorBlinkEvent.remove();
        cursor.setVisible(false);
      } else if (event.key === 'Backspace' && this.inputText.text.length > 0) {
        // バックスペース ,文字削除
        this.inputText.setText(this.inputText.text.slice(0, -1));
      } else if (event.key === 'Enter' && this.inputText.text) {
        // タイマーを停止
        timerEvent.remove();
        //
        window.showInputField(false);
        //キーを削除(軽くするため)
        this.input.keyboard?.off('keydown', this.keydownListener);
        // Enter
        const currentQuestion = this.questions[this.currentQuestionIndex];
        const userAnswer = this.inputText.text; // ユーザの回答を取得
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
    const answers = JSON.parse(localStorage.getItem('userAnswers') || '{}');
    const userAnswer = answers[currentQuestion.number] || 0;


    // パーセンテージの差
    const correctAnswer = currentQuestion.answer;
    const difference = Math.round(Math.abs(correctAnswer - userAnswer));

    // 差の分だけ風船の数を減らす
    this.totalBalloons -= difference;

    // 風船の数が0以下にならないようにする
    if (this.totalBalloons < 0) {
      this.totalBalloons = 0;
    }

    // 左下にユーザの回答を表示
    this.createOutlinedText(40, this.mainHeight - 100, `あなたの回答`, 18, '#2a5aa5', '#FFFFFF');

    this.createOutlinedText(40, this.mainHeight - 70, userAnswer, 32, '#2a5aa5', '#FFFFFF');

    
    //上バー表示用
    this.differences[this.currentQuestionIndex] = difference;

    // バーの作成と初期化
    const barHeight = 20;
    const barWidth = this.mainWidth * 0.8;
    // const barX = (this.mainWidth - barWidth) / 2 +100;
    const barX = (this.mainWidth - barWidth) / 2;
    const barY = this.mainHeight - 100;

    // バーを表す画像の配置
    const progressBarFull = this.add.image(barX, barY, 'progressBarFull')
    progressBarFull.setOrigin(0, 0).setScale(barWidth / progressBarFull.width, 1);
    //console.log(this.mainWidth+","+barWidth+","+barX);
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
                  repeat: 3, // 数回繰り返す
                  onComplete: () => {
                    // 線
                    const correctAnswerPosition = barX + (correctAnswer / 100) * barWidth;
                    const lineGraphics = this.add.graphics();
                    lineGraphics.lineStyle(4, 0xFF0000, 1);
                    lineGraphics.lineBetween(correctAnswerPosition, barY - 10, correctAnswerPosition, barY + progressBarFull.height + 10);

                    // バーの上に解答
                    this.createOutlinedText(barX + (correctAnswer / 100) * barWidth, barY - 30, correctAnswer.toString(), 30, '#FF0000', '#FFFFFF');
                  }
                });
              }
            });
          }
        });
      }
    });

    // ユーザ回答線
    const userAnswerPosition = barX + (userAnswer / 100) * barWidth;
    const lineGraphics = this.add.graphics();
    lineGraphics.lineStyle(4, 0x2a5aa5, 1);
    lineGraphics.lineBetween(userAnswerPosition, barY - 10, userAnswerPosition, barY + progressBarFull.height + 10);

    // 解説に進むためのキーボードリスナーを設定
    this.keydownListener = (event: any) => {
      if (event.key === 'Enter') {
        this.input.keyboard?.off('keydown', this.keydownListener);
        this.currentStep = 'explanation';
        this.displayStep(this.currentStep);
      }
    };
    this.input.keyboard?.on('keydown', this.keydownListener);
    this.showBalloonsCount();
    this.updateBalloonsCount();
  }

  //袋文字作成
  createOutlinedText(x:number, y:number, text:string, fontSize:number, textColor:string, outlineColor:string) {
    // アウトライン用のテキスト（複数作成して周囲に配置）
    for (let offsetX = -2; offsetX <= 2; offsetX++) {
      for (let offsetY = -2; offsetY <= 2; offsetY++) {
        if (offsetX !== 0 || offsetY !== 0) {
          this.add.text(x + offsetX, y + offsetY, text, {
            fontFamily: 'Arial',
            fontSize: `${fontSize}px`,
            color: outlineColor
          }).setOrigin(0.5);
        }
      }
    }
  
    // 実際のテキスト（前面に表示）
    return this.add.text(x, y, text, {
      fontFamily: 'Arial',
      fontSize: `${fontSize}px`,
      color: textColor,
    }).setOrigin(0.5);
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
    const rectY = this.mainHeight / 2; // 画面の下半分に配置
    graphics.strokeRect(50, rectY, this.mainWidth - 100, rectHeight);

    // テキストの追加
    this.createText(60, rectY + 10, '短縮問題: ' + currentQuestion.omitQuestion, 16, '#000000');
    this.createText(60, rectY + 40, '答え: ' + currentQuestion.answer, 16, '#000000');
    this.createText(60, rectY + 70, '情報源: ' + currentQuestion.source, 16, '#000000');

    // 次の問題に進むためのキーボードリスナーを設定
    this.keydownListener = (event: any) => {
      if (event.key === 'Enter') {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions.length) {
          this.input.keyboard?.off('keydown', this.keydownListener);
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
    };
    this.input.keyboard?.on('keydown', this.keydownListener);
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

const game = new Phaser.Game(config);

// リサイズイベント
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Phaser ゲームインスタンスのサイズを更新
  game.scale.resize(width, height);
});