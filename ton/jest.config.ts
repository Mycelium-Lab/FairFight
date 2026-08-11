import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: '<rootDir>/tests/node-environment.js',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};

export default config;
