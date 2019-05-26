import process from 'process';

const NODE_ENV = process.env.NODE_ENV || 'development';
export default NODE_ENV === 'production';
