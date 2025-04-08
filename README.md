# Install
```
pip install -r requirements.txt
```
# Usage
`python local_bottle.py`
# Deployment Url
backend: AWS Lambda + API Gateway  
http://aws-s3-serverless.s3-website-ap-northeast-1.amazonaws.com/  
or  
backend: php + python  
http://pleasecov.g2.xrea.com/pipm/  

# Market-Chart User Guide
A web-based financial charting tool that displays **candlestick patterns**, **technical indicators**, and a unique **Highlight Chart** mode for visualizing price ranges.

## Key Features

### 📊 Chart Types
- **Candlestick Chart** (OHLC bars)
- **Highlight Chart** (gradient-filled high/low range)

### 📈 Technical Indicators
- Ichimoku Cloud (Tenkan, Kijun, Span A/B, Chikou)
- 25-day Moving Average

### ⚙️ Customization
- Timeframes: `6mo` / `1y` / `2y` / `5y` / `10y` / `max`
- Intervals: `1day` / `1week`
- **Invert Mode** (🔃): Flip prices to provide another view
- **Highlight Mode** (🌡): Switch to gradient-based high/low visualization

## How to Use

1. **Enter a Ticker Symbol**
   - Type in the input box (e.g., `MSFT`, `AAPL`)
   - Or select from the dropdown menu.

2. **Adjust Settings**
   - Choose a **timeframe** and **interval**.
   - Toggle **Highlight Mode** (🌡) for price-range emphasis.

3. **View Charts**
   - Click **"Chart"** to render.

4. **Reset**
   - Click **"C"** to clear inputs.

## Example Tickers
Preloaded symbols include:
```
ARKK, BTC-USD, ETH-USD, SPY, QQQ, TLT, ^VIX, ^TNX
```
*(Full list in the dropdown menu)*

## Technical Notes
- **Libraries**: ECharts (visualization), Lodash
- **Mobile-Friendly**: Responsive design for all devices