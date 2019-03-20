require('@babel/register');
require('babel-polyfill');

const main = require('./rosdump-main').main;

main();
