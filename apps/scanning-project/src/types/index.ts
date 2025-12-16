export interface ScanResult {
    id: string;
    timestamp: Date;
    data: any; // Replace 'any' with a more specific type if known
}

export interface Config {
    scanFrequency: number; // Frequency in minutes
    outputFormat: 'json' | 'xml'; // Supported output formats
}
