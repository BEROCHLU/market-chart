'use strict';
/**
 * Calculates the moving average of a given data set for a specified number of days.
 * @param {number} dayCount - The number of days to calculate the moving average for.
 * @param {Array<Array<number>>} data - An array of arrays representing the data set, where each inner array contains two numbers: a timestamp and a value.
 * @returns {Array<string>} An array of strings representing the moving average values for each day. If there is not enough data to calculate the moving average for a particular day, a dash (-) is used instead.
 */
export const calculateMA = (dayCount, data) => {
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
};
/**
 * Calculates the highest and lowest values of a given period in a dataset.
 *
 * @param {number} period - The number of data points to include in the calculation.
 * @param {Array<Array<number>>} aoaPlot - An array of arrays containing the dataset to calculate from.
 * @param {number} index - The index of the starting point for the calculation.
 * @returns {Array<number>} An array containing the highest and lowest values within the specified period.
 */
const calculateHighLow = (period, aoaPlot, index) => {
    //aoaPlot => Open Close Low High, 0 1 2 3
    let high = -Infinity;
    let low = Infinity;

    for (let i = 0; i < period; i++) {
        const arr = aoaPlot[index - i];

        low = Math.min(low, arr[2]); // assuming low is at index 2
        high = Math.max(high, arr[3]); // assuming high is at index 3

    }
    return [high, low];
}

export function calculateKijunSen(aoaPlot) {
    return aoaPlot.map((_, index) => index < 26 ? '-' : ((calculateHighLow(26, aoaPlot, index)[0] + calculateHighLow(26, aoaPlot, index)[1]) / 2).toFixed(2));
}

export function calculateTenkanSen(aoaPlot) {
    return aoaPlot.map((_, index) => index < 9 ? '-' : ((calculateHighLow(9, aoaPlot, index)[0] + calculateHighLow(9, aoaPlot, index)[1]) / 2).toFixed(2));
}

export function calculateSenkouSpanA(kijunSen, tenkanSen) {
    return kijunSen.map((_, index) => index < 26 ? '-' : ((Number(kijunSen[index - 26]) + Number(tenkanSen[index - 26])) / 2).toFixed(2));
}

export function calculateSenkouSpanB(aoaPlot) {
    const arrSpanB = aoaPlot.map((_, index) => {
        if (index < 52) return '-';
        const arrHighLow = calculateHighLow(52, aoaPlot, index);
        return ((arrHighLow[0] + arrHighLow[1]) / 2).toFixed(2);
    });

    return [...Array(26).fill('-'), ...arrSpanB];
}

export function calculateChikouSpan(aoaPlot) {
    return aoaPlot.map((_, index) => index < aoaPlot.length - 26 ? Number(aoaPlot[index + 26][1]).toFixed(2) : '-'); // assuming close is at index 1
}
/** 
function calculateHighLow(period, data, index){
    let high = -Infinity;
    let low = Infinity;
    for(let i = 0; i < period; i++){
        let val = data[index - i];
        high = Math.max(high, val[2]); // assuming high is at index 2
        low = Math.min(low, val[3]); // assuming low is at index 3
    }
    return [high, low];
}

function calculateTenkanSen(data){
    return data.map((val, index) => index < 9 ? '-' : ((calculateHighLow(9, data, index)[0] + calculateHighLow(9, data, index)[1]) / 2).toFixed(2));
}

function calculateKijunSen(data){
    return data.map((val, index) => index < 26 ? '-' : ((calculateHighLow(26, data, index)[0] + calculateHighLow(26, data, index)[1]) / 2).toFixed(2));
}

function calculateSenkouSpanA(tenkanSen, kijunSen){
    return tenkanSen.map((val, index) => index < 26 ? '-' : ((Number(tenkanSen[index - 26]) + Number(kijunSen[index - 26])) / 2).toFixed(2));
}

function calculateSenkouSpanB(data){
    return data.map((val, index) => index < 52 ? '-' : ((calculateHighLow(52, data, index)[0] + calculateHighLow(52, data, index)[1]) / 2).toFixed(2));
}

function calculateChikouSpan(data){
    return data.map((val, index) => index < data.length - 26 ? Number(data[index + 26][4]).toFixed(2) : '-'); // assuming close is at index 4
}
*/