#! /usr/bin/python3
# coding: UTF-8

import base64
import datetime
import json
import random
import sys

import pandas as pd
import requests
from dateutil import tz

edt = tz.gettz("America/New_York")
f1 = lambda ms: datetime.datetime.fromtimestamp(ms, tz=edt).strftime("%Y-%m-%d")
# hash
str_ua = b"TW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTFfNikgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzkzLjAuNDU3Ny44MiBTYWZhcmkvNTM3LjM2"

if __name__ == "__main__":
    args = sys.argv

    ticker = args[1]
    strRange = args[2]

    [a, b] = [random.randint(7, 8), random.randint(10, 11)]  # リクエストを分散して負荷を下げる

    url_ticker = f"https://query2.finance.yahoo.com/v{a}/finance/chart/{ticker}"
    url_summary = f"https://query2.finance.yahoo.com/v{b}/finance/quoteSummary/{ticker}"

    ua = base64.b64decode(str_ua).decode()
    headers = {"User-Agent": ua}

    data_chart = requests.get(url_ticker, params={"range": strRange, "interval": "1d"}, headers=headers)
    data_chart = data_chart.json()

    data_summary = requests.get(url_summary, params={"modules": "quotetype"}, headers=headers)
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
    print(strDumps)
