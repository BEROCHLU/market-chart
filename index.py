import yfinance as yf
from bottle import get, request, response, route, run, template

@get('/')
def index():
    try:
        qq = request.query.q
        print(qq)
        if qq:
            yfq = yf.Ticker(qq)

            dfHist = yfq.history(period="6mo")
            dfHist = dfHist.drop(columns=['Volume', 'Dividends', 'Stock Splits'])
            dfHist.to_csv(f'{qq}.csv')
        else:
            return template('index', qq=None)

        return template('index', qq=qq)

    except:
        return template('index', qq='error')

if __name__=='__main__':
    run(host='localhost', port=80)
