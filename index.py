#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import yfinance as yf
from bottle import request, response, route, run, template
from bottle import static_file

@route('/')
def index():
    try:
        qq = request.query.q
        pp = request.query.p
        
        if qq:
            yft = yf.Ticker(qq)
            
            dfHist = yft.history(period=pp) #1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max
            dfHist = dfHist.drop(columns=['Volume', 'Dividends', 'Stock Splits'])
            dfHist['shortName'] = yft.info['shortName']#add company name

            strJson = dfHist.to_json()
        else:
            return template('index')

        return strJson

    except:
        return template('index')

'''
@route('/main.js')
def server_static(filename):
    return static_file(filename, root='./static/main.js')
'''
#provide static files
@route('/static/<filename:path>')
def send_static(filename):
    return static_file(filename, root='./static')

if __name__=='__main__':
    if os.path.exists('./.ifdef'):
        run(host='localhost', port=80, reloader=True, debug=True)
    else:
        run(host='0.0.0.0', port=8080, reloader=True)