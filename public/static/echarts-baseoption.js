'use strict';

const strGridL = '15%';
const strGridR = '5%';

export const optionChart = {
    title: {
        text: null,
        left: '0%',
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
        min: (value) => {
            const padding = (optionChart.currentATR && optionChart.currentATR > 0)
                ? optionChart.currentATR * 1.5
                : (value.max - value.min) * 0.05;
            const minVal = value.min - padding;
            return Math.abs(minVal) < 5 ? _.floor(minVal, 1) : _.floor(minVal);
        },
        max: (value) => {
            const padding = (optionChart.currentATR && optionChart.currentATR > 0)
                ? optionChart.currentATR * 1.5
                : (value.max - value.min) * 0.05;
            const maxVal = value.max + padding;
            return Math.abs(maxVal) < 10 ? _.ceil(maxVal, 1) : _.ceil(maxVal);
        }
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
        show: false
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
        data: ['Tenkan', 'Kijun', 'SSA', 'SSB', 'Chikou', 'MA25'],
        selected: {
            'Tenkan': false,
            'Kijun': false,
            'SSA': false,
            'SSB': false,
            'Chikou': false,
            'MA25': false
        },
        right: '2%',
        fontSize: 9
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
    animation: false,
    currentATR: 0,
    series: null
};