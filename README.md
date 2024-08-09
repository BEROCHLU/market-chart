# Install
```
git clone <this repository>
pip install -r requirements.txt
```
# Usage
`python local_bottle.py`
# URL
backend: AWS Lambda + API Gateway  
http://aws-s3-serverless.s3-website-ap-northeast-1.amazonaws.com/  
or  
backend: php + python  
http://pleasecov.g2.xrea.com/pipm/  

# Market-Chart User Guide

Welcome to the `Market-Chart` application! This guide will help you navigate and utilize the features of the application to view and analyze stock market data effectively.

## Getting Started

### Accessing the Application
Simply open your web browser and navigate to the URL where the `Market-Chart` application is hosted. No installation or setup is required.

## Using the Application

### Main Features

1. **Ticker Input**: 
   - Enter the stock ticker symbol in the provided text box to specify which stock's data you want to view.

2. **Period Selection**:
   - Use the dropdown menu to select the time period for which you want to view the data. Options include 6 months, 1 year, 2 years, etc.

3. **Interval Selection**:
   - Choose the interval at which data points are displayed on the chart. You can select between daily (`1day`) and weekly (`1week`) intervals.

4. **Inverse & Alpha Options**:
   - **Inverse (🔃)**: Check this box if you want to invert the values on the chart.
   - **Alpha (🌡)**: Check this box to apply alpha blending effects, which provide a different visual representation of the data.

5. **Buttons**:
   - **Chart**: Click this button to generate the chart based on your selected options.
   - **Clear (c)**: Click this button to clear all input fields and reset the selections.

### Viewing the Chart

- Once you have entered the ticker symbol and selected your desired options, click the **Chart** button. The application will fetch the relevant data and display it as a candlestick or line chart.
- The chart provides a visual representation of the stock's performance over the selected period and interval, with additional technical indicators like moving averages and Ichimoku clouds.

### Additional Tips

- **Responsive Design**: The application adjusts its layout based on your device's screen size, ensuring a seamless experience whether you're on a desktop or mobile device.
- **Interactive Elements**: Hover over the chart elements to view detailed information about specific data points.

## Conclusion

The `Market-Chart` application is designed to be user-friendly and intuitive, allowing you to quickly access and analyze stock market data. Explore different options and settings to gain insights into market trends and make informed decisions. Enjoy using the application!
