'use strict';

/**
 * html grid, ticker throttle
 * python 四捨五入
 */

$('#btn').click(function() {
    const t = $('#txt').val();
    const p = $('.select-period').val();
    const URL = `/?q=${t}&p=${p}`;
    //location.href = URL;

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

            const ticker = $('#txt').val();
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
                    left: 'center'
                },
                xAxis: {
                    data: arrDate
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
                dataZoom: [
                    {
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
                    type: 'k',
                    data: arrPlot
                }]
            };

            pandaChart.setOption(option);
        })
        .catch(e => {
            console.log(e)
        });
});

/*
 *!event
 */

$('#clr').click(function() {
    $('#txt').val(''); //clear text
});

$('select[name="select-ticker"]').click(function() {
    $('#txt').val(this.value);
    $('#btn').trigger('click');
    //console.log(this.value);
});

$('#txt').change(function() {
    $('#btn').trigger('click');
});

//main
{
    const arrTicker = [
        'SPY', 'DIA', 'QQQ', 'IWM', 'VYM', 'GS', 'MS', 'JPM', 'WFC', 'C', 'BAC', 'BCS', 'DB', 'FB', 'AAPL', 'NFLX', 'GOOG', 'AMZN', 'MSFT',
        'TWTR', 'SNAP', 'SQ', 'AMD', 'NVDA', 'BTC-USD', 'UPRO', 'UDOW', 'TQQQ', 'TNA', 'SPXU', 'SDOW', 'SQQQ', 'TZA', 'FAZ', 'VXX', 'UVXY', 'TVIX',
        'GLD', 'USO', 'TLT', 'BA', 'UNH', 'MMM', 'HD', 'MCD', 'V','JNJ', 'GE', 'BRK-B', 'CVX', 'PG', 'WMT'
    ];

    _.forEach(arrTicker, ticker => {
        $('select[name="select-ticker"]').append(`<option value="${ticker}">${ticker}</option>`);
    });

    $('select[name="select-ticker"]').prop('size', arrTicker.length);
}