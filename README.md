# Ghost for zeabur

## Config

```
url=https://ghost.zeabur.app
```

## Database

```
database__client=mysql
database__connection__host=127.0.0.1
database__connection__port=3306
database__connection__user=your_database_user
database__connection__password=your_database_password
database__connection__database=your_database_name
```
## R2 Storage

```
storage__active=ghost-cloudflare-r2
storage__media__adapter=ghost-cloudflare-r2
storage__media__storage_type_media=true
storage__files__adapter=ghost-cloudflare-r2
storage__files__storage_type_files=true
GHOST_STORAGE_ADAPTER_R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
GHOST_STORAGE_ADAPTER_R2_ACCESS_KEY_ID=xxxxxx
GHOST_STORAGE_ADAPTER_R2_SECRET_ACCESS_KEY=xxxxxx
GHOST_STORAGE_ADAPTER_R2_BUCKET=my-ghost-bucket
GHOST_STORAGE_ADAPTER_R2_DOMAIN=https://cdn.example.com
# Optional
GHOST_STORAGE_ADAPTER_R2_UUID_NAME=false# optional. Default=false
GHOST_STORAGE_ADAPTER_R2_IMAGES_URL_PREFIX=/content/images/# optional. Default=/content/images/
GHOST_STORAGE_ADAPTER_R2_MEDIA_URL_PREFIX=/content/media/# optional. Default=/content/media/
GHOST_STORAGE_ADAPTER_R2_FILES_URL_PREFIX=/content/files/# optional. Default=/content/files/
GHOST_STORAGE_ADAPTER_R2_CONTENT_PREFIX=''# optional. Default=''
GHOST_STORAGE_ADAPTER_R2_GHOST_RESIZE=true# optional. Default=true
GHOST_STORAGE_ADAPTER_R2_RESPONSIVE_IMAGES=false# optional. Default=false
GHOST_STORAGE_ADAPTER_R2_SAVE_ORIGINAL=true# optional. Default=true
# Example widths to get Dawn theme working correctly:
GHOST_STORAGE_ADAPTER_R2_RESIZE_WIDTHS=300,600,1000,1600,400,750,960,1140,1200 # optional. Default=300,600,1000,1600,400,750,960,1140,1200
GHOST_STORAGE_ADAPTER_R2_RESIZE_JPEG_QUALITY=80# optional. Default=80
GHOST_STORAGE_ADAPTER_R2_LOG_LEVEL=info# optional. Default=info
GHOST_STORAGE_ADAPTER_R2_SAVE_ORIG_NAME_METADATA=false# optional. Default=false
```
