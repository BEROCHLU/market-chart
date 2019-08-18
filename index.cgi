#!/usr/bin/env python
import os
#import yfinance as yf
import pandas as pd
from bottle import get, request, response, route, run, template

@get('/')
def index():
    return template('index')

if __name__=='__main__':
    run(host='0.0.0.0', port=80, server="cgi")