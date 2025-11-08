import { Config } from '../types';

class Scanner {
    public config: Config;

    constructor(config?: Config) {
        this.config = config || {
            scanFrequency: 1000,
            outputFormat: 'json'
        };
    }

    public configure(config: Config): void {
        this.config = { ...this.config, ...config };
    }

    public scan(): { results: string[] } {
        console.log(`Scanning with frequency: ${this.config.scanFrequency} ms and output format: ${this.config.outputFormat}`);
        // Scanning logic goes here
        return { results: [] };
    }
}

export default Scanner;
