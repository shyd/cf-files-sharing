# CloudFlare File Share

[English](https://github.com/joyance-professional/cf-files-sharing/blob/main/README.md)｜[简体中文](https://github.com/joyance-professional/cf-files-sharing/blob/main/README-cn.md)

A simple file sharing tool running on Cloudflare Workers, backed solely by Cloudflare R2 storage.


![1.png](https://images.joyance.page/api/rfile/1.png)

## Features

- 🔐 Password protection, supports cookie-based persistent login (30 days)
- 💾 Durable object storage via a single R2 bucket
- 📦 Straightforward uploads with automatic sharing links
- 🔗 Simple sharing links
- 🎨 Minimalist black and white interface design
- 🚀 Cloudflare Workers driven, global high-speed access

## Logic

```text
Login process:
User access → Check cookies → No cookies → Display login page → Verify password → Set cookies → Enter home page
                      ↑
              Have cookies → Verify cookies → Enter home page

Upload process:
Select file → Generate unique ID → Store file in R2 → Return the sharing link

Download process:
Access the sharing link → Parse the file ID → Determine storage location → Retrieve file → Return file content
```

## Deployment Guide

### Prerequisites

- [Node.js](https://nodejs.org/) (16.x or higher)
- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Step 1: Configure the Environment

1. Clone the repository:

   ```bash
   git clone https://github.com/joyance-professional/cf-files-sharing
   cd cf-files-sharing
   ```

1. Install dependencies:

   ```bash
   npm install
   ```

1. Install wrangler：

  ```bash
   npm install -g wrangler
   ```

1. Log in to Cloudflare:

   ```bash
   wrangler login
   ```

### Step 2: Create Necessary Cloudflare Resources

1. Create the R2 bucket:

   ```bash
   wrangler r2 bucket create file-share
   ```

### Step 3: Configure Environment Variables

1. Set the authentication password:

   ```bash
   wrangler secret put AUTH_PASSWORD
   ```

   When prompted, enter the password you want to set.

### Step 4: Deploy

Deploy to Cloudflare Workers:

```bash
wrangler deploy
```

## Usage Guide

### Admin Access

1. Access your Workers domain.
1. Enter the set `AUTH_PASSWORD` to log in.
1. The login status will remain for 30 days.

### File Upload

1. After logging in, select the file to upload.
1. Every upload is stored directly in R2, regardless of size.
1. Get the sharing link after the upload is complete.

### File Sharing

- Share link format: `https://your-worker.workers.dev/file/[FILE_ID]`
- Anyone can download the file directly through the link.
- The link is permanently valid.

## Technical Details

### Storage Mechanism

- **R2 Storage**: Durable object storage with no practical size limit.

### Security Features

- Password-protected admin interface
- HttpOnly cookies
- Secure file ID generation mechanism

## Configuration Options

### Environment Variables

|Variable Name|Description|Required|
|-------------|-----------|--------|
|AUTH_PASSWORD|Admin interface login password|Yes|

### `wrangler.toml` Configuration

```toml
name = "file-share-worker"
main = "src/index.js"

[[r2_buckets]]
binding = "FILE_BUCKET"
bucket_name = "file-share"
```

## Development Guide

### Local Development

1. After cloning the repository, run:

   ```bash
   wrangler dev
   ```

1. Visit `http://localhost:8787` for testing.

### Code Structure

```text
cf-files-sharing/
├── src/
│   ├── index.js        # Main entry file
│   ├── auth.js         # Authentication logic
│   ├── storage/
│   │   ├── r2.js       # R2 storage handling
│   │   └── manager.js  # Storage manager
│   ├── utils/
│   │   ├── response.js # Response utilities
│   │   └── id.js       # File ID generator
│   └── html/
│       └── templates.js # HTML templates
├── wrangler.toml       # Cloudflare configuration
```

## Contribution Guide

1. Fork this repository.
1. Create your feature branch (`git checkout -b feature/AmazingFeature`).
1. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
1. Push to the branch (`git push origin feature/AmazingFeature`).
1. Open a Pull Request.

## Credits

- Cloudflare Workers Platform
- Claude-3.5-Sonnet AI
- Chat-GPT-o1-preview | [Chat History](https://chatgpt.com/share/672f2565-470c-8012-a222-904ca69a4692)

## Feedback

If you find any issues or have suggestions for improvements, please create an [issue](https://github.com/joyance-professional/cf-files-sharing/issues).
