#!/usr/bin/env python3
# -*- coding: utf-8 -*-


import yfinance as yf
from bottle import default_app, request, route, static_file, template


@route("/")
@route("/<action>")
def alpha(action="index"):
    try:
        ticker = request.query.t
        strRange = request.query.r

        if ticker:
            yft = yf.Ticker(ticker)

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
