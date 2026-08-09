# Market-Chart

<div align="right">
  <a href="README.md">English</a> | 日本語
</div>

[![AWS Deploy](https://github.com/BEROCHLU/market-chart/actions/workflows/aws-deploy.yml/badge.svg?branch=master)](https://github.com/BEROCHLU/market-chart/actions/workflows/aws-deploy.yml)
[![License: MIT](https://img.shields.io/github/license/BEROCHLU/market-chart)](LICENSE)

**ローソク足チャート**、**テクニカル指標**、価格帯を視覚化する独自の**ハイライトチャート**モードを備えた、Webベースの金融チャートツールです。

## インストール

```bash
# 依存関係をインストール
pip install -r requirements.txt
```

*注: `local_test.py` とデータ取得スクリプトを実行するには、すべての依存関係をインストールしてください。*

## 使い方

```bash
python local_test.py
```

実行後、ブラウザでURLを開いてください。

## 開発：ティッカーリストの更新

`dev/ticker-source.js` を変更した場合のみ、Node.jsで `public/static/list.js` を再生成します。

```bash
npm run build-tickers
```

## デプロイ

### 実行環境

**AWS Lambda（Function URL）**（サーバーレス）  
> パフォーマンス: ★★★★★  
> [http://aws-s3-serverless.s3-website-ap-northeast-1.amazonaws.com/marketchart/](http://aws-s3-serverless.s3-website-ap-northeast-1.amazonaws.com/marketchart/)  
> *（`yfinance` とその依存関係を含むカスタムLambdaレイヤーが必要です。手順は後述します。）*

**XREA Free PHP + Python**（共有ホスティング）  
> パフォーマンス: ★★☆☆☆  
> [https://ss1.xrea.com/pleasecov.g2.xrea.com/pipm/index.html](https://ss1.xrea.com/pleasecov.g2.xrea.com/pipm/index.html)  
> *（旧式Linux環境でPython 3.8をビルドする方法は [dev/memo.md](dev/memo.md) を参照してください。）*

### 自動デプロイ（GitHub Actions）

このリポジトリには、FTPおよびAWS S3へデプロイするワークフローが含まれています。利用するには、以下の **GitHub Secrets** を設定してください。

* `FTP_USERNAME`、`FTP_PASSWORD`（XREA/FTP用）
* `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`（AWS用）

## 主な機能

### 📊 チャート形式

* **ローソク足チャート**（OHLCバー）
* **ハイライトチャート**（高値・安値の範囲をグラデーションで表示）

### 📈 テクニカル指標

* 一目均衡表（転換線、基準線、先行スパンA/B、遅行スパン）
* 25日移動平均線

### ⚙️ カスタマイズ

* **期間**: `6mo` / `1y` / `2y` / `5y` / `10y` / `max`
* **間隔**: `1d` / `1wk` / `1mo`
* **反転モード**（🔃）: 価格を反転して別の視点で表示
* **ハイライトモード**（🌡）: 高値・安値をグラデーションで表示

## 操作方法

1. **ティッカーシンボルを入力**
   * 入力欄に `MSFT`、`AAPL` などを入力するか、ドロップダウンから選択します。

2. **設定を調整**
   * 期間と間隔を選択します。

3. **チャートを表示**
   * **「📈」**をクリックして描画します。

4. **リセット**
   * 入力欄内の**「✕」**ボタンをクリックしてクリアします。

## ティッカーの例

以下のシンボルがあらかじめ登録されています。  
`ARKK, BTC-USD, ETH-USD, SPY, QQQ, TLT, VXX`

## 技術情報

* **データソース**: [yfinance](https://github.com/ranaroussi/yfinance)
* **ライブラリ**: Apache ECharts、Lodash、Moment.js
* **モバイル対応**: すべてのデバイスに対応するレスポンシブデザイン

## AWS Lambdaレイヤーのセットアップ

AWS Lambdaで `aws-lambda.py` を実行するには、`yfinance` とその依存関係を含む、Linux環境向けにビルドしたカスタムLambdaレイヤーが必要です。

### WSL2（Ubuntu 22.04）でレイヤーZIPを作成

このプロジェクトのレイヤーは、WSL2 Ubuntu 22.04でビルドしています。WSL2のPythonバージョン（例: Python 3.13）を、Lambda関数に設定したPythonランタイムと一致させてください。

以下のコマンドをWSL2で実行します。`python3.13` は、Lambda関数に設定したPythonバージョンに応じて置き換えてください。

```bash
# ディレクトリ構成を作成
mkdir -p lambda_layer/python
cd lambda_layer

# 固定バージョンのyfinanceとその依存関係をインストール
python3.13 -m pip install --target=./python "yfinance==1.5.2"

# ZIPにパッケージ化
zip -r yfinance_layer.zip python

# Windowsのデスクトップへコピー
cp yfinance_layer.zip /mnt/c/Users/username/Desktop/
```

1. `yfinance_layer.zip` をAWSコンソールから新しいLambdaレイヤーとしてアップロードします。
2. ビルドに使用したPythonと同じランタイムを互換ランタイムとして選択します。
3. 作成したレイヤーをLambda関数に追加します。
