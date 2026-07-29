#! /usr/bin/python
# coding: UTF-8

import sys
import json
import yfinance as yf

if __name__ == "__main__":
    try:
        args = sys.argv
        if len(args) < 4:
            raise Exception("Missing arguments. Usage: wakeup.py <ticker> <range> <interval>")

        ticker = args[1]
        strRange = args[2]
        strInterval = args[3]

        # yfinanceを使用して履歴データを取得
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

        # オブジェクトの配列形式（records）に変換して出力
        records = df_hist.to_dict(orient="records")
        print(json.dumps(records, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
