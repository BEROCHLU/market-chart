'use strict';

import * as echarts from "https://cdn.jsdelivr.net/npm/echarts@5.4.2/dist/echarts.esm.min.js";
import {
    arrTicker
} from './list.js';

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
        left: 'center',
        textStyle: {
            fontSize: 15,
        }
    },
    xAxis: [{
            type: 'category',
            data: null,
            splitLine: {
                show: true,
                interval: 'auto',
                lineStyle: {
                    type: 'solid'
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
            xAxisIndex: [0, 1], //all | 上下チャートの軸を同期する
        },
        label: {
            backgroundColor: '#777',
            precision: 'auto' //tickの小数点は上下別々に設定できない
        }
    },
    tooltip: {
        trigger: 'axis', //item | axis | node
        axisPointer: {
            type: 'cross'
        }
    },
    toolbox: {
        feature: {
            saveAsImage: {
                title: 'save as image'
            },
            dataView: {
                title: 'data view',
                lang: ['data view', 'turn off', 'refresh']
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
        data: ['SMA15', 'SMA45'],
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

const echartsPanda = echarts.init(document.getElementById('cn'));

const getURL = () => {
    const t = document.querySelector('#text_box').value;
    const r = document.querySelector('.select-period').value;
    const i = document.querySelector('.select-interval').value;

    const params = {
        t: t,
        r: r,
        i: i
    }

    const query = new URLSearchParams(params);

    if (document.domain === 'pleasecov.g2.xrea.com') {
        return `http://${document.domain}/pipm/middle.php?${query}`;
    }

    return `https://l8u8iob6v1.execute-api.ap-northeast-1.amazonaws.com/new_stage?${query}`;
}

const setDrawCandle = () => {
    const url = getURL();

    return fetch(url, {
            method: 'GET',
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        })
        .then(response => response.json())
        .then(json => {
            let arrLow = _.values(json.Low);
            let arrHigh = _.values(json.High);
            let aoaPlot = _.zip(_.values(json.Open), _.values(json.Close), arrLow, arrHigh); //open close low high

            if (check_inverse.checked) {
                aoaPlot = _.map(aoaPlot, (array) => {
                    return _.map(array, (value) => -value);
                });
                arrLow = _.map(arrLow, (value) => -value);
                arrHigh = _.map(arrHigh, (value) => -value);

                optionChart.yAxis[0].min = _.floor(_.min(arrHigh) * 1.03);
                optionChart.yAxis[0].max = _.ceil(_.max(arrLow) * 0.97);
            } else {
                optionChart.yAxis[0].min = _.floor(_.min(arrLow) * 0.97);
                optionChart.yAxis[0].max = _.ceil(_.max(arrHigh) * 1.03);
            }

            optionChart.title.text = json['companyName'][0];
            optionChart.xAxis[0].data = _.values(json.Date);
            optionChart.xAxis[1].data = _.values(json.Date);
            delete optionChart.tooltip.formatter; // set default formatter

            optionChart.series = [{
                    type: 'candlestick',
                    data: aoaPlot,
                    itemStyle: {
                        color: 'white',
                        color0: '#0064da',
                        borderColor: 'black',
                        borderColor0: '#0064da'
                    },
                    barMinWidth: 2,
                    barCategoryGap: '2%',
                },
                {
                    name: 'SMA15',
                    type: 'line',
                    data: calculateMA(15, aoaPlot),
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
                    name: 'SMA45',
                    type: 'line',
                    data: calculateMA(45, aoaPlot),
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
                    barMinWidth: 2,
                    barCategoryGap: '2%',
                    data: _.values(json.Volume)
                }
            ]
        })
        .catch(e => {
            console.log(e)
        });
}

const setDrawAlpha = () => {
    const url = getURL();

    return fetch(url, {
            method: 'GET',
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        })
        .then(response => response.json())
        .then(json => {
            let arrLow = _.values(json.Low);
            let arrHigh = _.values(json.High);
            let arrDiff = _.zipWith(arrHigh, arrLow, (fHigh, fLow) => fHigh - fLow);

            if (check_inverse.checked) {
                arrDiff = _.map(arrDiff, (value) => -value);
                arrLow = _.map(arrLow, (value) => -value);
                arrHigh = _.map(arrHigh, (value) => -value);

                optionChart.yAxis[0].min = _.floor(_.min(arrHigh) * 1.03);
                optionChart.yAxis[0].max = _.ceil(_.max(arrLow) * 0.97);
            } else {
                optionChart.yAxis[0].min = _.floor(_.min(arrLow) * 0.97);
                optionChart.yAxis[0].max = _.ceil(_.max(arrHigh) * 1.03);
            }

            optionChart.title.text = json['companyName'][0];
            optionChart.xAxis[0].data = _.values(json.Date);
            optionChart.xAxis[1].data = _.values(json.Date);
            optionChart.tooltip.formatter = (arrParam) => {
                // ['High', 'Low', 'Volume']の順にツールチップを表示
                arrParam = _.orderBy(arrParam, ['seriesName'], ['High', 'Low', 'Volume']);
                let strTooltip = '';
                let strDate;

                _.forEach(arrParam, param => {
                    const sn = param.seriesName;
                    const v = sn === 'High' ? arrHigh[param.dataIndex] : param.value;
                    const s = `<div>${sn} ${v.toLocaleString()}</div>`;

                    strTooltip += s;
                    strDate = param.name;
                });

                return `<div>${strDate}</div>${strTooltip}`;
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
                            color: 'rgba(128, 255, 165, 0.01)'
                        }, {
                            offset: 1,
                            color: 'rgba(1, 191, 236, 0.01)'
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
                            color: 'rgba(77, 119, 2550)'
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
        })
        .catch(e => {
            console.log(e)
        });
}
/**
 * Clears the EChartsPanda and sets the value of the select-ticker to an empty string.
 * If check_alpha is checked, setDrawAlpha is called and then echartsPanda is updated with the optionChart.
 * Otherwise, setDrawCandle is called and then echartsPanda is updated with the optionChart.
 *
 * @function drawChart
 * @returns {void}
 */
const drawChart = () => {
    echartsPanda.clear();
    document.querySelector('select[name="select-ticker"]').value = '';

    if (check_alpha.checked) {
        setDrawAlpha().then(() => {
            echartsPanda.setOption(optionChart);
        });
    } else {
        setDrawCandle().then(() => {
            echartsPanda.setOption(optionChart);
        });
    }
};

const clearInputs = () => {
    document.querySelector('#text_box').value = '';
    document.querySelector('select[name="select-ticker"]').value = '';
};

document.querySelector('#chart_button').addEventListener('click', drawChart);
//document.querySelector('#check_alpha').addEventListener('change', drawChart);
document.querySelector('#text_box').addEventListener('change', drawChart);
document.querySelector('#clear_button').addEventListener('click', clearInputs);
document.querySelector('select[name="select-ticker"]').addEventListener('change', (evt) => {
    if (evt.currentTarget.value === 'select-ticker') return;
    document.querySelector('#text_box').value = evt.currentTarget.value;
    drawChart();
});

// entry point
(() => {
    _.forEach(arrTicker, ticker => {
        const elem = document.createElement('option');
        elem.value = ticker;
        elem.innerHTML = ticker;
        document.querySelector('select[name="select-ticker"]').append(elem);
    });
    // debug mode
    //document.querySelector('#text_box').value = 'SPY';
    //document.querySelector('#chart_button').click();
})();