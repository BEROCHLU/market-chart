#! /usr/bin/python
# coding: UTF-8

import yfinance as yf

qq = 'v'

yfq = yf.Ticker(qq)

dfHist = yfq.history(period="6mo")
dfHist = dfHist.drop(columns=['Volume', 'Dividends', 'Stock Splits'])

dfHist.to_csv(f'{qq}.csv')
