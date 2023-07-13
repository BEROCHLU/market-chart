#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import base64
import json
from datetime import datetime

import pandas as pd
import requests
from bottle import TEMPLATE_PATH, Bottle, debug, request, static_file, template
from dateutil import tz


def getQueryURL():
    yield from [[8, 11], [7, 10]]


app = Bottle()
edt = tz.gettz("America/New_York")
f1 = lambda ms: datetime.fromtimestamp(ms, tz=edt).strftime("%Y-%m-%d")
# hash
str_ua = b"TW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTVfNykgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwNy4wLjAuMCBTYWZhcmkvNTM3LjM2"
# index.htmlがあるフォルダ
TEMPLATE_PATH.append("./public")


@app.route("/")
@app.route("/<action>")
def index(action="index"):
    try:
        ticker = request.query.t
        strRange = request.query.r
        strInterval = request.query.i

        if ticker:
            [a, b] = getQueryURL().__next__()

            url_ticker = f"https://query2.finance.yahoo.com/v{a}/finance/chart/{ticker}"
            url_quote = f"https://query2.finance.yahoo.com/v{b}/finance/quoteSummary/{ticker}"

            ua = base64.b64decode(str_ua).decode()
            headers = {"User-Agent": ua}

            data_chart = requests.get(url_ticker, params={"range": strRange, "interval": strInterval}, headers=headers)
            data_chart = data_chart.json()

            data_summary = requests.get(url_quote, params={"modules": "quotetype"}, headers=headers)
            data_summary = data_summary.json()

            hshResult = data_chart["chart"]["result"][0]
            hshQuote = hshResult["indicators"]["quote"][0]
            hshQuote["Date"] = hshResult["timestamp"]

            # もしdata_summaryに"quoteSummary"がない場合、longName,shortNameにエラーメッセージを入れる
            if data_summary.get("quoteSummary") is None:
                hshSummary = {"longName": "quoteSummary error", "shortName": None}
            else:
                hshSummary = data_summary.get("quoteSummary", {}).get("result", [])[0]  # data_summary["quoteSummary"]["result"][0]
                hshSummary = hshSummary["quoteType"]

            df_quote = pd.DataFrame(hshQuote.values(), index=hshQuote.keys()).T
            df_quote = df_quote.dropna(subset=["open", "high", "low", "close"])  # OHLCに欠損値''が1つでもあれば行削除
            df_quote = df_quote.round(2)  # float64 => float32
            df_quote["Date"] = df_quote["Date"].map(f1)  # UNIX time toDatetime string
            df_quote.rename(columns={"open": "Open", "high": "High", "low": "Low", "close": "Close", "volume": "Volume"}, inplace=True)
            # print(df_quote)
            hsh = df_quote.to_dict(orient="list")
            quotename = hshSummary["longName"] or hshSummary["shortName"] or "NameNone"
            hsh["companyName"] = [quotename]

            strDumps = json.dumps(hsh)
        else:
            if action in ["index", "alpha"]:
                return template(action)
            else:
                return "error bottle"

        return strDumps

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
