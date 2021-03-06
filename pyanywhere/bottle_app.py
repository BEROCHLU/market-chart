# A very simple Bottle Hello World app for you to get started with...
import yfinance as yf

from bottle import default_app, request, route, static_file, template


@route("/")
@route("/<action>")
def alpha(action="index"):
    try:
        qq = request.query.q
        pp = request.query.p

        if qq:
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
        else:
            if action in ["index", "alpha"]:
                return template(action)
            else:
                return "error"

        return hsh

    except:
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
