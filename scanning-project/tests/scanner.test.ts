import Scanner from '../src/scanner/index';
import { Config } from '../src/types/index';

describe('Scanner Class', () => {
    let scanner: Scanner;

    beforeEach(() => {
        const config: Config = {
            scanFrequency: 5000,
            outputFormat: 'json',
        };
        scanner = new Scanner(config);
    });

    test('should initialize with correct configuration', () => {
        expect(scanner.config.scanFrequency).toBe(5000);
        expect(scanner.config.outputFormat).toBe('json');
    });

    test('should initiate scanning process', () => {
        const scanResults = scanner.scan();
        expect(scanResults).toBeDefined();
        expect(scanResults).toHaveProperty('results');
    });

    test('should configure scanner with new settings', () => {
        const newConfig: Config = {
            scanFrequency: 10000,
            outputFormat: 'xml',
        };
        scanner.configure(newConfig);
        expect(scanner.config.scanFrequency).toBe(10000);
        expect(scanner.config.outputFormat).toBe('xml');
    });
});
