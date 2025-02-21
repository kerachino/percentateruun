import * as Phaser from 'phaser';
import { calcNewWindowSize } from './windowUtil/calcNewWindowsize';
// "テスト用"はリリース時には調整する
declare global {
  interface Window {
    showInputField: (isVisible: boolean) => void;
    inputText: Phaser.GameObjects.Text;
  }
}

export class QuizGame extends Phaser.Scene {
  private totalBalloons: number = 100; // 風船の初期数
  private avatar?: Phaser.GameObjects.Image; // アバター画像用のプロパティ
  private questions: any[] = [];
  private currentQuestionIndex: number = 0;
  private currentSceneStep: string = 'title';
  private settingStep: boolean = true;
  private currentMainStep: string = 'firstStep';
  private keydownListener: any; //イベントリスナーの参照保持 ?必要っぽい
  private allQuestions = 10;
  private balloons: Phaser.GameObjects.Image[];
  // private balloonPositions: { id: number, x: number, y: number, colorId: number }[] = [];
  private balloonsData: any[] = [];
  // private bgImage: any;
  private inputText: any;
  private mbBool: boolean;
  private mainWidth: number;
  private mainHeight: number;
  private enterSound: any;
  private inputSound: any;
  private qSound: any;
  private answerFinalEffect: any;
  private enterPressed: boolean;
  private differences: number[] = [0, 0, 0, 0, 0];
  constructor() {
    super('QuizGame');
    this.keydownListener = null;
    this.questions = []; // 問題を格納する配列
    this.balloons = [];
    this.mbBool = true;
    this.mainWidth = 0;
    this.mainHeight = 0;
    this.enterPressed = false;
  }
  private gameMode: string = "normal";
  private selectedGenre: string = ''; // 選択されたジャンル
  private selectedLevel: number = 0; // 選択されたレベル

  /*settings */
  private selectedSettingIndex: number = 0;
  private settings = [
    { name: '音量', value: 50 }, // 音量設定（例）
    { name: '難易度', value: 50 }, // 難易度設定（例）
    // 他の設定項目
  ];

  preload() {
    this.mainWidth = this.cameras.main.width;
    this.mainHeight = this.cameras.main.height;
    if (this.mainWidth < 799) {
      this.mbBool = true;
    } else {
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
    this.load.image('TitleSelect0', 'assets/imgs/TitleSelect.png');
    this.load.image('userAvatar', 'assets/imgs/userAvatar.png'); // 'path/to/avatar.jpg'はアバター画像のパス
    this.load.image('persent_balloon_logo2', 'assets/imgs/persent_balloon_logo2.png');

    this.load.image('arrowKeys', 'assets/imgs/arrowKeys.png'); // 方向キーの画像
    this.load.image('enterKey', 'assets/imgs/enterKey.png'); // Enterキーの画像

    //q_img 
    for (let i = 0; i <= 1; i++) {
      this.load.image(`qImg${i}`, `assets/imgs/qImg/${i}.jpg`);
    }

    //ジャンル選択パネル
    for (let i = 0; i < 9; i++) {
      this.load.image(`jpics${i}`, `assets/imgs/jannru_senntaku/${i}.png`);
    }
    //枠
    this.load.image(`choosingFrame`, `assets/imgs/jannru_senntaku/waku2.jpg`);


    //bgm
    this.load.audio('bgm', 'assets/audio/Midnight_Blue.mp3');
    //sound
    this.load.audio('enterSound', 'assets/audio/「ピロリ」決定のボタン音・アクセント音.mp3');
    this.load.audio('inputSound', 'assets/audio/ボールペンノック.mp3');
    this.load.audio('qSound', 'assets/audio/デンッ!.mp3');
    this.load.audio('answerEffect', 'assets/audio/Accent19-1.mp3');
    this.load.audio('answerFinalEffect', 'assets/audio/デンッ!.mp3');

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
    // // 問題数を制限するため、ランダムに5つの問題を選ぶ
    this.questions = this.getRandomQuestions(allQuestions, 5);
    this.currentQuestionIndex = 0;
    this.displaySceneStep(this.currentSceneStep);
    // this.bgImage = this.add.image(0, 0, 'bg2').setOrigin(0, 0);


    // JSONデータの読み込み
    this.balloonsData = this.cache.json.get('balloonsData');

    this.enterSound = this.sound.add('enterSound', { volume: 0.5 });
    this.inputSound = this.sound.add('inputSound', { volume: 0.5 });
    this.qSound = this.sound.add('qSound', { volume: 0.5 });
    this.answerFinalEffect = this.sound.add('answerFinalEffect', { volume: 0.5 });
  }

  EnterSound() { this.enterSound.play(); }
  InputSound() { this.inputSound.play(); }
  QSound() { if (this.qSound) this.qSound.play(); }

  setControllKeyExplanation() {
    // 方向キーとEnterキーの画像を配置
    const arrowKeys = this.add.image(this.mainWidth - 150, 25, 'arrowKeys').setOrigin(1, 0.5);
    const enterKey = this.add.image(this.mainWidth - 50, 25, 'enterKey').setOrigin(1, 0.5);

    arrowKeys.setScale((this.mainWidth / arrowKeys.width) * 0.04);
    enterKey.setScale((this.mainWidth / enterKey.width) * 0.04);

    // アニメーションを追加（例：上下に動かす）
    this.tweens.add({
      targets: [arrowKeys, enterKey],
      y: '+=10', // 10ピクセル下に移動
      ease: 'Power1',
      duration: 800,
      yoyo: true, // 元の位置に戻る
      repeat: -1 // 無限に繰り返す
    });

    this.createText(this.mainWidth - 150, 25, '選択', 24, '#000');
    this.createText(this.mainWidth - 50, 25, '決定', 24, '#000');

  }

  displaySceneStep(step: string) {
    this.updateBg();
    this.showBalloons();
    this.createVehicle();
    this.setControllKeyExplanation();
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.settingScene();
    });

