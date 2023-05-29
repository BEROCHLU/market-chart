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