#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import requests
import json
import pandas as pd

from bottle import request, response, route, run, template
from bottle import static_file


@route("/")
@route("/<action>")
def alpha(action="index"):
    try:
        qq = request.query.q
        pp = request.query.p

        if qq:
            url_ticker = f"https://query2.finance.yahoo.com/v8/finance/chart/{qq}"
            params = {"range": pp, "interval": "1d"}

            data = requests.get(url_ticker, params=params)
            data = data.json()

            hshResult = data["chart"]["result"][0]
            hshQuate = hshResult["indicators"]["quote"][0]
            hshQuate["timestamp"] = hshResult["timestamp"]

            df = pd.DataFrame(hshQuate.values(), index=hshQuate.keys()).T
            df = df.dropna(
                subset=["open", "high", "low", "close"]
            )  # OHLCに欠損値''が1つでもあれば行削除
            df = df.round(2)  # float64 => float32

            hsh = df.to_dict(orient='list')
            strDumps = json.dumps(hsh)
            """
            yft = yf.Ticker(qq)

            dfHist = yft.history(period=pp)  # 1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max
            dfHist = dfHist.drop(columns=["Dividends", "Stock Splits"])
            dfHist = dfHist.dropna(
                subset=["Open", "High", "Low", "Close"]
            )  # OHLCに欠損値''が1つでもあれば行削除
            dfHist = dfHist.round(3)  # float64 => float32

            if "longName" in yft.info:
                dfHist["companyName"] = yft.info["longName"]
            elif "shortName" in yft.info:
                dfHist["companyName"] = yft.info["shortName"]
            else:
                dfHist["companyName"] = "Error Nothing"

            hsh = dfHist.to_json()
            """
        else:
            if action in ["index", "alpha"]:
                return template(action)
            else:
                return "error"

        return strDumps

    except:
        print("error")
        if action in ["index", "alpha"]:
            return template(action)
        else:
            return "error"


# provide static files
@route("/static/<filename:path>")
def send_static(filename):
    return static_file(filename, root="./static")


if __name__ == "__main__":
    if os.path.exists("./.ifdef"):
        run(host="localhost", port=80, reloader=True, debug=True)
    else:
        run(host="0.0.0.0", port=8080, reloader=True)
