#! /usr/bin/python
# coding: UTF-8

import yfinance as yf

spy = yf.Ticker('SPY')

dfHist = spy.history(period="6mo")
dfHist = dfHist.drop(columns=['Volume', 'Dividends', 'Stock Splits'])

dfHist.to_csv('SPY.csv')
print('AHO')
