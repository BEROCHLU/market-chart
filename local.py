#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import base64
import datetime
import json

import pandas as pd
import requests
from bottle import request, route, run, static_file, template
from dateutil import tz


def getQueryURL():
    while True:
        yield [8, 11]
        yield [7, 10]


gen = getQueryURL()
edt = tz.gettz("America/New_York")
f1 = lambda ms: datetime.datetime.fromtimestamp(ms, tz=edt).strftime("%Y-%m-%d")
# hash
str_ua = b"TW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTFfMF8wKSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvODYuMC40MjQwLjE5OCBTYWZhcmkvNTM3LjM2"

@route("/")
@route("/<action>")
def alpha(action="index"):
    try:
        ticker = request.query.t
        strRange = request.query.r

        if ticker:
            [a, b] = gen.__next__()

            url_ticker = f"https://query2.finance.yahoo.com/v{a}/finance/chart/{ticker}"
            url_quote = f"https://query2.finance.yahoo.com/v{b}/finance/quoteSummary/{ticker}"

            ua = base64.b64decode(str_ua).decode()
            headers = {'User-Agent': ua}

            data_chart = requests.get(url_ticker, params={"range": strRange, "interval": "1d"}, headers=headers)
            data_chart = data_chart.json()

            data_summary = requests.get(url_quote, params={"modules": "quotetype"}, headers=headers)
            data_summary = data_summary.json()

            hshResult = data_chart["chart"]["result"][0]
            hshQuote = hshResult["indicators"]["quote"][0]
            hshQuote["date"] = hshResult["timestamp"]

            hshSummary = data_summary["quoteSummary"]["result"][0]
            hshSummary = hshSummary["quoteType"]

            df_quote = pd.DataFrame(hshQuote.values(), index=hshQuote.keys()).T
            df_quote = df_quote.dropna(subset=["open", "high", "low", "close"])  # OHLCに欠損値''が1つでもあれば行削除
            df_quote = df_quote.round(2)  # float64 => float32
            df_quote["date"] = df_quote["date"].map(f1)  # UNIX time to Datetime string

            hsh = df_quote.to_dict(orient="list")
            hsh["quotename"] = hshSummary["longName"] or hshSummary["shortName"] or "Name None"

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
            return "error"


# provide static files
@route("/static/<filename:path>")
def send_static(filename):
    return static_file(filename, root="./static")


if __name__ == "__main__":
    run(host="localhost", port=80, reloader=True, debug=False)
