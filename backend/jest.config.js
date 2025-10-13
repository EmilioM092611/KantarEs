
// backend/jest.config.js
module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest'
    },
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/../tsconfig.spec.json',
            isolatedModules: true
        }
    },
    collectCoverageFrom: [
        '**/*.(t|j)s',
        '!**/*.module.ts',
        '!**/main.ts',
        '!**/node_modules/**',
    ],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/$1'
    },

    // ✅ CRÍTICO: Permite que Jest transforme faker y otros paquetes ESM
    transformIgnorePatterns: [
        'node_modules/(?!(@faker-js/faker|other-esm-package)/)'
    ],

    // Opcional: Mejora el reporte de errores
    verbose: true,
    testTimeout: 10000, // 10 segundos por test
};