'use strict';

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
                    textStyle: {

                    }
                },
                xAxis: {
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
                    }
                },
                yAxis: {
                    min: plot_min,
                    max: plot_max
                },
                tooltip: {
                    trigger: 'item', //item | axis | node
                    axisPointer: {
                        type: 'cross'
                    }
                },
                grid: {
                    left: '5%',
                    top: '5%',
                    right: '5%',
                    bottom: '8%',
                    zlevel: 3
                },
                legend: {
                    data: ['MA13', 'MA42'],
                    right: '5%'
                },
                dataZoom: [{
                        type: 'inside',
                        start: 0,
                        end: 100
                    },
                    {
                        show: true,
                        type: 'slider',
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
                        }
                    }
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
        'TWTR', 'SNAP', 'SQ', 'AMD', 'NVDA', 'BTC-USD', 'SPXL', 'UPRO', 'UDOW', 'TQQQ', 'TNA', 'SPXS', 'SPXU', 'SDOW', 'SQQQ', 'TZA', 'FAZ', 'VXX', 'UVXY', 'TVIX',
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
}