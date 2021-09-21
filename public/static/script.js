'use strict';

import {
    arrTicker
} from './list.js'; //mjsはサーバ側でMIME未対応

const calculateMA = (dayCount, data) => {
    let result = [];
    for (let i = 0, len = data.length; i < len; i++) {
        if (i < dayCount) {
            result.push('-');
            continue;
        }
        let sum = 0;
        for (let j = 0; j < dayCount; j++) {
            sum += data[i - j][1];
        }
        result.push((sum / dayCount).toFixed(2));
    }
    return result;
}

const strGridL = '10%';
const strGridR = '5%';

const optionChart = {
    title: {
        text: null,
        left: 'center'
    },
    xAxis: [{
            type: 'category',
            data: null,
            splitLine: {
                show: false,
                interval: 'auto',
                lineStyle: {
                    type: 'dashed'
                }
            },
            axisLabel: {
                interval: 'auto'
            },
            axisPointer: {
                label: {
                    show: false //チャートのラベルは日付を非表示
                }
            }
        },
        {
            type: 'category',
            data: null,
            gridIndex: 1
        }
    ],
    yAxis: [{
            min: null,
            max: null
        },
        {
            gridIndex: 1,
            axisLabel: {
                show: false
            },
            axisLine: {
                show: true //y軸
            },
            axisTick: {
                show: false //補助目盛
            },
            splitLine: {
                show: false //補助目盛
            }
        }
    ],
    axisPointer: {
        link: {
            xAxisIndex: [0, 1], //all | 上下チャート両方を含めて軸とする
        },
        label: {
            backgroundColor: '#777',
        }
    },
    tooltip: {
        trigger: 'item', //item | axis | node
        axisPointer: {
            type: 'cross'
        }
    },
    toolbox: {
        feature: {
            saveAsImage: {
                title: 'save as image'
            }
        }
    },
    grid: [{
            left: strGridL,
            top: '5%',
            right: strGridR,
            //bottom: '8%',
            height: '75%', //チャート描画はtop5% + height75% = 80%を占有する
            zlevel: 3
        },
        {
            left: strGridL,
            top: '82%', //80+2%のギャップを空ける
            right: strGridR,
            height: '12%' //出来高はtop82%の位置からheight10%を占有する
        }
    ],
    legend: {
        data: ['MA13', 'MA42'],
        right: '5%'
    },
    dataZoom: [{
            type: 'inside',
            xAxisIndex: [0, 1], //上下チャート両方含める
            start: 0,
            end: 100
        },
        {
            show: false,
            type: 'slider',
            xAxisIndex: [0, 1], //上下チャート両方含める
            bottom: '1%',
            throttle: 128,
            start: 0,
            end: 100
        }
    ],
    series: null
}

const getURL = () => {
    const t = document.querySelector('#text_box').value;
    const r = document.querySelector('.select-period').value;

    if(document.domain === 'pleasecov.g2.xrea.com') {
        return `http://pleasecov.g2.xrea.com/pipm/middle.php?t=${t}&r=${r}`;
    } 
    
    return `/?t=${t}&r=${r}`;
    
}

const drawCandle = (echartsPanda) => {
    const url = getURL();

    fetch(url, {
            method: 'GET',
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        })
        .then(response => {
            //console.log(response);
            return response.json();
        })
        .then(json => {
            const arrLow = _.values(json.Low);
            const arrHigh = _.values(json.High);
            const arrPlot = _.zip(_.values(json.Open), _.values(json.Close), arrLow, arrHigh); //open close low high

            optionChart.title.text = json['companyName'][0];
            optionChart.xAxis[0].data = _.values(json.Date);
            optionChart.xAxis[1].data = _.values(json.Date);
            optionChart.yAxis[0].min = _.floor(_.min(arrLow) * 0.97);
            optionChart.yAxis[0].max = _.ceil(_.max(arrHigh) * 1.03);
            delete optionChart.tooltip.formatter; // set default formatter

            optionChart.series = [{
                    type: 'candlestick',
                    data: arrPlot,
                    itemStyle: {
                        color: 'white',
                        color0: '#0064da',
                        borderColor: 'black',
                        borderColor0: '#0064da'
                    }
                },
                {
                    name: 'MA13',
                    type: 'line',
                    data: calculateMA(13, arrPlot),
                    smooth: true,
                    symbol: 'none', //none
                    symbolSize: 1,
                    showSymbol: false,
                    lineStyle: {
                        width: 1,
                        opacity: 0.5,
                        color: '#cf9f40'
                    },
                    itemStyle: {
                        color: '#cf9f40' //This is a symbol color. Let's match with the lineStyle color.
                    }
                },
                {
                    name: 'MA42',
                    type: 'line',
                    data: calculateMA(42, arrPlot),
                    smooth: true,
                    symbol: 'none', //none
                    symbolSize: 1,
                    showSymbol: false,
                    lineStyle: {
                        width: 1,
                        opacity: 0.5,
                        color: '#0066ff'
                    },
                    itemStyle: {
                        color: '#0066ff' //This is a symbol color. Let's match with the lineStyle color.
                    }
                },
                {
                    name: 'Volume',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    itemStyle: {
                        color: '#7fbe9e'
                    },
                    data: _.values(json.Volume)
                }
            ]

            echartsPanda.setOption(optionChart);
        })
        .catch(e => {
            console.log(e)
        });
}

