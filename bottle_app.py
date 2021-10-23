#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import base64
import datetime
import json
import os

import pandas as pd
import requests
from bottle import TEMPLATE_PATH
from bottle import default_app, request, route, run, static_file, template
from dateutil import tz


def getQueryURL():
    while True:
        yield [8, 11]
        yield [7, 10]


edt = tz.gettz("America/New_York")
f1 = lambda ms: datetime.datetime.fromtimestamp(ms, tz=edt).strftime("%Y-%m-%d")
# hash
str_ua = b"TW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTFfNikgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzk0LjAuNDYwNi41NCBTYWZhcmkvNTM3LjM2"
# 起動したディレクトリがHOMEになるので./publicを追加する
TEMPLATE_PATH.append("./public")
os.chdir(os.path.dirname(os.path.abspath(__file__)))  # 実行ファイルパスをカレントフォルダに変更する
static_root = None

@route("/")
@route("/<action>")
def alpha(action="index"):
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

            hshSummary = data_summary["quoteSummary"]["result"][0]
            hshSummary = hshSummary["quoteType"]

            df_quote = pd.DataFrame(hshQuote.values(), index=hshQuote.keys()).T
            df_quote = df_quote.dropna(subset=["open", "high", "low", "close"])  # OHLCに欠損値''が1つでもあれば行削除
            df_quote = df_quote.round(2)  # float64 => float32
            df_quote["Date"] = df_quote["Date"].map(f1)  # UNIX time to Datetime string
            df_quote.rename(columns={"open": "Open", "high": "High", "low": "Low", "close": "Close", "volume": "Volume"}, inplace=True)
            # print(df_quote)
            hsh = df_quote.to_dict(orient="list")
            quotename = hshSummary["longName"] or hshSummary["shortName"] or "Name None"
            hsh["companyName"] = [quotename]

            strDumps = json.dumps(hsh)
        else:
            if action in ["index", "alpha"]:
                return template(action)
            else:
                return "error"

        return strDumps

    except:
        print("except error")
        if action in ["index", "alpha"]:
            return template(action)
        else:
            return "except error"


# provide static files @route(url)
@route("/static/<filename:path>")
def send_static(filename):
    return static_file(filename, root=static_root)


if __name__ == "__main__":
    static_root = "./public/static"
    run(host="localhost", port=80, reloader=True, debug=True)
else:
    static_root = "./static"
    # WSGIを使う。名前実行はなし
    application = default_app()
