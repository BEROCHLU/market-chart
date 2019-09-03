#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import yfinance as yf
from bottle import request, response, route, run, template

@route('/')
def index():
    try:
        qq = request.query.q
        if qq:
            yft = yf.Ticker(qq)

            dfHist = yft.history(period='6mo')
            dfHist = dfHist.drop(columns=['Volume', 'Dividends', 'Stock Splits'])
            dfHist['shortName'] = yft.info['shortName']#add company name
            #dfHist.to_csv(f'{qq}.csv')

            strJson = dfHist.to_json()
        else:
            return template('index')

        return strJson

    except:
        return template('index')

if __name__=='__main__':
    if os.path.exists('./.ifdef'):
        run(host='localhost', port=80, debug=True)
    else:
        run(host='0.0.0.0', port=80, reloader=True)
