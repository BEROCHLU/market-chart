import base64
import datetime
import json
import random

import pandas as pd
import requests

lst_origins = ["http://aws-s3-serverless.s3-website-ap-northeast-1.amazonaws.com", "http://127.0.0.1:5400"]


def lambda_handler(event, context):
    strHeadersOrigin = None
    allowedOrigin = False

    if "origin" in event["headers"]:
        strHeadersOrigin = event["headers"]["origin"]
    elif "Origin" in event["headers"]:
        strHeadersOrigin = event["headers"]["Origin"]
    else:
        print(event)
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "text/plain; charset=UTF-8"},
            "body": "Not Found [Origin, origin]",
        }

    for strOrigin in lst_origins:
        if strOrigin in strHeadersOrigin:
            allowedOrigin = True

    if not allowedOrigin:
        print(event)
        return {
            "statusCode": 403,
            "headers": {"Content-Type": "text/html; charset=UTF-8"},
            "body": "<!DOCTYPE html><html><head><title>403 Not Found</title></head><body><h1>Not Found</h1><p>An error occurred on the server.</p></body></html>",
        }

    # hash
    str_ua = b"TW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTVfNykgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzExNy4wLjAuMCBTYWZhcmkvNTM3LjM2"
    # lambda
    f1 = lambda ms: datetime.datetime.fromtimestamp(ms).strftime("%Y-%m-%d")

    ticker = event["queryStringParameters"]["t"]
    strRange = event["queryStringParameters"]["r"]
    strInterval = event["queryStringParameters"]["i"]

    [a, b] = [random.randint(7, 8), 6]  # リクエストを分散して負荷を下げる

    url_ticker = f"https://query2.finance.yahoo.com/v{a}/finance/chart/{ticker}"
    url_summary = f"https://query2.finance.yahoo.com/v{b}/finance/quoteSummary/{ticker}"

    ua = base64.b64decode(str_ua).decode()
    headers = {"User-Agent": ua}

    data_chart = requests.get(url_ticker, params={"range": strRange, "interval": strInterval}, headers=headers)
    data_chart = data_chart.json()

    data_summary = requests.get(url_summary, params={"modules": "quotetype"}, headers=headers)
    data_summary = data_summary.json()

    hshResult = data_chart["chart"]["result"][0]
    hshQuote = hshResult["indicators"]["quote"][0]
    hshQuote["Date"] = hshResult["timestamp"]

    if data_summary.get("quoteSummary") is None:
        quotename = hshResult["meta"]["symbol"]
    else:
        hshSummary = data_summary["quoteSummary"]["result"][0]  # data_summary.get("quoteSummary", {}).get("result", [])[0]
        hshSummary = hshSummary["quoteType"]
        quotename = hshSummary["longName"] or hshSummary["shortName"] or "Name Error"

    df_quote = pd.DataFrame(hshQuote.values(), index=hshQuote.keys()).T
    df_quote = df_quote.dropna(subset=["open", "high", "low", "close"])  # OHLCに欠損値''が1つでもあれば行削除
    df_quote = df_quote.round(2)  # float64 => float32
    df_quote["Date"] = df_quote["Date"].map(f1)  # UNIX time to Datetime string
    df_quote.rename(columns={"open": "Open", "high": "High", "low": "Low", "close": "Close", "volume": "Volume"}, inplace=True)

    hsh = df_quote.to_dict(orient="list")
    hsh["companyName"] = [quotename]

    strDumps = json.dumps(hsh)
    # print(strDumps)
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        },
        "body": strDumps,
    }
