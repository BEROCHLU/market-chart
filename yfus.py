#! /usr/bin/python
# coding: UTF-8

import yfinance as yf

if __name__ == '__main__':
    qq = '^FTSE' # CVX | ^FTSE

    yft = yf.Ticker(qq)

    dfHist = yft.history(period="1y")
    dfHist = dfHist.drop(columns=['Dividends', 'Stock Splits'])
    dfHist = dfHist.dropna(subset=['Open', 'High', 'Low', 'Close']) #OHLCに欠損値''が1つでもあれば行削除
    
    if "longName" in yft.info:
        name = yft.info['longName']
    elif "shortName" in yft.info:
        name = yft.info['shortName']
    else:
        name = "Error Nothing"

    dfHist.to_csv(f'./old/{qq}.csv')
    print(name)
    #strJson = dfHist.to_json()

