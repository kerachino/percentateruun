# percentateruun

# 計画書

[](<tableは編集しないで(編集するときは言って)>)

|     レベル 1     |                                  レベル 2                                  |         役割分担          | 作業推定時間 | 日付   |
| :--------------: | :------------------------------------------------------------------------: | :-----------------------: | ------------ | ------ |
|   基本的な実装   |                               開発環境の構築                               |  議論しながら全員で実装   | 1 日         | 11/17  |
|                  |        画面遷移やライブラリの読み込みなど基本的なアルゴリズムの実装        |           全員            | 1 週間       | 11/18~ |
| ゲーム本体の作成 | ゲーム本体でのシーンの画面推移の実装(問題番号 → 問題 → 入力 → 回答 → 解説) |           1 人            | 1 週間       | 11/24~ |
|                  |       オブジェクトから問題や解答, 解説が表示できるような仕組みの実装       |           1 人            | 1 週間       | 11/24~ |
|                  |                            ユーザ入力機能の実装                            |           1 人            | 1 週間       | 11/24~ |
|                  |                    ゲームでの答え合わせや風船の数を表示                    |           1 人            | 1 週間       | 12/01~ |
|                  |             残量に応じた風船の描画&風船を割るモーションの作成              |           2 人            | 1 週間       | 12/08~ |
|                  |                                 背景の表示                                 |           2 人            | 1 週間       | 12/08~ |
|                  |        UI の作成(適時 UI は適用していくが、細かい UI の修正を行う)         |           全員            | 1 週間       | 12/15~ |
| その他画面の作成 |           タイトル画面の作成、ボタンと画面推移の整合性の元で構築           | 1 人(UI 認識の確認を行う) | 1 日+1 週間  | 12/17~ |
|                  |         ジャンル選択画面＆難易度選択画面の実装、基本的な UI の作成         |           1 人            | 1 週間       | 12/18~ |
|                  |                  スコア表示画面の実装、基本的な UI の作成                  |           1 人            | 1 週間       | 12/18~ |
|                  |                   ゲーム終了時のスコア表示やボタンの作成                   |           1 人            | 1 週間       | 12/18~ |
|                  |                  遊び方、設定画面作成、基本的な UI の作成                  |           1 人            | 1 週間       | 12/18~ |
|      その他      |                                 バグの修正                                 |           全員            | 2 週間       | 12/22~ |
|                  |                 問題追加(機関に限らず、見つけ次第順次追加)                 |           全員            | 2 週間       | 12/25~ |
|       公開       |                サーバにアップロード、公式ウェブサイトの作成                |           全員            | 1 日         | 1/10   |

開発メンバ(吉田、福田、姜、成見)

## BGM 候補

- [ ] https://dova-s.jp
- [ ]
- [ ]

## 問題 json 中身

{
"number": 3, //問題 id,ユーザ履歴と結んでいるので、全て異なる番号である必要
"question": "全国の小学生に聞いた、将来公務員になりたいと答えた人は?", //問題文全体
"omitQuestion": "小学生が公務員になりたいと答えた人", //省略した問題文
"answer": 18, //答えの数値
"surveyRespondent": "東日本に住む 20 代~50 代", //調査対象
"source": "厚生労働省", //アンケートソース
"sourceLink": "https://asdasdx", //リンク
"genre": "社会", //ジャンル
"level": 2, //難易度
"imgId": 0 //画像 ID とりま 0
}

## 基本的な実装

> 開発環境の構築

- [x] git コマンドでコードの取得 - 全員
- [x] コードの実行ができるか確認 - 全員

## ゲーム本体の作成

- [x] ゲーム本体でのシーンの画面推移の実装(問題番号 → 問題 → 入力 → 回答 → 解説) - 全員(授業内で作成)
- [x] オブジェクトから問題や解答, 解説が表示できるような仕組みの実装 - 全員(授業内で作成)
- [x] ユーザ入力機能の実装 (11/25 完了)
- [x] 画面推移のバグ修正 (12/1 完了) - 吉田
- [x] ゲーム本体の大まかな UI (12/1 完了) - 福田
- [x] ゲームでの答え合わせや風船の数を表示 (12/1 完了)
- [x] 背景の表示 (12/1 完了) - 吉田
- [x] 風船の配置をオブジェクトで管理(見た目重視するため) (12/6 完了) - 成見
- [x] 制限時間の設置 (12/8 完了) - 吉田
- [x] UI の調整（フォントを見やすく、素材制作、上バー作成）(12/16 とりま完了)- 吉田
- [x] バーのアニメーションと位置調整 (12/12 とりま完了) - 姜
- [x] アバターの表示 - 福田
- [x] 残量に応じた風船の描画&風船を割るモーションの作成 - 成見
- [x] 表示のタイミングの調整
- [x] 背景のシーン移り変わり
- [x] サウンド(bgm はいくつか案を上げる)(12/12 完了)

## その他画面の作成

- [x] タイトル画面の作成、ボタンと画面推移の整合性の元で構築 - 福田
- [x] ジャンル選択画面＆難易度選択画面の実装、基本的な UI の作成 - 姜
- [x] スコア表示画面の実装 - 吉田
- [x] ゲーム終了時のスコア表示やボタンの作成 - 成見
- [ ] 遊び方、設定画面作成 - 分担&話し合い

## その他

- [ ] バグ(0000 や 05 が入力できる,バーの回答ラインがたまに残る)
- [ ] 問題追加(機関に限らず、見つけ次第順次追加) - 全員
- [ ] 風船以外になにか違うモードがあっても面白いかも(BGM もシーンごとに変える)

## 公開

- [x] サーバにアップロード - 吉田
- [ ] 公式ウェブサイトの作成 - 全員
