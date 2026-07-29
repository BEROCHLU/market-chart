#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from bottle import TEMPLATE_PATH, Bottle, debug, request, static_file, template
import yfinance as yf

app = Bottle()
# Bottleがテンプレート（index.htmlなど）を探すディレクトリ
TEMPLATE_PATH.append("./public")


@app.get("/")  # type: ignore
@app.get("/index")  # type: ignore
def index():
    ticker = request.query.t  # type: ignore
    strRange = request.query.r  # type: ignore
    strInterval = request.query.i  # type: ignore

    if ticker:
        try:
            yft = yf.Ticker(ticker)
            df_hist = yft.history(period=strRange, interval=strInterval)

            if df_hist.empty:
                raise Exception("No data returned from yfinance for the specified parameters")

            # 企業名の取得処理 (yft.info から優先して安全に取得、失敗時はティッカー名で代替)
            company_name = ticker
            try:
                if yft.info:
                    if "longName" in yft.info:
                        company_name = yft.info["longName"]
                    elif "shortName" in yft.info:
                        company_name = yft.info["shortName"]
            except Exception:
                pass  # infoが取得できない場合はティッカー名で代替

            # インデックス（Date / Datetime）をリセットして列として扱えるようにする
            df_hist = df_hist.reset_index()

            # 日付フォーマットの変換
            if "Date" in df_hist.columns:
                df_hist["Date"] = df_hist["Date"].dt.strftime("%Y-%m-%d")
            elif "Datetime" in df_hist.columns:
                df_hist["Date"] = df_hist["Datetime"].dt.strftime("%Y-%m-%d %H:%M:%S")

            # 欠損値の削除と端数の丸め処理
            df_hist = df_hist.dropna(subset=["Open", "High", "Low", "Close"])
            df_hist = df_hist.round(2)

            # 企業名カラムを追加
            df_hist["companyName"] = company_name

            hsh = df_hist.to_json(orient="records", force_ascii=False)  # fetchのためJSON配列の文字列に変換
            return hsh
        except Exception as e:
            print(f"except error: {e}")
            return {"error": str(e)}
    else:
        return template("index")


# staticファイルがあるフォルダ
@app.get("/static/<filename:path>")  # type: ignore
def send_static(filename):
    return static_file(filename, root="./public/static")  # pyから見たstaticファイルのありか


if __name__ == "__main__":
    debug(True)  # reloaderを使うためデバッグモードで起動
    app.run(host="127.0.0.1", port=5501, reloader=True)  # 0.0.0.0 | 127.0.0.1
