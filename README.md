# Market-Chart

A web-based financial charting tool that displays **candlestick charts**, **technical indicators**, and a unique **Highlight Chart** mode for visualizing price ranges.

## Install

```bash
# Install dependencies
pip install -r requirements.txt
```

*Note: Ensure all dependencies are installed to run `local_bottle.py` and the data-fetching scripts.*

## Usage

```bash
python local_bottle.py
```

Then open url in your browser.

## Development: update the ticker list

Only when changing `dev/ticker-source.js`, regenerate `public/static/list.js` with Node.js:

```bash
npm run build-tickers
```

## Deployment

### Environment Specifics

**AWS Lambda + API Gateway** (Serverless)  
> Performance: ★★★★★  
> [http://aws-s3-serverless.s3-website-ap-northeast-1.amazonaws.com/](http://aws-s3-serverless.s3-website-ap-northeast-1.amazonaws.com/)  
> *(Requires a custom Lambda Layer for `yfinance` & dependencies. See instructions below.)*

**XREA Free PHP + Python** (Shared Hosting)  
> Performance: ★★☆☆☆  
> [https://ss1.xrea.com/pleasecov.g2.xrea.com/pipm/index.html](https://ss1.xrea.com/pleasecov.g2.xrea.com/pipm/index.html)  
> *(For details on building Python 3.8 in legacy Linux environments, see [dev/memo.md](dev/memo.md).)*  

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
* Click **"📈"** to render.


4. **Reset**
* Click the **"✕"** button inside the input box to clear.



## Example Tickers

Preloaded symbols include:
`ARKK, BTC-USD, ETH-USD, SPY, QQQ, TLT, VXX`

## Technical Notes

* **Data Source**: [yfinance](https://github.com/ranaroussi/yfinance)
* **Libraries**: Apache ECharts, Lodash, Moment.js
* **Mobile-Friendly**: Responsive design for all devices

## AWS Lambda Layer Setup

To run `aws-lambda.py` on AWS Lambda, you need to create a custom Lambda Layer containing `yfinance` and its dependencies (compiled for Linux environment).

### Building Layer ZIP via WSL2 (Ubuntu 22.04)

This project's Layer was built using WSL2 Ubuntu 22.04. Ensure that the Python version in WSL2 (for example, Python 3.13) matches the Python runtime configured for the Lambda function.

Run the following commands in WSL2. Replace `python3.13` with the Python version configured for the Lambda function.

```bash
# Create directory structure
mkdir -p lambda_layer/python
cd lambda_layer

# Install yfinance and requests targeting the python folder
python3.13 -m pip install --target=./python yfinance requests

# Package into ZIP
zip -r yfinance_layer.zip python

# Copy to Windows Desktop
cp yfinance_layer.zip /mnt/c/Users/username/Desktop/
```

1. Upload `yfinance_layer.zip` as a new Lambda Layer on AWS Console.
2. Select the same Python runtime used to build the layer as the compatible runtime.
3. Attach the layer to your Lambda function.
