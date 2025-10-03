import { FileType, FileUploadResponse } from '../types';
import { ChatApiService } from './ChatApiService';

export class FileUploadService {
  private apiService: ChatApiService;
  private uploadQueue: FileType[] = [];
  private isUploading = false;
  private readonly MAX_FILES = 5;

  constructor(apiService: ChatApiService) {
    this.apiService = apiService;
  }

  // Add files to upload queue (max 5 files)
  addFiles(files: File[]): FileType[] {
    // Check if adding these files would exceed the limit
    const availableSlots = this.MAX_FILES - this.uploadQueue.length;
    if (availableSlots <= 0) {
      throw new Error(`Maximum ${this.MAX_FILES} files allowed. Please remove some files first.`);
    }
    
    const filesToAdd = files.slice(0, availableSlots);
    const fileTypes: FileType[] = filesToAdd.map(file => ({
      file,
      response: null,
    }));
    
    this.uploadQueue.push(...fileTypes);
    return fileTypes;
  }

  // Upload a single file
  async uploadFile(
    fileType: FileType,
    onProgress?: (progress: number) => void,
    onComplete?: (fileType: FileType) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await this.apiService.uploadFile(fileType.file, onProgress);
      fileType.response = response;
      onComplete?.(fileType);
    } catch (error) {
      onError?.(error as Error);
    }
  }

  // Upload all files in queue
  async uploadAllFiles(
    onProgress?: (fileType: FileType, progress: number) => void,
    onComplete?: (fileType: FileType) => void,
    onError?: (fileType: FileType, error: Error) => void
  ): Promise<void> {
    if (this.isUploading) return;
    
    this.isUploading = true;
    
    const uploadPromises = this.uploadQueue.map(fileType => 
      this.uploadFile(
        fileType,
        (progress) => onProgress?.(fileType, progress),
        onComplete,
        (error) => onError?.(fileType, error)
      )
    );

    await Promise.allSettled(uploadPromises);
    this.isUploading = false;
  }

  // Remove file from queue
  removeFile(fileType: FileType): void {
    const index = this.uploadQueue.indexOf(fileType);
    if (index > -1) {
      this.uploadQueue.splice(index, 1);
    }
  }

  // Clear upload queue
  clearQueue(): void {
    this.uploadQueue = [];
  }

  // Get files ready for sending (with successful uploads)
  getReadyFiles(): FileUploadResponse[] {
    return this.uploadQueue
      .filter(fileType => fileType.response)
      .map(fileType => fileType.response!);
  }

  // Get all files in queue
  getQueue(): FileType[] {
    return [...this.uploadQueue];
  }

  // Check if any files are currently uploading
  get isUploadingFiles(): boolean {
    return this.isUploading;
  }

  // Get upload progress for all files
  getUploadProgress(): { completed: number; total: number; percentage: number } {
    const total = this.uploadQueue.length;
    const completed = this.uploadQueue.filter(ft => ft.response).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, total, percentage };
  }

  // Check if we can add more files
  canAddFiles(count: number = 1): boolean {
    return (this.uploadQueue.length + count) <= this.MAX_FILES;
  }

  // Get current file count
  getFileCount(): number {
    return this.uploadQueue.length;
  }

  // Get maximum allowed files
  getMaxFiles(): number {
    return this.MAX_FILES;
  }
}
