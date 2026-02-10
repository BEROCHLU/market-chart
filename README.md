# Market-Chart

A web-based financial charting tool that displays **candlestick patterns**, **technical indicators**, and a unique **Highlight Chart** mode for visualizing price ranges.

## Install

```bash
# Install dependencies
pip install -r requirements.txt
```

*Note: Ensure all dependencies are installed to run `local_bottle.py` and the data-fetching scripts.*

## Usage

`python local_bottle.py`

## Deployment

### Environment Specifics

* **php + python (Shared Hosting)**:  
Developed and tested on XREA Free.  
[http://pleasecov.g2.xrea.com/pipm/index.html](http://pleasecov.g2.xrea.com/pipm/index.html)  
For details on building Python 3.8 in legacy Linux environments, see.  
[dev/memo.md](dev/memo.md)  
* **AWS Lambda + API Gateway**:  
~~http://aws-s3-serverless.s3-website-ap-northeast-1.amazonaws.com/~~

### Automated Deployment (GitHub Actions)

This repository includes workflows for FTP and AWS S3 deployment. To use these, configure the following **GitHub Secrets**:

* `FTP_USERNAME`, `FTP_PASSWORD` (for XREA/FTP)
* `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (for AWS)

## Key Features

### 📊 Chart Types

* **Candlestick Chart** (OHLC bars)
* **Highlight Chart** (gradient-filled high/low range)

### 📈 Technical Indicators

* Ichimoku Cloud (Tenkan, Kijun, Span A/B, Chikou)
* 25-day Moving Average

### ⚙️ Customization

* **Timeframes**: `6mo` / `1y` / `2y` / `5y` / `10y` / `max`
* **Intervals**: `1d` / `1wk` / `1mo`
* **Invert Mode** (🔃): Flip prices to provide another view
* **Highlight Mode** (🌡): Switch to gradient-based high/low visualization

## How to Use

1. **Enter a Ticker Symbol**
* Type in the input box (e.g., `MSFT`, `AAPL`) or select from the dropdown.


2. **Adjust Settings**
* Choose a timeframe and interval.


3. **View Charts**
* Click **"Chart"** to render.


4. **Reset**
* Click **"C"** to clear inputs.



## Example Tickers

Preloaded symbols include:
`ARKK, BTC-USD, ETH-USD, SPY, QQQ, TLT, VXX`

## Technical Notes

* **Data Source**: [yfinance](https://github.com/ranaroussi/yfinance)
* **Libraries**: Apache ECharts, Lodash, Moment.js
* **Backend**: Python (Bottle / Pandas)
* **Mobile-Friendly**: Responsive design for all devices
