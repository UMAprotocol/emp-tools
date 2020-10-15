'use strict';

module.exports = {
  testMatch: ['<rootDir>/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '\\.*.(ts|tsx)$': 'ts-jest',
    '\\.*.(js?)$': 'babel-jest',
  },
  testPathIgnorePatterns: ['/src/', 'node_modules'],
};
