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

// This function builds a URL based on user input for ticker, period and interval.
/**
 * @function buildUrl
 * @returns {string} Returns a URL string
 */
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

    // If the hostname is 'pleasecov.g2.xrea.com', return HTTP URL with query parameters, else return HTTPS URL with query parameters
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
            // checked inverse
            if (check_inverse.checked) {
                // inverse value
                aoaPlot = _.map(aoaPlot, (array) => {
                    return _.map(array, (value) => -value);
                });
                arrLow = _.map(arrLow, (value) => -value);
                arrHigh = _.map(arrHigh, (value) => -value);
            }

            let [arrMA15, arrMA45] = [calculateMA(aoaPlot, 15), calculateMA(aoaPlot, 45)];

            let [arrTenkan, arrKijun] = [calculateTenkanSen(aoaPlot), calculateKijunSen(aoaPlot)];
            let arrChikou = calculateChikouSpan(aoaPlot);
            let [arrSSA, arrSSB] = [calculateSenkouSpanA(arrTenkan, arrKijun), calculateSenkouSpanB(aoaPlot)];

            let arrVolume = [...json.Volume];
            let arrDate = [...json.Date];
            let moLastdate = moment(_.last(arrDate));
            // shift date
            for (let i = 0; i < 26;) {
                moLastdate.add(1, 'days');
                if (1 <= moLastdate.day() && moLastdate.day() <= 5) {
                    arrDate.push(moLastdate.format('YYYY-MM-DD'));
                    i++;
                }
            }
            // if selected '6mo', the forward values will be cut off.
            if (document.querySelector('select.select-period').selectedIndex === 0) {
                const N = arrDate.length / 2;

                const arrBase = [arrMA15, arrMA45, aoaPlot, arrLow, arrHigh, arrDate, arrVolume];
                [arrMA15, arrMA45, aoaPlot, arrLow, arrHigh, arrDate, arrVolume] = _.map(arrBase, (array) => _.drop(array, N));

                const arrIchimoku = [arrTenkan, arrKijun, arrSSA, arrSSB, arrChikou];
                [arrTenkan, arrKijun, arrSSA, arrSSB, arrChikou] = _.map(arrIchimoku, (array) => _.drop(array, N));
            }

            setYAxisBounds(arrLow, arrHigh);

            optionChart.title.text = json['companyName'][0];
            optionChart.xAxis[0].data = arrDate;
            optionChart.xAxis[1].data = arrDate;
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
                    symbol: 'none',
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
                    symbol: 'none',
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
                    symbol: 'none',
                    symbolSize: 1,
                    showSymbol: false,
                    areaStyle: {
                        color: 'rgba(255, 215, 0, 0.2)'
                    },
                    lineStyle: {
                        width: 1,
                        color: 'rgba(255, 215, 0, 0.2)'
                    },
                    itemStyle: {
                        color: 'rgba(255, 215, 0, 0.2)' //This is the symbol color. It should match it with the color of the lineStyle.
                    }
                },
                {
                    name: 'SSB',
                    type: 'line',
                    data: arrSSB,
                    smooth: false,
                    symbol: 'none',
                    symbolSize: 1,
                    showSymbol: false,
                    areaStyle: {
                        color: 'rgba(30, 144, 255, 0.2)'
                    },
                    lineStyle: {
                        width: 1,
                        color: 'rgba(30, 144, 255, 0.2)'
                    },
                    itemStyle: {
                        color: 'rgba(30, 144, 255, 0.2)' //This is the symbol color. It should match it with the color of the lineStyle.
                    }
                },
                {
                    name: 'Chikou',
                    type: 'line',
                    data: arrChikou,
                    smooth: false,
                    symbol: 'none',
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
                    data: arrMA15,
                    smooth: true,
                    symbol: 'none',
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
                    data: arrMA45,
                    smooth: true,
                    symbol: 'none',
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
                    data: arrVolume
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
            let arrVolume = [...json.Volume];
            let arrDate = [...json.Date];

            if (check_inverse.checked) {
                arrLow = _.map(arrLow, (value) => -value);
                arrHigh = _.map(arrHigh, (value) => -value);
                arrDiff = _.map(arrDiff, (value) => -value);
            }
            // if selected '6mo', the forward values will be cut off.
            if (document.querySelector('select.select-period').selectedIndex === 0) {
                const N = arrDate.length / 2;
                const arrBase = [arrLow, arrHigh, arrDiff, arrDate, arrVolume];
                [arrLow, arrHigh, arrDiff, arrDate, arrVolume] = _.map(arrBase, (array) => _.drop(array, N));
            }

            optionChart.title.text = json['companyName'][0];
            optionChart.xAxis[0].data = arrDate;
            optionChart.xAxis[1].data = arrDate;
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
                    data: arrVolume
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
        document.querySelector('#text_box').value = 'SHY';
        setTimeout(() => document.querySelector('#chart_button').click(), 500);
    }
});

function averageChangeRate(arr) {
    // 変化率を計算する
    const changeRates = _.map(arr, (value, index) => {
        if (index === 0) return null;
        const previousValue = arr[index - 1];
        const rate = (value - previousValue) / previousValue;
        return Math.abs(rate);
    });

    // 平均値を計算する
    return _.mean(_.compact(changeRates));
}

function setYAxisBounds(arrLow, arrHigh) {
    let _arrLow, _arrHigh;
    const {
        checked
    } = check_inverse; //デストラクチャリング代入 check_inverseのcheckedプロパティを抽出
    let fMiny, fMaxy;

    if (checked) {
        //配列の要素がプリミティブ型なので、スプレッド構文でコピーすると深いコピーになる
        _arrLow = [...arrHigh];
        _arrHigh = [...arrLow];
    } else {
        _arrLow = [...arrLow];
        _arrHigh = [...arrHigh];
    }

    const offsetLow = averageChangeRate(_arrLow);
    const offsetHigh = averageChangeRate(_arrHigh);

    console.log((offsetLow * 100).toFixed(2), (offsetHigh * 100).toFixed(2));

    if (checked) {
        //optionChart.yAxis[0].min = _.floor(_.min(arrHigh) * 1.03);
        //optionChart.yAxis[0].max = _.ceil(_.max(arrLow) * 0.97);
        fMiny = _.min(_arrLow) * (1 + offsetLow);
        fMaxy = _.max(_arrHigh) * (1 - offsetHigh);
    } else {
        fMiny = _.min(_arrLow) * (1 - offsetLow);
        fMaxy = _.max(_arrHigh) * (1 + offsetHigh);
    }

    optionChart.yAxis[0].min = Math.abs(fMiny) < 5 ? _.floor(fMiny, 1) : _.floor(fMiny);
    optionChart.yAxis[0].max = Math.abs(fMaxy) < 10 ? _.ceil(fMaxy, 1) : _.ceil(fMaxy);
}