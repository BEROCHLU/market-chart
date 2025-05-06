#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from bottle import TEMPLATE_PATH, Bottle, debug, request, static_file, template
import yfinance

app = Bottle()
# Bottleがテンプレート（index.htmlなど）を探すディレクトリ
TEMPLATE_PATH.append("./public")


@app.route("/")
@app.route("/<action>")  # "index" 以外にも review.html など任意のページに対応（静的HTMLテンプレート）
def index(action="index"):
    try:
        ticker = request.query.t
        range = request.query.r
        interval = request.query.i

        if ticker:
            yft = yfinance.Ticker(ticker)
            df_hist = yft.history(period=range, interval=interval)
            df_hist = df_hist.reset_index()  # index（日時）を通常の列に戻す（JSONに含めるため）
            df_hist = df_hist.rename(columns={"index": "Date"})

            df_hist = df_hist.drop(columns=["Dividends", "Stock Splits", "Capital Gains"])
            df_hist = df_hist.dropna(subset=["Open", "High", "Low", "Close"])  # OHLCに欠損値''が1つでもあれば行削除
            df_hist = df_hist.round(2)  # float64 => float32

            if "longName" in yft.info:
                df_hist["companyName"] = yft.info["longName"]
            elif "shortName" in yft.info:
                df_hist["companyName"] = yft.info["shortName"]
            else:
                df_hist["companyName"] = "Error Nothing"

            df_hist["Date"] = df_hist["Date"].dt.strftime("%Y-%m-%d")  # datetime → 文字列（ISO形式）へ整形

            hsh = df_hist.to_json(orient="records", force_ascii=False)  # fetchのためJSON配列の文字列に変換
        else:
            if action in ["index", "review.html"]:
                return template(action)  # 該当のHTMLテンプレートファイル（例: index.tpl, review.html）を描画
            else:
                return "error bottle"
        return hsh

    except:
        print("except error")
        if action in ["index", "alpha"]:
            return template(action)
        else:
            return "except error"


# staticファイルがあるフォルダ
@app.route("/static/<filename:path>")
def send_static(filename):
    return static_file(filename, root="./public/static")  # pyから見たstaticファイルのありか


if __name__ == "__main__":
    debug(True)  # reloaderを使うためデバッグモードで起動
    app.run(host="127.0.0.1", port=5400, reloader=True)
