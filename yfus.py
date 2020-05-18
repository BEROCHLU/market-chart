#! /usr/bin/python
# coding: UTF-8

import yfinance as yf

def run():
    qq = 'CVX'

    yft = yf.Ticker(qq)

    dfHist = yft.history(period="1y")
    dfHist = dfHist.drop(columns=['Dividends', 'Stock Splits'])
    dfHist = dfHist.dropna(subset=['Open', 'High', 'Low', 'Close']) #OHLCに欠損値''が1つでもあれば行削除
    dfHist['shortName'] = yft.info['shortName']
    dfHist = dfHist.round(3)
    dfHist.to_csv(f'./old/{qq}.csv')
    #strJson = dfHist.to_json()
    #print(strJson)
if __name__ == '__main__':
    run()