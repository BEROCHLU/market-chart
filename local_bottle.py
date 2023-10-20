#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import base64
import json
import random
from datetime import datetime

import pandas as pd
import requests
from bottle import TEMPLATE_PATH, Bottle, debug, request, static_file, template
from dateutil import tz

app = Bottle()
edt = tz.gettz("America/New_York")
f1 = lambda ms: datetime.fromtimestamp(ms, tz=edt).strftime("%Y-%m-%d")
# hash
str_ua = b"TW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTVfNykgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzExNy4wLjAuMCBTYWZhcmkvNTM3LjM2"
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
            ua = base64.b64decode(str_ua).decode()
            headers = {"User-Agent": ua}

            a = random.randint(7, 8)  # リクエストを分散して負荷を下げる
            url_ticker = f"https://query2.finance.yahoo.com/v{a}/finance/chart/{ticker}"

            data_chart = requests.get(url_ticker, params={"range": strRange, "interval": strInterval}, headers=headers)
            data_chart = data_chart.json()

            hshResult = data_chart["chart"]["result"][0]
            hshQuote = hshResult["indicators"]["quote"][0]
            hshQuote["Date"] = hshResult["timestamp"]

            quotename = hshResult["meta"]["symbol"]

            df_quote = pd.DataFrame(hshQuote.values(), index=hshQuote.keys()).T
            df_quote = df_quote.dropna(subset=["open", "high", "low", "close"])  # OHLCに欠損値''が1つでもあれば行削除
            df_quote = df_quote.round(2)  # float64 => float32
            df_quote["Date"] = df_quote["Date"].map(f1)  # UNIX time toDatetime string
            df_quote.rename(columns={"open": "Open", "high": "High", "low": "Low", "close": "Close", "volume": "Volume"}, inplace=True)

            hsh = df_quote.to_dict(orient="list")
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
