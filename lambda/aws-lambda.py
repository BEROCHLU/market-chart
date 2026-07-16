import json
import yfinance as yf

# 許可するCORSオリジン
lst_origins = ["http://aws-s3-serverless.s3-website-ap-northeast-1.amazonaws.com", "http://127.0.0.1:5400"]

def lambda_handler(event, context):
    strHeadersOrigin = None
    allowedOrigin = False

    # CORS用のオリジンチェック
    headers = event.get("headers", {}) or {}
    strHeadersOrigin = headers.get("origin") or headers.get("Origin")
    
    if not strHeadersOrigin:
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

    # クエリパラメータからティッカーや期間を取得
    params = event.get("queryStringParameters", {}) or {}
    ticker = params.get("t")
    strRange = params.get("r")
    strInterval = params.get("i")

    if not ticker:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Missing parameter: t"}),
        }

    try:
        # yfinanceを使用して履歴データを取得
        yft = yf.Ticker(ticker)
        df_hist = yft.history(period=strRange, interval=strInterval)
        
        if df_hist.empty:
            raise Exception("No data returned from yfinance for the specified parameters")

        # 企業名の取得処理 (yft.info から優先して取得)
        company_name = ticker
        try:
            if yft.info:
                if "longName" in yft.info:
                    company_name = yft.info["longName"]
                elif "shortName" in yft.info:
                    company_name = yft.info["shortName"]
        except Exception:
            pass # infoが取得できない場合はティッカー名で代替

        # インデックス（Date / Datetime）をリセットして列として扱えるようにする
        df_hist = df_hist.reset_index()
        
        # 日付フォーマットの変換
        if "Date" in df_hist.columns:
            df_hist["Date"] = df_hist["Date"].dt.strftime("%Y-%m-%d")
        elif "Datetime" in df_hist.columns:
            df_hist["Date"] = df_hist["Datetime"].dt.strftime("%Y-%m-%d %H:%M:%S")

        # 欠損値の削除と端数の丸め処理
        df_hist = df_hist.dropna(subset=["Open", "High", "Low", "Close"])
        df_hist = df_hist.round(2)
        
        # レスポンス用データの組み立て
        hsh = {
            "Open": df_hist["Open"].tolist(),
            "High": df_hist["High"].tolist(),
            "Low": df_hist["Low"].tolist(),
            "Close": df_hist["Close"].tolist(),
            "Volume": df_hist["Volume"].tolist(),
            "Date": df_hist["Date"].tolist(),
            "companyName": [company_name]
        }

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            "body": json.dumps(hsh),
        }

    except Exception as e:
        print(f"Error fetching data: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            "body": json.dumps({"error": str(e)}),
        }