    switch (step) {
      case 'title':
        this.titleScene();
        break;
      case 'genre':
        this.genreScene();
        break;
      case 'score':
        this.scoreScene();
        break;
      case 'level':
        this.levelScene();
        break;
      case 'main':
        this.MainSceneStep(this.currentMainStep);
        break;
      default:
        console.log('Invalid step: ' + step);
        break;
    }
  }

  scoreScene() {
    // スコア画面の処理

    // ローカルストレージから問題とユーザの回答情報を取得
    const allQuestions = this.cache.json.get('questions');
    const userAnswersJSON = localStorage.getItem('userAnswers');
    const userAnswers: { [key: string]: string } = userAnswersJSON ? JSON.parse(userAnswersJSON) : {};

    // スコア表示用のテキストを作成
    let scoreText = 'スコア\n\n';

    // 各問題に対してユーザの回答情報を表示
    allQuestions.forEach((question: { omitQuestion: string, number: number }) => {
      const userAnswer = userAnswers[question.number] || '未回答';
      scoreText += `${question.omitQuestion}: ${userAnswer}\n`;
    });

    // スコア表示用のテキストを表示
    this.add.text(100, 100, scoreText, { fontSize: '24px', color: '#FFF' });

    // キー入力待機
    this.input.keyboard?.once('keydown', (event: any) => {
      // スタート画面に戻る
      this.currentSceneStep = 'start';
      this.displaySceneStep(this.currentSceneStep);
    });
  }

  settingScene() {
    // 設定項目のテキストオブジェクトを生成し、画面に配置
    this.settings.forEach((setting, index) => {
      const yPos = 100 + index * 50; // 項目間の間隔を50ピクセルとする
      this.add.text(100, yPos, `${setting.name}: ${setting.value}`, { fontSize: '24px' });
    });

    // キーボードイベントリスナーの設定
    this.input.keyboard?.on('keydown', (event: any) => {
      if (event.key === 'ArrowUp' && this.selectedSettingIndex > 0) {
        this.selectedSettingIndex--;
        this.updateSettingsDisplay();
      } else if (event.key === 'ArrowDown' && this.selectedSettingIndex < this.settings.length - 1) {
        this.selectedSettingIndex++;
        this.updateSettingsDisplay();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        // 左右キーでの設定値変更（例として音量の変更）
        if (this.settings[this.selectedSettingIndex].name === '音量') {
          this.settings[this.selectedSettingIndex].value += (event.key === 'ArrowRight' ? 10 : -10);
          this.settings[this.selectedSettingIndex].value = Phaser.Math.Clamp(this.settings[this.selectedSettingIndex].value, 0, 100); // 0から100の範囲に制限
          this.updateSettingsDisplay();
        }
      }
      //
      // } else if(event.key === 'space') {
      //     this.input.keyboard?.off('keydown', this.keydownListener);
      //     this.currentSceneStep = 'setting';
      //     this.displaySceneStep(this.currentSceneStep);
      // }
    });
  }

  updateSettingsDisplay() {
    // 画面上の設定項目を更新
    this.settings.forEach((setting, index) => {
      const yPos = 100 + index * 50;
      const text = this.children.getByName(`settingText${index}`) as Phaser.GameObjects.Text;
      if (text) {
        text.setText(`${setting.name}: ${setting.value}`);
        text.setColor(index === this.selectedSettingIndex ? '#FF0000' : '#FFFFFF'); // 選択された項目を赤色で表示
      }
    });
  }


  setAspectRatio(widthRatio: number, heightRatio: number) {
    // ウィンドウのサイズを取得
    const [newWidth, newHeight] = calcNewWindowSize(widthRatio, heightRatio);

    // Phaser ゲームインスタンスのサイズを更新
    this.game.scale.resize(newWidth, newHeight);
  }

  titleScene() {
    this.updateBg();
    this.showBalloons();
    this.createVehicle();

    const logoX = this.mainWidth * 0.8
    const logoY = this.mainHeight * 0.6
    const titleLogo = this.add.image(this.mainWidth * 0.1, this.mainHeight * 0.1, 'persent_balloon_logo2')
    //サイズ調整

    if (this.currentSceneStep == 'title') {
      titleLogo.setOrigin(0, 0).setScale(logoX / titleLogo.width, logoY / titleLogo.height);
    } else {

    }

    // const images = ['TitleSelect0', 'TitleSelect0']; // 画像のキー名
    const images = ['TitleSelect0', 'TitleSelect0']; // 画像のキー名
    let selectedImageIndex = 0; // 最初に選択されている画像

    // 画像の表示
    const imageObjects = images.map((imageKey, index) => {
      const xPosition = index === selectedImageIndex ? this.mainWidth / 2 : this.mainWidth * 1.5; // 最初の画像を中央に、他を画面外に
      return this.add.image(xPosition, this.mainHeight / 2, imageKey).setOrigin(0.5);
    });

    const updateImagesPosition = () => {
      imageObjects.forEach((image, index) => {
        this.tweens.add({
          targets: image,
          x: index === selectedImageIndex ? this.mainWidth / 2 : this.mainWidth * 1.5, // 選択されている画像を中央に、他を画面外に
          ease: 'Power1',
          duration: 500
        });
      });
    };

    this.keydownListener = (event: any) => {
      if (event.key === 'ArrowRight' && selectedImageIndex < images.length - 1) {
        selectedImageIndex++;
        updateImagesPosition();
      } else if (event.key === 'ArrowLeft' && selectedImageIndex > 0) {
        selectedImageIndex--;
        updateImagesPosition();
      } else if (event.key === 'Enter') {
        this.input.keyboard?.off('keydown', this.keydownListener);
        // 選択された画像に応じた処理
        if (selectedImageIndex === 0) {
          // 通常ゲームスタート
          this.startGameMode('normal');
        } else if (selectedImageIndex === 1) {
          // エンドレスモード
          this.startGameMode('endless');
        }
        this.currentSceneStep = 'genre';
        this.displaySceneStep(this.currentSceneStep);
      }
    };
    this.input.keyboard?.on('keydown', this.keydownListener);
  }

  startGameMode(mode: string) {
    this.gameMode = mode; // ゲームモードを設定
  }

  genreScene() {
    // 利用可能なジャンルのリスト
    const genres = ['ランダム', '国語', '算数', '理科', '社会', '英語', '保健', '生活', '雑学'];

    // 最初に選択されているジャンルのインデックス
    let selectedGenreIndex = 0;

    // const jPanel = ["", "", "",
    //   "", "", "",
    //   "", "", ""];
    // for (let i = 0; i < jPanel.length; i++) {
    //   jPanel[i] = `jpics${i}`;
    // }

    const jPanel = [];


    //パネル
    const jPanelX = this.mainWidth / 10;
    const jPanelY = this.mainHeight / 8;
    const jPanelW = this.mainWidth / 5;
    const jPanelWb = this.mainWidth / 10;
    const jPanelH = this.mainHeight / 8;
    const jPanelHb = this.mainHeight / 16;
    const frame = this.add.image(jPanelX - jPanelW * 0.1, jPanelY - jPanelH * 0.1, "choosingFrame");
    frame.setOrigin(0, 0).setScale(jPanelW * 1.2 / frame.width, jPanelH * 1.2 / frame.height);

    for (let y = jPanelY, i = 0; y < this.mainHeight * 5 / 8; y += jPanelH + jPanelHb) {
      for (let x = jPanelX; x < this.mainWidth - jPanelW; x += jPanelW + jPanelWb) {
        jPanel[i] = this.add.image(x, y, `jpics${i}`);
        jPanel[i].setOrigin(0, 0).setScale(jPanelW / jPanel[i].width, jPanelH / jPanel[i].height);
        i++;
      }
    }


    // 選択されているジャンルを表示
    const genreText = this.add.text(this.mainWidth / 2, this.mainHeight * 3 / 4, `選択されているジャンル: ${genres[selectedGenreIndex]}`, {
      fontSize: '24px',
      color: '#FF0000'
    }).setOrigin(0.5);

    const updateSelectedGenre = () => {
      if(selectedGenreIndex>8){
        selectedGenreIndex-=9;
      }
      if(selectedGenreIndex<0){
        selectedGenreIndex+=9;
      }
      genreText.setText(`選択されているジャンル: ${genres[selectedGenreIndex]}`);
    };

    const moveFrame = () => {
      frame.x = jPanelX - jPanelW * 0.1 + (selectedGenreIndex % 3) * (jPanelW + jPanelWb);
      frame.y = jPanelY - jPanelH * 0.1 + Math.floor(selectedGenreIndex / 3) * (jPanelH + jPanelHb);
      //console.log(selectedGenreIndex/3);
    };


    // モード 保留(5つに絞らなくても、5回目で終了すれば良い？)
    // if(this.gameMode == `normal`){
    //   this.questions = this.getRandomQuestions(allQuestions, 5);
    // }selectedGenreIndex

    this.keydownListener = (event: any) => {
      if (event.key === 'ArrowRight' ) {//&& selectedGenreIndex < genres.length - 1
        selectedGenreIndex++;
        updateSelectedGenre();
        moveFrame();
      } else if (event.key === 'ArrowLeft') {
        selectedGenreIndex--;
        updateSelectedGenre();
        moveFrame();
      } else if (event.key === 'ArrowUp') {
        selectedGenreIndex -= 3;
        updateSelectedGenre();
        moveFrame();
      } else if (event.key === 'ArrowDown') {
        selectedGenreIndex += 3;
        updateSelectedGenre();
        moveFrame();
      } else if (event.key === 'Enter') {
        this.selectedGenre = genres[selectedGenreIndex];
        this.input.keyboard?.off('keydown', this.keydownListener);
        this.currentSceneStep = 'level';
        this.displaySceneStep(this.currentSceneStep);
      }
    };
    this.input.keyboard?.on('keydown', this.keydownListener);
  }

  levelScene() {
    const allQuestions = this.cache.json.get('questions');
    const levels = [0, 1, 2, 3];
    // 最初に選択されているレベル
    let selectedLevelIndex = 0;
    // 選択されているレベルを表示
    const levelText = this.add.text(this.mainWidth / 2, this.mainHeight / 2, `選択されているレベル: ランダム`, {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    const updateSelectedLevel = () => {
      if (selectedLevelIndex == 0) {
        levelText.setText(`選択されているレベル: ランダム`);
      } else {
        levelText.setText(`選択されているレベル: ${levels[selectedLevelIndex]}`);
      }
    };

    this.keydownListener = (event: any) => {
      if (event.key === 'ArrowRight' && selectedLevelIndex < levels.length - 1) {
        selectedLevelIndex++;
        updateSelectedLevel();
      } else if (event.key === 'ArrowLeft' && selectedLevelIndex > 0) {
        selectedLevelIndex--;
        updateSelectedLevel();
      } else if (event.key === 'Enter') {
        this.selectedLevel = levels[selectedLevelIndex];
        if (this.selectedGenre == 'ランダム' || this.selectedLevel == 0) {
        } else
          this.questions = this.filterQuestionsByGenreAndLevel(allQuestions, this.selectedGenre, this.selectedLevel);
        this.input.keyboard?.off('keydown', this.keydownListener);
        this.currentSceneStep = 'main';
        this.displaySceneStep(this.currentSceneStep);
      }
    };

    this.input.keyboard?.on('keydown', this.keydownListener);
  }


  filterQuestionsByGenreAndLevel(allQuestions: any[], genre: string, level: number) {
    // ジャンルとレベルに基づいて問題をフィルタリング
    if (genre !== 'ランダム' || level !== 0) {
      return allQuestions.filter(question => {
        return question.genre === genre && question.level === level;
      });
    } else if (genre === 'ランダム' && level !== 0) {
      return allQuestions.filter(question => {
        return question.level === level;
      });
    } else if (level === 0 && genre !== 'ランダム') {
      return allQuestions.filter(question => {
        return question.genre === genre;
      });
    } else {//保留　エラーが出る
      return allQuestions;
    }
  }


  MainSceneStep(step: string) {
    // 既存のリスナーを削除　たぶん解決済み
    // if (this.keydownListener) {
    //   this.input.keyboard?.off('keydown', this.keydownListener);
    // }

    //問題数が下回ったらエラー処理
    if (this.currentQuestionIndex >= this.questions.length) {
      this.displayGameEnd();
      // alert("問題文が足りないエラー");
    }

    // this.clearScene(); //処理を軽くするには下をfirstStepに入れ、これを削除できるようにする
    this.updateBg();
    this.showBalloons();
    this.createVehicle();

    this.displayQuestionNumber();

    this.displayAvatar();

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
      case 'gameEnd':
        this.displayGameEnd();
        break;
      default:
        console.log('Invalid step: ' + step);
        break;
    }
  }

  displayGameEnd() {
    /* ゲームクリアのメッセージを表示
    const gameClearText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, 'Congratulations!', {
      font: '180px Roboto',
      color: '#FFD700'
    });
    gameClearText.setOrigin(0.5);
    */
  
    // 最終スコアを表示
    const finalScoreText = this.add.text(100, 500, `Final Score: ${this.totalBalloons}`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: {
        x: 10,
        y: 5
      }
    });
  
    // "Enterでタイトル画面へ戻る"メッセージを表示
    const returnMessage = this.add.text(100, 550, 'Press Enter to return to the title screen', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: {
        x: 10,
        y: 5
      }
    });
  
    // Enterキーのリスナーを追加
    this.keydownListener = (event: any) => {
      if (event.key === 'Enter') {
        this.input.keyboard?.off('keydown', this.keydownListener);
  
        // ページをリロード
        window.location.reload();
      }
    };
    this.input.keyboard?.on('keydown', this.keydownListener);
  }
  
  

  displayGameOver() {
    const gameOverText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 200, 'Game Over', {
      font: '128px Roboto',
      color: '#800000'
      });
      gameOverText.setOrigin(0.5);
      
    this.keydownListener = (event: any) => {
      if (event.key === 'Enter') {
        this.input.keyboard?.off('keydown', this.keydownListener);

        window.location.reload();

        this.currentSceneStep = 'title';
        this.displaySceneStep(this.currentSceneStep);
      }
    };
    this.input.keyboard?.on('keydown', this.keydownListener);
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



  firstStep() {
    this.updateBg();
    this.showBalloons();
    this.createVehicle();

    const bgm = this.sound.add('bgm', { loop: true, volume: 0.2 });
    bgm.play();

    this.currentMainStep = 'question';
    this.MainSceneStep(this.currentMainStep);
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

  showBalloonsCount(num: number) {
    this.createBalloosCountBg();
    const balloonsText = `${num}`;
    this.createText(this.mainWidth - 15, this.mainHeight - 110, '残り', 30, '#FFF').setOrigin(1.25, 1);
    if (num >= 100) {
      this.createText(this.mainWidth - 0, this.mainHeight - 60, balloonsText, 50, '#FFF').setAlign('center').setOrigin(1.25, 1);
    } else {
      this.createText(this.mainWidth - 15, this.mainHeight - 60, balloonsText, 50, '#FFF').setAlign('center').setOrigin(1.25, 1);
    }
  }

  //振動して上に消える版
  updateBalloonsCount() {
    const removeInterval = 50; // 0.1秒おき
    const intervalId = setInterval(() => {
      if (this.balloons.length > this.totalBalloons) {
        const balloonToRemove = this.balloons.pop();
        if (balloonToRemove) {
          // 風船削除アニメーション
          const moveDistanceX = 10; // 左右に振動させる距離
          const moveDuration = 5; // 1回の振動の時間
          const moveDelay = 25; // 振動の間隔

          // 左右に振動するアニメーション
          this.tweens.add({
            targets: balloonToRemove,
            duration: 10,
            //duration: 1,
            //scaleX: 0,
            //scaleY: 0,
            x: balloonToRemove.x - moveDistanceX,
            ease: 'EaseInOutQuad',
            yoyo: true,
            repeat: 1,
            onComplete: () => {
              // 上方向に移動するアニメーション
              this.tweens.add({
                targets: balloonToRemove,
                duration: 500,
                //duration: 1,
                alpha: 0,
                y: balloonToRemove.y - 500, // 上方向に移動させる（負の値）
                onComplete: () => {
                  // アニメーション完了後に風船を削除
                  balloonToRemove.destroy();
                  this.showBalloonsCount(this.balloons.length);
                }
              });
            }
          });
        }
      } else {
        clearInterval(intervalId); // 残りの風船が指定数以下になったらインターバルを停止
      }
    }, removeInterval);
  }

  //回転して消える版
  /* const rotationDirection = Phaser.Math.RND.sign();
   const moveDirectionX = Phaser.Math.RND.between(-50, 50);
   const moveDirectionY = Phaser.Math.RND.between(-50, 50);

   this.tweens.add({
     targets: balloonToRemove,
     duration: 1000,
     scaleX: 0,
     scaleY: 0,
     alpha: 0,
     rotation: 2 * Math.PI * rotationDirection,
     x: balloonToRemove.x + moveDirectionX, 
     y: balloonToRemove.y + -50,//moveDirectionY,
     ease: 'EaseOutQuad',
     //ease: 'Linear',
    onComplete: () => {
       // アニメーション完了後に風船を削除
       balloonToRemove.destroy();

       this.showBalloonsCount(this.balloons.length);

       // 次の風船削除タイマー
       this.time.delayedCall(10, removeBalloon);
     }
   });
 }
}
};
*/


  // 最初の風船を削除するためのタイマー
  // this.time.delayedCall(10, removeBalloon);

  // while (this.balloons.length > this.totalBalloons) {
  //   const balloonToRemove = this.balloons.pop();
  //   if (balloonToRemove) {
  //     balloonToRemove.destroy();
  //   }
  // }
  // }

  updateBg() {
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


  displayQuestion() {
    this.showBalloonsCount(this.totalBalloons);
    this.updateBalloonsCount();
    this.input.keyboard?.removeAllListeners();// 既存のリスナーを削除 これやらんとエラー

    this.QSound();
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
    const timerDuration = 10000; // タイマーの総時間

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
        this.currentMainStep = 'answer';
        this.input.keyboard?.removeAllListeners(); // タイマーが発動したのでリスナーをクリア
        this.MainSceneStep(this.currentMainStep);
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
    bgGraphics.fillRect(textX, this.mainHeight - rectHeight, rectWidth, rectHeight);

    // テキストフィールド
    this.inputText = this.add.text(textX + 20, this.mainHeight - rectHeight + 40, '', {
      fontSize: '64px',
      color: '#2a5aa5',
      fontFamily: 'Lobster',
    });
    window.inputText = this.inputText;

    // const inputText = this.createOutlinedText(textX + 10, this.mainHeight - rectHeight+40, '', 64, '#2a5aa5', '#2a5aa5');

    if (this.mbBool) {//モバイルなら
      window.showInputField(true);
    }

    // 点滅するカーソル
    const cursor = this.add.text(this.inputText.x - 25 + this.inputText.width + 5, this.inputText.y, '|', {
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


    // エンドレスモード処理
    if (this.gameMode === 'endless') {
      // エンドレスモードの特別な処理
      if (this.checkForBonus()) {
        this.totalBalloons += 10; // 10個の風船を追加
      }

      // エンドレスモードでは風船が0になるまで続ける
      if (this.totalBalloons <= 0) {
        this.endGame();
      }
      // else {
      //     // 次の問題へ
      //     this.currentQuestionIndex++;
      //     this.MainSceneStep('question');
      // }
    }


    this.keydownListener = (event: any) => {
      if (!isNaN(parseInt(event.key))) {
        this.InputSound();
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
      } else if (event.key === 'Enter' && this.inputText.text && this.onEnterPressed()) {
        this.EnterSound();
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
        this.currentMainStep = 'answer';
        this.MainSceneStep(this.currentMainStep);

      }
    };
    this.input.keyboard?.on('keydown', this.keydownListener);
  }

  endGame() {
    // ゲーム終了の処理
    // 例えばスコアの表示やリセット処理など
  }

  checkForBonus() {
    // 最後の5問のdifferenceが10以内かどうかをチェック
    const recentDifferences = this.differences.slice(-5);
    return recentDifferences.length === 5 && recentDifferences.every(diff => diff <= 10);
  }


  displayAnswer() {
    const currentQuestion = this.questions[this.currentQuestionIndex];
    const answers = JSON.parse(localStorage.getItem('userAnswers') || '{}');
    const userAnswer = answers[currentQuestion.number] || 0;

    // パーセンテージの差
    const correctAnswer = currentQuestion.answer;
    const difference = Math.round(Math.abs(correctAnswer - userAnswer));

    this.showBalloonsCount(this.totalBalloons);
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

    const answerEffect = this.sound.add('answerEffect', { volume: 0.5, loop: true }); // 'someSound'はあなたのサウンドファイルのキー

    this.tweens.add({
      targets: progressBarCover,
      displayWidth: 0,
      ease: 'Linear',
      //duration: 2000,
      duration: 1000,
      onStart: () => {
        answerEffect.play();
      }, onUpdate: tween => {
        const progress = tween.progress;
        answerEffect.setDetune(Phaser.Math.Linear(-1200, 1200, progress)); // ピッチ
      },
      onComplete: () => {
        this.tweens.add({
          targets: progressBarCover,
          displayWidth: barWidth,
          ease: 'Linear',
          //duration: 2000,
          duration: 1000,
          onStart: () => {
            answerEffect.play();
          }, onUpdate: tween => {
            const progress = tween.progress;
            answerEffect.setDetune(Phaser.Math.Linear(1200, -1200, progress)); // ピッチ //あえて逆に
          },
          onComplete: () => {
            // 次に5秒かけて答えの位置まで幅を縮める
            this.tweens.add({
              targets: progressBarCover,
              //setOrigin: barX,
              // displayWidth: barWidth - (correctAnswer / 100) * barWidth, // 答えの位置まで幅を縮める
              // ease: 'Linear',
              displayWidth: barWidth - (userAnswer / 100) * barWidth, // 答えの位置まで幅を縮める
              ease: 'Linear',
              //duration: 5000,
              duration: 1000,
              onStart: () => {
                answerEffect.play();
              }, onUpdate: tween => {
                const progress = tween.progress;
                answerEffect.setDetune(Phaser.Math.Linear(-1200, 1200, progress)); // ピッチ
              },
              onComplete: () => {
                // 最後に素早く上がったり下がったりするアニメーション
                this.tweens.add({
                  targets: progressBarCover,
                  displayWidth: {
                    // from: barWidth - (correctAnswer / 100) * barWidth,
                    // to: barWidth - (correctAnswer / 100) * barWidth + Phaser.Math.Between(15, 30) // 細かい左右の揺れ
                    // from: barWidth - (userAnswer / 100) * barWidth,
                    from: barWidth - (userAnswer / 100) * barWidth + Phaser.Math.Between(-30, 30),
                    //form: progressBarCover,
                    to: barWidth - (userAnswer / 100) * barWidth + Phaser.Math.Between(-30, 30) // 細かい左右の揺れ
                  },
                  ease: 'Linear',
                  duration: 100, // 揺れの速さ
                  yoyo: true,
                  repeat: 3, // 数回繰り返す
                  onStart: () => {
                    answerEffect.play();
                  }, onUpdate: tween => {
                    const progress = tween.progress;
                    answerEffect.setDetune(Phaser.Math.Linear(-1200, 1200, progress)); // ピッチ
                  },
                  onComplete: () => {
                    this.answerFinalEffect.play();
                    // 線
                    const correctAnswerPosition = barX + (correctAnswer / 100) * barWidth;
                    const lineGraphics = this.add.graphics();
                    lineGraphics.lineStyle(4, 0xFF0000, 1);
                    lineGraphics.lineBetween(correctAnswerPosition, barY - 10, correctAnswerPosition, barY + progressBarFull.height + 10);

                    this.tweens.add({
                      targets: progressBarCover,
                      //setOrigin: barX,
                      // displayWidth: barWidth - (correctAnswer / 100) * barWidth, // 答えの位置まで幅を縮める
                      // ease: 'Linear',
                      displayWidth: barWidth - (correctAnswer / 100) * barWidth, // 答えの位置まで幅を縮める
                      ease: 'Linear',
                      //duration: 5000,
                      duration: 100,

                    });
                    // バーの上に解答
                    this.createOutlinedText(barX + (correctAnswer / 100) * barWidth, barY - 30, correctAnswer.toString(), 30, '#FF0000', '#FFFFFF');

                    this.updateBalloonsCount();
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
      if (event.key === 'Enter' && this.onEnterPressed()) {
        this.EnterSound();
        this.input.keyboard?.off('keydown', this.keydownListener);
        this.currentMainStep = 'explanation';
        this.MainSceneStep(this.currentMainStep);
      }
    };
    this.input.keyboard?.on('keydown', this.keydownListener);
  }

  //袋文字作成
  createOutlinedText(x: number, y: number, text: string, fontSize: number, textColor: string, outlineColor: string) {
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
    this.showBalloonsCount(this.totalBalloons);
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
    this.add.text(60, rectY + 10, `問題: ${currentQuestion.omitQuestion}`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: {
        x: 10,
        y: 5
      }
    });

    this.add.text(60, rectY + 40, `答え: ${currentQuestion.answer}`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: {
        x: 10,
        y: 5
      }
    });

    this.add.text(60, rectY + 70, `ソース: ${currentQuestion.source}`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: {
        x: 10,
        y: 5
      }
    });
    // this.createText(60, rectY + 10, '問題: ' + currentQuestion.omitQuestion, 16, '#000000');
    // this.createText(60, rectY + 40, '答え: ' + currentQuestion.answer, 16, '#000000');
    // this.createText(60, rectY + 70, '情報源: ' + currentQuestion.source, 16, '#000000');


    if (this.totalBalloons <= 0) {
      this.displayGameOver();
    }
    // 次の問題に進むためのキーボードリスナーを設定
    this.keydownListener = (event: any) => {
      if (event.key === 'Enter' && this.onEnterPressed()) {
        this.EnterSound();
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions.length) {
          this.input.keyboard?.off('keydown', this.keydownListener);
          this.currentMainStep = 'question';
          this.MainSceneStep(this.currentMainStep);
        } else {
          // ゲーム終了
          /*this.add.text(100, 500, 'Game Over', {
            fontSize: '24px',
            color: '#ffffff'
          });
          */
          this.input.keyboard?.off('keydown', this.keydownListener);
          this.currentMainStep = 'gameEnd';
          this.MainSceneStep(this.currentMainStep);
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

  onEnterPressed() {
    if (this.enterPressed) {
      // すでにEnterキーが押されている場合は何もしない
      return false;
    }
    this.enterPressed = true; // Enterキーが押されたことを記録
    // 必要な処理が完了した後にフラグをリセットする
    this.time.delayedCall(1000, () => {// テスト用
      this.enterPressed = false;
    });
    return true;
  }

  showBalloons() {
    // 風船配列をクリア
    this.balloons.forEach(balloon => balloon.destroy());
    this.balloons = [];
    // バルーンの配置
    this.balloonsData.forEach((balloonData: { id: number, x: number, y: number, colorId: number }, i) => {

      if (i < this.totalBalloons) {
        const balloonType = `balloon${balloonData.colorId}`;
        const posX = this.calculateBalloonX(balloonData.x);
        const posY = this.calculateBalloonY(balloonData.y);
        const balloon = this.add.image(posX, posY, balloonType).setOrigin(0.5, 0);
        // その他のバルーン設定...
        this.balloons.push(balloon);
      }
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

  // アバターを表示する共通関数
  displayAvatar() {
    // 以前のアバターがあれば削除
    if (this.avatar) {
      this.avatar.destroy();
    }

    // アバターの新しいインスタンスを作成
    this.avatar = this.add.image(this.mainWidth - 10, this.mainHeight - 160, 'userAvatar').setOrigin(1.25, 1); // 位置は必要に応じて調整
    this.avatar.setScale(0.5); // サイズは必要に応じて調整
  }

  // アバター画像の動的読み込み
  loadAvatarImage(imagePath: string) {
    this.load.image('userAvatar', imagePath);
    this.load.once('complete', () => {
      this.add.image(100, 100, 'userAvatar').setScale(0.5);
    });
    this.load.start();
  }
}
// const config: Phaser.Types.Core.GameConfig = {
//   type: Phaser.AUTO,
//   width: window.innerWidth, // ウィンドウの幅に設定
//   height: window.innerHeight, // ウィンドウの高さに設定
//   parent: 'game-app',
//   scene: [QuizGame],
//   fps: {
//     target: 30,
//     forceSetTimeOut: true // 高いフレームレートを強制する
//   }
// };

// const game = new Phaser.Game(config);

// // リサイズイベント
// window.addEventListener('resize', () => {
//   const width = window.innerWidth;
//   const height = window.innerHeight;

//   // Phaser ゲームインスタンスのサイズを更新
//   game.scale.resize(width, height);
// });


