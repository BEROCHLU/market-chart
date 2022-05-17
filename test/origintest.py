import json
import base64
import datetime
import json
import random

import pandas as pd
import requests
from pprint import pprint

lst_origins = ["http://127.0.0.1:5500", "http://pleasecov.g2.xrea.com", "http://aws-s3-serverless.s3-website-ap-northeast-1.amazonaws.com"]

dc_event = {
    "queryStringParameters": {"t": "btc-usd", "r": "6mo", "i": "1d"},
    "headers": {"origin": "http://pleasecov.g2.xrea.com"},
}


def lambda_handler(event, context):

    if "Origin" in event["headers"]:
        strHeadersOrigin = event["headers"]["Origin"]
    elif "origin" in event["headers"]:
        strHeadersOrigin = event["headers"]["origin"]
    else:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "text/plain; charset=UTF-8"},
            "body": "Not Found [Origin, origin]",
        }

    #strHeadersOrigin = event["headers"]["origin"]
    allowedOrigin = False

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

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": strHeadersOrigin,
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        },
        "body": "OK",
    }


if __name__ == "__main__":
    dc = lambda_handler(dc_event, None)
    pprint(dc)
