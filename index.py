import yfinance as yf
from bottle import get, request, response, route, run, template

@get('/')
def index():
    try:
        ticker = request.query.q
        print(ticker)
        return template('index')
    except:
        return template('index')
    #q = request.query.get('q')
    #q = urllib.parse.urlparse('q')
    #qq = request.args.get('name')

    #print(qq)
    
    #return template('index')

@route('/<name>')
def geticker(name):
    
    spy = yf.Ticker(name)

    dfHist = spy.history(period="6mo")
    dfHist = dfHist.drop(columns=['Volume', 'Dividends', 'Stock Splits'])

    dfHist.to_csv(f'{name}.csv')

    print(name)

    return template('index')

if __name__=='__main__':
    run(host='localhost', port=80)
