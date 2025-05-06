@echo off
start pwsh -Command "Start-Process 'http://127.0.0.1:5400'; python local_bottle.py"