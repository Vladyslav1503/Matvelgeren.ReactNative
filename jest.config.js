module.exports = {
    preset: 'jest-expo',
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
    transformIgnorePatterns: [
        'node_modules/(?!(jest-)?@?react-native|@react-navigation|@expo|expo(nent)?|expo-router)',
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    },
};
