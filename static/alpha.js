'use strict';

import {
    arrTicker
} from './list.js'; //mjsはサーバ側でMIME未対応

// todo XRPのグラフ修正

document.querySelector('#alpha').addEventListener('click', () => {
    const t = document.querySelector('#txt').value;
    const p = document.querySelector('.select-period').value;
    const url = `/?q=${t}&p=${p}`;

    fetch(url, {
            method: 'GET',
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        })
        .then(response => response.json())
        .then(json => {
            const arrDate = _.map(json.Open, (value, key) => {
                const n = parseInt(key);
                return dayjs(new Date(n)).format('YYYY/MM/DD');
            });

            const strName = _.chain(json.companyName).values().head().value();

            const arrLow = _.values(json.Low);
            const arrHigh = _.values(json.High);
            const arrVolume = _.values(json.Volume);

            let arrPlot = _.zip(_.values(json.Open), _.values(json.Close), arrLow, arrHigh); //open close low high
            let arrDiff = _.zipWith(arrHigh, arrLow, (fHigh, fLow) => fHigh - fLow);

            const pandaChart = echarts.init(document.getElementById('cn'));

            let plot_min = _.min(arrLow);
            let plot_max = _.max(arrHigh);

            plot_min = _.floor(plot_min * 0.97);
            plot_max = _.ceil(plot_max * 1.03);

            const strGridL = '10%';
            const strGridR = '2%';

            let option = {
                title: {
                    text: strName,
                    left: 'center'
                },
                xAxis: [{
                        type: 'category',
                        data: arrDate,
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
                        data: arrDate,
                        gridIndex: 1
                    }
                ],
                yAxis: [{
                        min: plot_min,
                        max: plot_max
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
                    trigger: 'item', //item | axis | none
                    axisPointer: {
                        type: 'cross'
                    },
                    formatter: (p) => {
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
                },
                toolbox: {
                    feature: {
                        restore: {
                            title: 'restore'
                        },
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
                        height: '11%' //出来高はtop82%の位置からheight11%を占有する
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
                        show: true,
                        type: 'slider',
                        xAxisIndex: [0, 1], //上下チャート両方含める
                        bottom: '1%',
                        throttle: 128,
                        start: 0,
                        end: 100
                    }
                ],
                series: [{
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
                        data: arrVolume
                    },
                ]
            };

            pandaChart.setOption(option);
        })
        .catch(e => {
            console.log(e)
        });
});

document.querySelector('#clr').addEventListener('click', () => {
    document.querySelector('#txt').value = '';
});

document.querySelector('#txt').addEventListener('change', () => {
    document.querySelector('#alpha').click();
});

document.querySelector('select[name="select-ticker"]').addEventListener('click', (evt) => {
    document.querySelector('#txt').value = evt.currentTarget.value;
    document.querySelector('#alpha').click();
});

//main
{
    const arrSort = _.sortBy(arrTicker);

    _.forEach(arrSort, ticker => {
        let elem = document.createElement('option');
        elem.value = ticker;
        elem.innerHTML = ticker;
        document.querySelector('select[name="select-ticker"]').append(elem);
    });

    const select_len = (53 < arrTicker.length) ? 53 : arrTicker.length;

    document.querySelector('select[name="select-ticker"]').size = select_len;

    // debug mode
    //document.querySelector('#txt').value = 'SPY';
    //document.querySelector('#btn').click();

}