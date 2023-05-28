/// <reference types="node" />
import StorageBase from 'ghost-storage-base';
import { Handler } from 'express-serve-static-core';
export interface FileInfo extends StorageBase.Image {
    originalname?: string;
    targetDir?: string;
    newPath?: string;
    originalPath?: string;
    fieldname?: string;
    encoding?: string;
    mimetype?: string;
    destination?: string;
    filename?: string;
    size?: number;
    ext?: string;
}
interface Config {
    storage_type_images?: boolean;
    storage_type_media?: boolean;
    storage_type_files?: boolean;
    GHOST_STORAGE_ADAPTER_R2_DOMAIN?: string;
    GHOST_STORAGE_ADAPTER_R2_BUCKET?: string;
    GHOST_STORAGE_ADAPTER_R2_ENDPOINT?: string;
    GHOST_STORAGE_ADAPTER_R2_ACCESS_KEY_ID?: string;
    GHOST_STORAGE_ADAPTER_R2_SECRET_ACCESS_KEY?: string;
    GHOST_STORAGE_ADAPTER_R2_IMAGES_URL_PREFIX?: string;
    GHOST_STORAGE_ADAPTER_R2_MEDIA_URL_PREFIX?: string;
    GHOST_STORAGE_ADAPTER_R2_FILES_URL_PREFIX?: string;
    GHOST_STORAGE_ADAPTER_R2_CONTENT_PREFIX?: string;
    GHOST_STORAGE_ADAPTER_R2_RESPONSIVE_IMAGES?: boolean;
    GHOST_STORAGE_ADAPTER_R2_RESIZE_WIDTHS?: string;
    GHOST_STORAGE_ADAPTER_R2_UUID_NAME?: boolean;
    GHOST_STORAGE_ADAPTER_R2_RESIZE_JPEG_QUALITY?: number;
    GHOST_STORAGE_ADAPTER_R2_SAVE_ORIGINAL?: boolean;
    GHOST_STORAGE_ADAPTER_R2_GHOST_RESIZE?: boolean;
    GHOST_STORAGE_ADAPTER_R2_SAVE_ORIG_NAME_METADATA?: boolean;
}
export default class CloudflareR2Adapter extends StorageBase {
    private S3;
    private bucket;
    private pathPrefix;
    private domain;
    private storageType;
    private imagesUrlPrefix;
    private mediaUrlPrefix;
    private filesUrlPrefix;
    private responsiveImages;
    private resizeWidths;
    saveRaw: unknown;
    private uuidName;
    private saveOriginal;
    private jpegQuality;
    private ghostResize;
    private contentPrefix;
    private saveOrigNameMetadata;
    constructor(config?: Config);
    delete(fileName: string, targetDir?: string): Promise<boolean>;
    exists(fileName: string, targetDir?: string): Promise<boolean>;
    read(options?: StorageBase.ReadOptions): Promise<Buffer>;
    saveResizedImages(fileInfo: FileInfo, fileBuffer: Buffer, originalUuid: string | null, isImport: boolean): Promise<boolean>;
    getUniqueFileName(fileInfo: FileInfo, targetDir: string, uuid?: string | null): string;
    isOriginalImage(fileInfo: FileInfo): boolean;
    save(fileInfo: FileInfo, targetDir?: string, forceUuid?: string): Promise<string>;
    serve(): Handler;
}
export {};
