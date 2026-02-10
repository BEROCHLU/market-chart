#! /usr/bin/python
# coding: UTF-8

import sys
import yfinance

if __name__ == "__main__":
    try:
        args = sys.argv

        ticker = args[1]
        range = args[2]
        interval = args[3]

        if ticker:
            yft = yfinance.Ticker(ticker)
            df_hist = yft.history(period=range, interval=interval)
            df_hist = df_hist.reset_index()  # index（日時）を通常の列に戻す（JSONに含めるため）
            df_hist = df_hist.rename(columns={"index": "Date"})

            df_hist = df_hist.drop(columns=["Dividends", "Stock Splits"])  # コメントアウトでいいかも
            df_hist = df_hist.dropna(subset=["Open", "High", "Low", "Close"])  # OHLCに欠損値''が1つでもあれば行削除
            df_hist = df_hist.round(2)  # float64 => float32

            if "longName" in yft.info:
                df_hist["companyName"] = yft.info["longName"]
            elif "shortName" in yft.info:
                df_hist["companyName"] = yft.info["shortName"]
            else:
                df_hist["companyName"] = "Error Nothing"

            df_hist["Date"] = df_hist["Date"].dt.strftime("%Y-%m-%d")  # type: ignore # datetime → 文字列（ISO形式）へ整形

            hsh = df_hist.to_json(orient="records", force_ascii=False)  # fetchのためJSON配列の文字列に変換
            print(hsh)

    except Exception as e:
        print({"error": str(e)})
