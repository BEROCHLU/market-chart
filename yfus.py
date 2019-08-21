#! /usr/bin/python
# coding: UTF-8

import yfinance as yf

def f1():
    qq = 'uber'

    yft = yf.Ticker(qq)

    dfHist = yft.history(period="6mo")
    dfHist = dfHist.drop(columns=['Volume', 'Dividends', 'Stock Splits'])
    dfHist['shortName'] = yft.info['shortName']
    dfHist.to_csv(f'{qq}.csv')
    #strJson = dfHist.to_json()
    #print(strJson)
if __name__ == '__main__':
    f1()