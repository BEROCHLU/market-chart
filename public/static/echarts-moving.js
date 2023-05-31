'use strict';
/**
 * Calculates the moving average of a given data set for a specified number of days.
 * @param {number} dayCount - The number of days to calculate the moving average for.
 * @param {Array<Array<number>>} aoa - An array of arrays representing the data set, where each inner array contains two numbers: a timestamp and a value.
 * @returns {Array<string>} An array of strings representing the moving average values for each day. If there is not enough data to calculate the moving average for a particular day, a dash (-) is used instead.
 */
export const calculateMA = (aoa, dayCount) => {
    let result = [];
    for (let i = 0, len = aoa.length; i < len; i++) {
        if (i < dayCount) {
            result.push('-');
            continue;
        }
        let sum = 0;
        for (let j = 0; j < dayCount; j++) {
            sum += aoa[i - j][1];
        }
        let strAverage = (sum / dayCount).toFixed(2);
        result.push(parseFloat(strAverage));
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
    let low = Infinity;
    let high = -Infinity;

    for (let i = 0; i < period; i++) {
        const arr = aoaPlot[index - i];
        low = Math.min(low, arr[2]); // assuming low is at index 2
        high = Math.max(high, arr[3]); // assuming high is at index 3
    }

    return [high, low];
};

export function calculateTenkanSen(aoaPlot) {
    return aoaPlot.map((_, index) => index < 9 ? '-' : parseFloat(((calculateHighLow(9, aoaPlot, index)[0] + calculateHighLow(9, aoaPlot, index)[1]) / 2).toFixed(2)));
}

export function calculateKijunSen(aoaPlot) {
    return aoaPlot.map((_, index) => index < 26 ? '-' : parseFloat(((calculateHighLow(26, aoaPlot, index)[0] + calculateHighLow(26, aoaPlot, index)[1]) / 2).toFixed(2)));
}
/**
 * Calculates the Senkou Span A values based on the Kijun and Tenkan arrays.
 * @param {number[]} arrTenkan - An array of Tenkan values.
 * @param {number[]} arrKijun - An array of Kijun values.
 * @returns {number[]} An array of Senkou Span A values.
 */
export function calculateSenkouSpanA(arrTenkan, arrKijun) {
    const arrSpanA = arrKijun.map((_, index) => {
        if (index < 26) return '-';
        const averageValue = (arrKijun[index] + arrTenkan[index]) / 2;
        return parseFloat(averageValue.toFixed(2));
    });
    // shift 26days
    return [...Array(26).fill('-'), ...arrSpanA];
}
/**
 * Calculate SenkouSpanB based on a given data array.
 *
 * @param {Array} aoaPlot - The data array to base the calculation on.
 * @returns {Array} - An array of SenkouSpanB values, where each value is the average of high and low values
 * over a period of 52 data points in the input array. For the first 52 data points and the last 26 data points,
 * the value is set to '-'.
 */
export function calculateSenkouSpanB(aoaPlot) {
    const arrSpanB = aoaPlot.map((_, index) => {
        if (index < 52) return '-';
        const arrHighLow = calculateHighLow(52, aoaPlot, index);
        const averageValue = (arrHighLow[0] + arrHighLow[1]) / 2;
        return parseFloat(averageValue.toFixed(2));
    });
    // For the last 26 data points, set the value to '-', and combine it with the rest of the calculated values
    return [...Array(26).fill('-'), ...arrSpanB];
}

export function calculateChikouSpan(aoaPlot) {
    return aoaPlot.map((_, index) => index < aoaPlot.length - 26 ? aoaPlot[index + 26][1] : '-'); // assuming close is at index 1
}
