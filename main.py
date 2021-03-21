#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import requests
import json
import pandas as pd

from bottle import request, route, template, static_file
from bottle import run


def getQueryURL():
    while True:
        yield (8, 11)
        yield (7, 10)


gen = getQueryURL()
[X, Y] = [2, 2]


@route("/")
@route("/<action>")
def alpha(action="index"):
    try:
        ticker = request.query.t
        strRange = request.query.r

        if ticker:
            a = gen.__next__()

            url_ticker = f"https://query{X}.finance.yahoo.com/v{a[0]}/finance/chart/{ticker}"
            url_quote = f"https://query{Y}.finance.yahoo.com/v{a[1]}/finance/quoteSummary/{ticker}"

            data_chart = requests.get(url_ticker, params={"range": strRange, "interval": "1d"})
            data_chart = data_chart.json()

            data_summary = requests.get(url_quote, params={"modules": "quotetype"})
            data_summary = data_summary.json()

            hshResult = data_chart["chart"]["result"][0]
            hshQuote = hshResult["indicators"]["quote"][0]
            hshQuote["timestamp"] = hshResult["timestamp"]

            hshSummary = data_summary["quoteSummary"]["result"][0]
            hshSummary = hshSummary["quoteType"]

            df = pd.DataFrame(hshQuote.values(), index=hshQuote.keys()).T
            df = df.dropna(subset=["open", "high", "low", "close"])  # OHLCに欠損値''が1つでもあれば行削除
            df = df.round(2)  # float64 => float32

            hsh = df.to_dict(orient="list")
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
    if os.path.exists("./ifdef"):
        run(host="localhost", port=80, reloader=True, debug=True)
    else:
        run(host="0.0.0.0", port=8080, reloader=True)
