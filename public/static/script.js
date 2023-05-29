'use strict';

import {
    init,
    graphic
} from "https://cdn.jsdelivr.net/npm/echarts@5.4.2/dist/echarts.esm.min.js";
import {
    arrTicker
} from './list.js';
import {
    optionChart
} from './echarts-baseoption.js';
import {
    calculateMA,
    calculateKijunSen,
    calculateTenkanSen,
    calculateSenkouSpanA,
    calculateSenkouSpanB,
    calculateChikouSpan
} from './echarts-moving.js';

const echartsPanda = init(document.getElementById('cn'));


const buildUrl = () => {
    const ticker = document.querySelector('#text_box').value;
    const period = document.querySelector('.select-period').value;
    const interval = document.querySelector('.select-interval').value;

    const params = {
        t: ticker,
        r: period,
        i: interval
    }
    const strQuery = new URLSearchParams(params);

    return location.hostname === 'pleasecov.g2.xrea.com' ?
        `http://${location.hostname}/pipm/middle.php?${strQuery}` :
        `https://l8u8iob6v1.execute-api.ap-northeast-1.amazonaws.com/new_stage?${strQuery}`;
};
/**
 * Fetches data from a given URL and sets options for a candlestick chart.
 * 
 * @param {string} strURL - The URL to fetch data from.
 * @returns {Promise} A Promise that resolves with the chart options object.
 */
const setDrawCandle = (strURL) => {
    return fetch(strURL, {
            method: 'GET',
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        })
        .then(response => response.json())
        .then(json => {
            let arrLow = [...json.Low];
            let arrHigh = [...json.High];
            let aoaPlot = _.zip([...json.Open], [...json.Close], arrLow, arrHigh); //open close low high

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

            const arrKijun = calculateKijunSen(aoaPlot);
            const arrTenkan = calculateTenkanSen(aoaPlot);
            const arrChikou = calculateChikouSpan(aoaPlot);
            const arrSSA = calculateSenkouSpanA(arrKijun, arrTenkan);
            const arrSSB = calculateSenkouSpanB(aoaPlot);
            //console.log(calculateSenkouSpanA(arrKijun, arrTenkan));
            //console.log(calculateSenkouSpanB(aoaPlot));

            optionChart.title.text = json['companyName'][0];
            optionChart.xAxis[0].data = [...json.Date];
            optionChart.xAxis[1].data = [...json.Date];
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
                    name: 'Tenkan',
                    type: 'line',
                    data: arrTenkan,
                    smooth: false,
                    symbol: 'none', //none
                    symbolSize: 1,
                    showSymbol: false,
                    lineStyle: {
                        width: 1,
                        opacity: 0.5,
                        color: '#FF0000'
                    },
                    itemStyle: {
                        color: '#FF0000'
                    }
                },
                {
                    name: 'Kijun',
                    type: 'line',
                    data: arrKijun,
                    smooth: false,
                    symbol: 'none', //none
                    symbolSize: 1,
                    showSymbol: false,
                    lineStyle: {
                        width: 1,
                        opacity: 0.5,
                        color: '#800000'
                    },
                    itemStyle: {
                        color: '#800000'
                    }
                },
                {
                    name: 'SSA',
                    type: 'line',
                    data: arrSSA,
                    smooth: false,
                    symbol: 'none', //none
                    symbolSize: 1,
                    showSymbol: false,
                    lineStyle: {
                        width: 1,
                        opacity: 0.5,
                        color: '#000000'
                    },
                    itemStyle: {
                        color: '#000000'
                    }
                },
                {
                    name: 'SSB',
                    type: 'line',
                    data: arrSSB,
                    smooth: false,
                    symbol: 'none', //none
                    symbolSize: 1,
                    showSymbol: false,
                    lineStyle: {
                        width: 1,
                        opacity: 0.5,
                        color: '#808080'
                    },
                    itemStyle: {
                        color: '#808080'
                    }
                },
                {
                    name: 'Chikou',
                    type: 'line',
                    data: arrChikou,
                    smooth: false,
                    symbol: 'none', //none
                    symbolSize: 1,
                    showSymbol: false,
                    lineStyle: {
                        width: 1,
                        opacity: 0.5,
                        color: '#8080FF'
                    },
                    itemStyle: {
                        color: '#8080FF' //This is the symbol color. Let's match it with the color of the lineStyle.
                    }
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
                        color: '#cf9f40'
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
                        color: '#0066ff'
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
                    data: [...json.Volume]
                }
            ]
        })
        .catch(e => {
            console.log(e)
        });
}
/**
 * Fetches data from a specified URL, calculates chart options based on the data, and updates the chart.
 * 
 * @param {string} strURL - The URL to fetch data from.
 * @returns {Promise<void>} A Promise that resolves when the chart has been updated.
 */
const setDrawAlpha = (strURL) => {
    return fetch(strURL, {
            method: 'GET',
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        })
        .then(response => response.json())
        .then(json => {
            let arrLow = [...json.Low];
            let arrHigh = [...json.High];
            let arrDiff = _.zipWith(arrHigh, arrLow, (fHigh, fLow) => fHigh - fLow);

            if (check_inverse.checked) {
                arrLow = _.map(arrLow, (value) => -value);
                arrHigh = _.map(arrHigh, (value) => -value);
                arrDiff = _.map(arrDiff, (value) => -value);

                optionChart.yAxis[0].min = _.floor(_.min(arrHigh) * 1.03);
                optionChart.yAxis[0].max = _.ceil(_.max(arrLow) * 0.97);
            } else {
                optionChart.yAxis[0].min = _.floor(_.min(arrLow) * 0.97);
                optionChart.yAxis[0].max = _.ceil(_.max(arrHigh) * 1.03);
            }

            optionChart.title.text = json['companyName'][0];
            optionChart.xAxis[0].data = [...json.Date];
            optionChart.xAxis[1].data = [...json.Date];
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
                        color: new graphic.LinearGradient(0, 0, 0, 1, [{
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
                        color: new graphic.LinearGradient(0, 0, 0, 1, [{
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
    const strURL = buildUrl();

    if (check_alpha.checked) {
        setDrawAlpha(strURL).then(() => {
            echartsPanda.setOption(optionChart);
        });
    } else {
        setDrawCandle(strURL).then(() => {
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
    if (evt.currentTarget.value === 'empty') return;
    document.querySelector('#text_box').value = evt.currentTarget.value;
    drawChart();
});
//画面のロードが完了
window.addEventListener('load', () => {
    //画面サイズが767px以下の時にEchatsのtitleを左寄せにする。
    if (window.innerWidth <= 767) {
        optionChart.title.left = '0%';
    } else {
        optionChart.title.left = '9%';
    }

    const select = document.querySelector('select[name="select-ticker"]');
    _.forEach(arrTicker, ticker => {
        const option = new Option(ticker, ticker);
        select.add(option);
    });

    // ローカル環境のときデバッグモード
    if (location.hostname === '127.0.0.1') {
        document.querySelector('#text_box').value = 'open';
        setTimeout(() => document.querySelector('#chart_button').click(), 500);
    }
});