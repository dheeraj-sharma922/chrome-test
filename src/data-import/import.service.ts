export interface ImportService {
  importCSV(filePath: string): Promise<void>
}
