#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import base64
import datetime
import json

import yfinance as yf
from bottle import default_app, request, route, static_file, template
from dateutil import tz


def getQueryURL():
    while True:
        yield [8, 11]
        yield [7, 10]


gen = getQueryURL()
edt = tz.gettz("America/New_York")
f1 = lambda ms: datetime.datetime.fromtimestamp(ms, tz=edt).strftime("%Y-%m-%d")
# hash
str_ua = b"TW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTFfNikgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzkzLjAuNDU3Ny44MiBTYWZhcmkvNTM3LjM2"


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
            headers = {"User-Agent": ua}

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

            dfHist = yft.history(period=strRange)  # 1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max
            dfHist.drop(columns=["Dividends", "Stock Splits"], inplace=True)
            dfHist.dropna(subset=["Open", "High", "Low", "Close"], inplace=True)  # OHLCに欠損値''が1つでもあれば行削除
            dfHist = dfHist.round(2)  # float64 => float32
            dfHist["companyName"] = yft.info["longName"] or yft.info["shortName"] or "Error Nothing"
            dfHist.reset_index(inplace=True)

            hsh = dfHist.to_json()
        else:
            if action in ["index", "alpha"]:
                return template(action)
            else:
                return "error"

        return hsh

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


# WSGIを使う。名前実行はなし
application = default_app()