const drawAlpha = (echartsPanda) => {
    const url = getURL();

    fetch(url, {
            method: 'GET',
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        })
        .then(response => {
            //console.log(response);
            return response.json();
        })
        .then(json => {
            const arrLow = _.values(json.Low);
            const arrHigh = _.values(json.High);
            const arrDiff = _.zipWith(arrHigh, arrLow, (fHigh, fLow) => fHigh - fLow);

            optionChart.title.text = json['companyName'][0];
            optionChart.xAxis[0].data = _.values(json.Date);
            optionChart.xAxis[1].data = _.values(json.Date);
            optionChart.yAxis[0].min = _.floor(_.min(arrLow) * 0.97);
            optionChart.yAxis[0].max = _.ceil(_.max(arrHigh) * 1.03);
            optionChart.tooltip.formatter = (p) => {
                if (p.seriesName === 'High') {
                    return `${p.name} ${arrHigh[p.dataIndex]}`;
                } else if (p.seriesName === 'Low') {
                    return `${p.name} ${p.value}`;
                } else if (p.seriesName === 'Volume') {
                    return `${p.name} ${p.value.toLocaleString()}`;
                } else {
                    return `${p.name} ${p.value}`;
                }
            }

            optionChart.series = [{
                    name: 'Low',
                    type: 'line',
                    stack: 'stack1',
                    smooth: true,
                    lineStyle: {
                        width: 0
                    },
                    showSymbol: false,
                    areaStyle: {
                        opacity: 0.9,
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(128, 255, 165)'
                        }, {
                            offset: 1,
                            color: 'rgba(1, 191, 236)'
                        }])
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: arrLow
                },
                {
                    name: 'High',
                    type: 'line',
                    stack: 'stack1',
                    smooth: true,
                    lineStyle: {
                        width: 0
                    },
                    showSymbol: false,
                    areaStyle: {
                        opacity: 0.9,
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(0, 221, 255)'
                        }, {
                            offset: 1,
                            color: 'rgba(77, 119, 255)'
                        }])
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: arrDiff
                },
                {
                    name: 'Volume',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    itemStyle: {
                        color: '#7fbe9e'
                    },
                    data: _.values(json.Volume)
                }
            ]

            echartsPanda.setOption(optionChart);
        })
        .catch(e => {
            console.log(e)
        });
}

document.querySelector('#chart_button').addEventListener('click', () => {
    const echartsPanda = echarts.init(document.getElementById('cn'));
    echartsPanda.clear();

    if (check_alpha.checked) {
        drawAlpha(echartsPanda);
    } else {
        drawCandle(echartsPanda);
    }

});

document.querySelector('#clear_button').addEventListener('click', () => {
    document.querySelector('#text_box').value = '';
});

document.querySelector('#text_box').addEventListener('change', () => {
    document.querySelector('#chart_button').click();
});

document.querySelector('select[name="select-ticker"]').addEventListener('change', (evt) => {
    if (evt.currentTarget.value === 'select-ticker') return;

    document.querySelector('#text_box').value = evt.currentTarget.value;
    document.querySelector('#chart_button').click();
});

//main
{
    _.forEach(arrTicker, ticker => {
        const elem = document.createElement('option');
        elem.value = ticker;
        elem.innerHTML = ticker;
        document.querySelector('select[name="select-ticker"]').append(elem);
    });

    // debug mode
    //document.querySelector('#text_box').value = 'SPY';
    //document.querySelector('#chart_button').click();
}