"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ghost_storage_base_1 = __importDefault(require("ghost-storage-base"));
const loglevel_1 = __importDefault(require("loglevel"));
const { getLogger } = loglevel_1.default;
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const mime_1 = __importDefault(require("mime"));
const log = getLogger('ghost-cloudflare-r2');
setLogLevel(log, 'GHOST_STORAGE_ADAPTER_R2_LOG_LEVEL');
const client_s3_1 = require("@aws-sdk/client-s3");
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
function stripLeadingSlash(s) {
    return s.indexOf('/') === 0 ? s.substring(1) : s;
}
function stripEndingSlash(s) {
    return s.indexOf('/') === s.length - 1 ? s.substring(0, s.length - 1) : s;
}
function readFileAsync(filePath) {
    return new Promise((resolve, reject) => (0, fs_1.readFile)(filePath, (err, data) => (err ? reject(err) : resolve(data))));
}
function setLogLevel(logger, envVariable) {
    switch (process.env[envVariable] || '') {
        case 'trace':
            logger.setLevel('trace');
            break;
        case 'debug':
            logger.setLevel('debug');
            break;
        case 'info':
            logger.setLevel('info');
            break;
        case 'warn':
            logger.setLevel('warn');
            break;
        case 'error':
            logger.setLevel('error');
            break;
        default:
            logger.setLevel('info');
    }
}
var StorageType;
(function (StorageType) {
    StorageType[StorageType["Images"] = 0] = "Images";
    StorageType[StorageType["Media"] = 1] = "Media";
    StorageType[StorageType["Files"] = 2] = "Files";
})(StorageType || (StorageType = {}));
function getBooleanFromEnv(envName) {
    let result;
    if (process.env[envName] && process.env[envName] === 'true') {
        result = true;
    }
    else if (process.env[envName] && process.env[envName] === 'false') {
        result = false;
    }
    else if (process.env[envName]) {
        throw new Error(`Environment variable ${envName} contains invalid value ${process.env[envName]}`);
    }
    return result;
}
function mergeConfigWithEnv(config) {
    config.GHOST_STORAGE_ADAPTER_R2_DOMAIN =
        process.env.GHOST_STORAGE_ADAPTER_R2_DOMAIN ||
            config.GHOST_STORAGE_ADAPTER_R2_DOMAIN;
    config.GHOST_STORAGE_ADAPTER_R2_BUCKET =
        process.env.GHOST_STORAGE_ADAPTER_R2_BUCKET ||
            config.GHOST_STORAGE_ADAPTER_R2_BUCKET;
    config.GHOST_STORAGE_ADAPTER_R2_ENDPOINT =
        process.env.GHOST_STORAGE_ADAPTER_R2_ENDPOINT ||
            config.GHOST_STORAGE_ADAPTER_R2_ENDPOINT;
    config.GHOST_STORAGE_ADAPTER_R2_ACCESS_KEY_ID =
        process.env.GHOST_STORAGE_ADAPTER_R2_ACCESS_KEY_ID ||
            config.GHOST_STORAGE_ADAPTER_R2_ACCESS_KEY_ID;
    config.GHOST_STORAGE_ADAPTER_R2_SECRET_ACCESS_KEY =
        process.env.GHOST_STORAGE_ADAPTER_R2_SECRET_ACCESS_KEY ||
            config.GHOST_STORAGE_ADAPTER_R2_SECRET_ACCESS_KEY;
    config.GHOST_STORAGE_ADAPTER_R2_CONTENT_PREFIX =
        process.env.GHOST_STORAGE_ADAPTER_R2_CONTENT_PREFIX ||
            config.GHOST_STORAGE_ADAPTER_R2_CONTENT_PREFIX ||
            '';
    config.GHOST_STORAGE_ADAPTER_R2_IMAGES_URL_PREFIX =
        process.env.GHOST_STORAGE_ADAPTER_R2_IMAGES_URL_PREFIX ||
            config.GHOST_STORAGE_ADAPTER_R2_IMAGES_URL_PREFIX ||
            '/content/images/';
    config.GHOST_STORAGE_ADAPTER_R2_MEDIA_URL_PREFIX =
        process.env.GHOST_STORAGE_ADAPTER_R2_MEDIA_URL_PREFIX ||
            config.GHOST_STORAGE_ADAPTER_R2_MEDIA_URL_PREFIX ||
            '/content/media/';
    config.GHOST_STORAGE_ADAPTER_R2_FILES_URL_PREFIX =
        process.env.GHOST_STORAGE_ADAPTER_R2_FILES_URL_PREFIX ||
            config.GHOST_STORAGE_ADAPTER_R2_FILES_URL_PREFIX ||
            '/content/files/';
    const responsiveImages = getBooleanFromEnv('GHOST_STORAGE_ADAPTER_R2_RESPONSIVE_IMAGES');
    config.GHOST_STORAGE_ADAPTER_R2_RESPONSIVE_IMAGES =
        responsiveImages ||
            config.GHOST_STORAGE_ADAPTER_R2_RESPONSIVE_IMAGES ||
            false;
    config.GHOST_STORAGE_ADAPTER_R2_RESIZE_WIDTHS =
        process.env.GHOST_STORAGE_ADAPTER_R2_RESIZE_WIDTHS ||
            config.GHOST_STORAGE_ADAPTER_R2_RESIZE_WIDTHS ||
            '300,600,1000,1600,400,750,960,1140,1200';
    const uuidName = getBooleanFromEnv('GHOST_STORAGE_ADAPTER_R2_UUID_NAME');
    config.GHOST_STORAGE_ADAPTER_R2_UUID_NAME =
        uuidName !== null && uuidName !== void 0 ? uuidName : (config.GHOST_STORAGE_ADAPTER_R2_UUID_NAME || false);
    let jpegQuality;
    if (process.env.GHOST_STORAGE_ADAPTER_R2_RESIZE_JPEG_QUALITY) {
        jpegQuality = parseInt(process.env.GHOST_STORAGE_ADAPTER_R2_RESIZE_JPEG_QUALITY);
    }
    config.GHOST_STORAGE_ADAPTER_R2_RESIZE_JPEG_QUALITY =
        jpegQuality || config.GHOST_STORAGE_ADAPTER_R2_RESIZE_JPEG_QUALITY || 80;
    const saveOriginal = getBooleanFromEnv('GHOST_STORAGE_ADAPTER_R2_SAVE_ORIGINAL');
    config.GHOST_STORAGE_ADAPTER_R2_SAVE_ORIGINAL =
        saveOriginal !== null && saveOriginal !== void 0 ? saveOriginal : (config.GHOST_STORAGE_ADAPTER_R2_SAVE_ORIGINAL || true);
    const ghostResize = getBooleanFromEnv('GHOST_STORAGE_ADAPTER_R2_GHOST_RESIZE');
    config.GHOST_STORAGE_ADAPTER_R2_GHOST_RESIZE =
        ghostResize !== null && ghostResize !== void 0 ? ghostResize : (config.GHOST_STORAGE_ADAPTER_R2_GHOST_RESIZE || true);
    const saveNameMetadata = getBooleanFromEnv('GHOST_STORAGE_ADAPTER_R2_SAVE_ORIG_NAME_METADATA');
    config.GHOST_STORAGE_ADAPTER_R2_SAVE_ORIG_NAME_METADATA =
        saveNameMetadata || false;
    config.GHOST_STORAGE_ADAPTER_R2_SAVE_ORIG_NAME_METADATA =
        saveNameMetadata !== null && saveNameMetadata !== void 0 ? saveNameMetadata : (config.GHOST_STORAGE_ADAPTER_R2_SAVE_ORIG_NAME_METADATA || false);
    return config;
}
function checkConfig(config) {
    if (!config.GHOST_STORAGE_ADAPTER_R2_DOMAIN) {
        throw new Error('Environment/config variable "GHOST_STORAGE_ADAPTER_R2_DOMAIN" has not been set');
    }
    if (!config.GHOST_STORAGE_ADAPTER_R2_BUCKET) {
        throw new Error('Environment/config variable "GHOST_STORAGE_ADAPTER_R2_BUCKET" has not been set');
    }
    if (!config.GHOST_STORAGE_ADAPTER_R2_ENDPOINT) {
        throw new Error('Environment/config variable "GHOST_STORAGE_ADAPTER_R2_ENDPOINT" has not been set');
    }
    if (!config.GHOST_STORAGE_ADAPTER_R2_ACCESS_KEY_ID) {
        throw new Error('Environment/config variable "GHOST_STORAGE_ADAPTER_R2_ACCESS_KEY_ID" has not been set');
    }
    if (!config.GHOST_STORAGE_ADAPTER_R2_SECRET_ACCESS_KEY) {
        throw new Error('Environment/config variable "GHOST_STORAGE_ADAPTER_R2_SECRET_ACCESS_KEY" has not been set');
    }
}
class CloudflareR2Adapter extends ghost_storage_base_1.default {
    constructor(config = {}) {
        log.debug('Initialising ghost-cloudflare-r2 storage adapter');
        super();
        this.storageType = StorageType.Images;
        this.saveRaw = undefined;
        mergeConfigWithEnv(config);
        checkConfig(config);
        this.bucket = config.GHOST_STORAGE_ADAPTER_R2_BUCKET;
        this.domain = config.GHOST_STORAGE_ADAPTER_R2_DOMAIN;
        this.imagesUrlPrefix = (config.GHOST_STORAGE_ADAPTER_R2_IMAGES_URL_PREFIX);
        this.mediaUrlPrefix = (config.GHOST_STORAGE_ADAPTER_R2_MEDIA_URL_PREFIX);
        this.filesUrlPrefix = (config.GHOST_STORAGE_ADAPTER_R2_FILES_URL_PREFIX);
        this.responsiveImages = (config.GHOST_STORAGE_ADAPTER_R2_RESPONSIVE_IMAGES);
        this.resizeWidths = config.GHOST_STORAGE_ADAPTER_R2_RESIZE_WIDTHS
            .split(',')
            .map(w => parseInt(w));
        if (config.GHOST_STORAGE_ADAPTER_R2_RESPONSIVE_IMAGES === true) {
            // Ghost checks if a 'saveRaw' function exists on the storage adapter,
            // if it exists, the theme will generate srcset attribute in the HTML.
            this.saveRaw = function () { };
        }
        if (config.storage_type_images === true) {
            this.storageType = StorageType.Images;
            this.pathPrefix = (config.GHOST_STORAGE_ADAPTER_R2_IMAGES_URL_PREFIX);
        }
        else if (config.storage_type_media === true) {
            this.storageType = StorageType.Media;
            this.pathPrefix = (config.GHOST_STORAGE_ADAPTER_R2_MEDIA_URL_PREFIX);
        }
        else if (config.storage_type_files === true) {
            this.storageType = StorageType.Files;
            this.pathPrefix = (config.GHOST_STORAGE_ADAPTER_R2_FILES_URL_PREFIX);
        }
        else {
            this.storageType = StorageType.Images;
            this.pathPrefix = this.imagesUrlPrefix;
        }
        this.contentPrefix = config.GHOST_STORAGE_ADAPTER_R2_CONTENT_PREFIX || '';
        this.pathPrefix = this.contentPrefix + this.pathPrefix;
        this.uuidName = config.GHOST_STORAGE_ADAPTER_R2_UUID_NAME;
        this.saveOriginal = config.GHOST_STORAGE_ADAPTER_R2_SAVE_ORIGINAL;
        this.ghostResize = config.GHOST_STORAGE_ADAPTER_R2_GHOST_RESIZE;
        this.saveOrigNameMetadata = (config.GHOST_STORAGE_ADAPTER_R2_SAVE_ORIG_NAME_METADATA);
        log.info('Cloudflare R2 Storage Adapter: handling', StorageType[this.storageType], 'at', this.pathPrefix);
        this.S3 = new client_s3_1.S3Client({
            region: 'auto',
            endpoint: config.GHOST_STORAGE_ADAPTER_R2_ENDPOINT,
            credentials: {
                accessKeyId: config.GHOST_STORAGE_ADAPTER_R2_ACCESS_KEY_ID,
                secretAccessKey: (config.GHOST_STORAGE_ADAPTER_R2_SECRET_ACCESS_KEY),
            },
        });
        log.debug('Initialisation done');
    }
    delete(fileName, targetDir) {
        log.debug('delete():', 'filename:', fileName, 'targetDir:', targetDir);
        log.error('Cloudflare R2 Storage Adapter: delete() is not implemented');
        return Promise.resolve(false);
    }
    exists(fileName, targetDir) {
        log.info('exists():', 'fileName:', fileName, 'targetDir:', targetDir);
        let targetPath;
        if (targetDir === undefined) {
            targetPath = fileName;
        }
        else {
            targetPath = path_1.default.join(targetDir, fileName);
        }
        return new Promise((resolve, reject) => {
            this.S3.send(new client_s3_1.HeadObjectCommand({
                Bucket: this.bucket,
                Key: stripLeadingSlash(targetPath),
            }))
                .then(value => {
                if (value.$metadata.httpStatusCode === 200) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            }, reason => {
                resolve(false);
            })
                .catch(reason => {
                log.debug(reason);
                reject(reason);
            });
        });
    }
    read(options) {
        log.debug('Cloudflare R2 Storage Adapter: read():', 'options:', options);
        return new Promise((resolve, reject) => {
            if (options === undefined) {
                reject('Cloudflare R2 Storage Adapter: read(): argument "options" is undefined');
                return;
            }
            if ((options === null || options === void 0 ? void 0 : options.path) === undefined) {
                reject('Cloudflare R2 Storage Adapter: read(): argument "options.path" is undefined');
                return;
            }
            const r2Path = stripLeadingSlash(path_1.default.join(this.pathPrefix, options === null || options === void 0 ? void 0 : options.path));
            this.S3.send(new client_s3_1.GetObjectCommand({
                Bucket: this.bucket,
                Key: r2Path,
            }))
                .then(value => {
                var _a;
                (_a = value.Body) === null || _a === void 0 ? void 0 : _a.transformToByteArray().then((value) => {
                    resolve(Buffer.from(value));
                }, (reason) => {
                    reject(reason);
                }).catch((err) => {
                    reject(err);
                });
            }, reason => {
                reject(reason);
            })
                .catch(err => {
                reject(err);
            });
        });
    }
    saveResizedImages(fileInfo, fileBuffer, originalUuid, isImport) {
        log.info('Cloudflare R2 Storage Adapter: saveResizedImages(): fileInfo:', fileInfo);
        return new Promise((resolve, reject) => {
            Promise.all(this.resizeWidths.map(width => {
                let directory = this.getTargetDir(`${stripEndingSlash(this.pathPrefix)}/size/w${width}`);
                if (isImport) {
                    // transform /content/images/2022/12/image.jpg
                    // Into /content_prefix/content/images/size/w_x/2022/12
                    if (fileInfo.newPath === undefined) {
                        reject(`Could not determine newPath for image ${fileInfo.path}`);
                        return;
                    }
                    const oldDir = stripLeadingSlash(fileInfo.newPath)
                        .split('/')
                        .slice(0, -1);
                    if (oldDir === undefined) {
                        reject(`Could not determine newPath for image ${fileInfo.path}`);
                        return;
                    }
                    // WARNING: assume old path structure was in the format /content/images/size/wX/image.jpg
                    directory = `${this.contentPrefix}/${oldDir[0]}/${oldDir[1]}/size/w${width}/${oldDir[2]}/${oldDir[3]}`;
                }
                return Promise.all([
                    this.getUniqueFileName(fileInfo, directory, originalUuid),
                    this.jpegQuality && fileInfo.type === 'image/jpeg'
                        ? (0, sharp_1.default)(fileBuffer)
                            .resize({ width: width })
                            .jpeg({ quality: this.jpegQuality })
                            .toBuffer()
                        : (0, sharp_1.default)(fileBuffer).resize({ width: width }).toBuffer(),
                ])
                    .then(([filePathR2, resizedBuffer]) => {
                    log.debug('Cloudflare R2 Storage Adapter: saveResizedImages(): saving', filePathR2);
                    return this.S3.send(new client_s3_1.PutObjectCommand({
                        Bucket: this.bucket,
                        Body: resizedBuffer,
                        ContentType: fileInfo.type,
                        CacheControl: `max-age=${30 * 24 * 60 * 60}`,
                        Key: stripLeadingSlash(filePathR2),
                    })).then(() => {
                        log.info('Saved', filePathR2);
                    });
                })
                    .catch(reason => {
                    reject(reason);
                });
            }))
                .then(() => {
                log.debug('Finished saving resized images for', fileInfo.name);
                resolve(true);
            })
                .catch(reason => {
                reject(reason);
            });
        });
    }
    getUniqueFileName(fileInfo, targetDir, uuid) {
        if (this.storageType === StorageType.Files) {
            return super.getUniqueFileName(fileInfo, targetDir);
        }
        if (uuid) {
            return path_1.default.join(targetDir, uuid + fileInfo.ext);
        }
        else {
            return super.getUniqueFileName(fileInfo, targetDir);
        }
    }
    isOriginalImage(fileInfo) {
        return !fileInfo.path.endsWith('_processed');
    }
    save(fileInfo, targetDir, forceUuid) {
        var _a;
        log.info('Cloudflare R2 Storage Adapter: save():', 'fileInfo:', fileInfo, 'targetDir:', targetDir);
        let isImport = false;
        if (targetDir) {
            log.info('Cloudflare R2 Storage Adapter: save(): Detected import.');
            isImport = true;
            fileInfo.name = path_1.default.basename(fileInfo.name);
            fileInfo.ext = path_1.default.extname(fileInfo.name);
        }
        let directory = this.getTargetDir(this.pathPrefix);
        // getTargetDir adds year/month. For import we want the original path
        if (isImport) {
            directory =
                this.contentPrefix +
                    ((_a = fileInfo.newPath) === null || _a === void 0 ? void 0 : _a.split('/').slice(0, -1).join('/'));
        }
        return new Promise((resolve, reject) => {
            if (!this.saveOriginal &&
                this.isOriginalImage(fileInfo) &&
                this.ghostResize &&
                !isImport) {
                log.info('Cloudflare R2 Storage Adapter: save(): discarding original: ', fileInfo.name);
                // Not sure if the URL for the original image is used.
                // Should only be used if imageOptimization__resize is true since then the original (*_o.jpg) is not used.
                resolve('');
                return;
            }
            let uuid = null;
            if (this.uuidName && !isImport) {
                uuid = forceUuid || (0, uuid_1.v4)();
            }
            Promise.all([
                this.getUniqueFileName(fileInfo, directory, uuid),
                readFileAsync(fileInfo.path),
            ])
                .then(([filePathR2, fileBuffer]) => {
                if (fileInfo.type === '' || fileInfo.type === undefined) {
                    const mimeType = mime_1.default.getType(fileInfo.path);
                    if (mimeType) {
                        log.debug('Detected mimeType:', mimeType);
                        fileInfo.type = mimeType;
                    }
                }
                log.debug('Cloudflare R2 Storage Adapter: save(): saving', filePathR2);
                let metadata = {};
                if (this.saveOrigNameMetadata) {
                    if (isImport) {
                        metadata = { original_name: path_1.default.basename(fileInfo.name) };
                    }
                    else {
                        if (fileInfo.originalname === undefined) {
                            throw new Error('save(): originalname is not defined for non import, could not save original name metadata');
                        }
                        metadata = { original_name: path_1.default.basename(fileInfo.originalname) };
                    }
                }
                this.S3.send(new client_s3_1.PutObjectCommand({
                    Bucket: this.bucket,
                    Body: fileBuffer,
                    ContentType: fileInfo.type,
                    CacheControl: `max-age=${30 * 24 * 60 * 60}`,
                    Key: stripLeadingSlash(filePathR2),
                    Metadata: metadata,
                })).then(() => {
                    log.info('Saved', filePathR2);
                    if (((this.ghostResize && !this.isOriginalImage(fileInfo)) ||
                        (!this.ghostResize && this.isOriginalImage(fileInfo)) ||
                        isImport) &&
                        this.responsiveImages &&
                        this.storageType === StorageType.Images) {
                        log.info('Generating different image sizes...');
                        this.saveResizedImages(fileInfo, fileBuffer, uuid, isImport)
                            .then(() => {
                            log.info('Generating different image sizes... Done');
                            resolve(`${this.domain}/${stripLeadingSlash(filePathR2)}`);
                        })
                            .catch(reason => {
                            reject(reason);
                        });
                    }
                    else {
                        resolve(`${this.domain}/${stripLeadingSlash(filePathR2)}`);
                    }
                }, reason => {
                    reject(reason);
                });
            })
                .catch(err => {
                log.debug(err);
                reject(err);
            });
        });
    }
    serve() {
        return (req, res, next) => {
            next();
        };
    }
}
exports.default = CloudflareR2Adapter;
module.exports = CloudflareR2Adapter;
//# sourceMappingURL=index.js.map