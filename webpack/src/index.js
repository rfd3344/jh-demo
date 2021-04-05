import '@babel/polyfill';
import './static/css/common.css';
import logger from 'utils/logger';


logger.warn('Global variable debug:', ENV); // eslint-disable-line


function index1() {
	document.write('<h1>Load jh-webpack/src/index.js </h1>');
}

index1();

export default index1;
