'use strict';
/**
 * 
 * @param {number} dayCount 
 * @param {Array<number>} data 
 */
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

/*
 *!event
 */

 // todo XRPのグラフ修正

document.querySelector('#btn').addEventListener('click', () => {
    const t = document.querySelector('#txt').value;
    const p = document.querySelector('.select-period').value;
    const URL = `/?q=${t}&p=${p}`;

    fetch(URL, {
            method: 'GET',
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        })
        .then(response => response.json())
        .then(json => {
            const arrDate = _.map(json.Open, (value, key) => {
                const n = parseInt(key);
                return moment(new Date(n)).format('YYYY/MM/DD');
            });

            const strName = _.chain(json.shortName).values().head().value();

            const arrLow = _.values(json.Low);
            const arrHigh = _.values(json.High);
            const arrVolume = _.values(json.Volume);

            let arrPlot = _.zip(_.values(json.Open), _.values(json.Close), arrLow, arrHigh); //open close low high
            const pandaChart = echarts.init(document.getElementById('cn'));

            let plot_min = _.min(arrLow);
            let plot_max = _.max(arrHigh);

            plot_min = _.floor(plot_min * 0.97);
            plot_max = _.ceil(plot_max * 1.03);

            let option = {
                title: {
                    text: strName,
                    left: 'center',
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
                    trigger: 'item', //item | axis | node
                    axisPointer: {
                        type: 'cross'
                    }
                },
                grid: [{
                        left: '5%',
                        top: '5%',
                        right: '5%',
                        //bottom: '8%',
                        height: '75%', //チャート描画はtop5% + height75% = 80%を占有する
                        zlevel: 3
                    },
                    {
                        left: '5%',
                        top: '82%', //80+2%のギャップを空ける
                        right: '5%',
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
    document.querySelector('#btn').click();
});

document.querySelector('select[name="select-ticker"]').addEventListener('click', (evt) => {
    document.querySelector('#txt').value = evt.currentTarget.value;
    document.querySelector('#btn').click();
});

//main
{
    const arrTicker = [
        'SPY', 'DIA', 'QQQ', 'IWM', 'VYM', 'GS', 'MS', 'JPM', 'WFC', 'C', 'BAC', 'BCS', 'DB', 'FB', 'AAPL', 'NFLX', 'GOOG', 'AMZN', 'MSFT',
        'TWTR', 'SNAP', 'SQ', 'AMD', 'NVDA', 'BTC-USD', 'SPXL', 'UPRO', 'UDOW', 'TECL', 'TQQQ', 'TNA', 'SPXS', 'SPXU', 'SDOW', 'TECS', 'SQQQ', 'TZA', 'FAZ', 'VXX', 'UVXY', 'TVIX',
        'GLD', 'USO', 'TLT', 'BA', 'UNH', 'MMM', 'HD', 'MCD', 'V', 'JNJ', 'GE', 'BRK-B', 'CVX', 'PG', 'WMT', 'XOM'
    ];

    _.forEach(arrTicker, ticker => {
        //$('select[name="select-ticker"]').append(`<option value="${ticker}">${ticker}</option>`);
        let elem = document.createElement('option');
        elem.value = ticker;
        elem.innerHTML = ticker;
        document.querySelector('select[name="select-ticker"]').append(elem);
    });

    const select_len = (53 < arrTicker.length) ? 53 : arrTicker.length;

    //$('select[name="select-ticker"]').prop('size', select_len);
    document.querySelector('select[name="select-ticker"]').size = select_len;

    // debug mode
    //document.querySelector('#txt').value = 'SPY';
    //document.querySelector('#btn').click();

}