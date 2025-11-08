export function formatResults(results: any): string {
    // Format the scan results into a readable string
    return JSON.stringify(results, null, 2);
}

export function logMessage(message: string): void {
    // Log a message to the console
    console.log(message);
}
