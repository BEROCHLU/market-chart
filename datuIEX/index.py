#!/usr/local/bin/python3
import os

from bottle import get, request, route, run, template

@route('/', method="GET")
def index():
    return template('index')
'''
@route('/hello')
def hello():
    return "Hello, World!"
'''
@route('/<name>')
def geticker(name):
    print(name)
    return template('<b>Hello {{name}}</b>!', name=name)
 
if __name__=='__main__':
	run(host='0.0.0.0', port=80, server="cgi")
