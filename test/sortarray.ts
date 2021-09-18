
import _ from 'lodash';
import fs from 'fs';
import arrTicker from './list';

let arrSort = _.map(arrTicker, (strTikcer: string)=> _.toUpper(strTikcer));

const strExport: string = 'export const arrTicker = ' + JSON.stringify(_.sortBy(arrSort), null, '\t') + ';';
fs.writeFileSync('../static/list.js', strExport);