# Makaron Music Library CLI

一个供 Makaron 和所有外部 AI Agent 使用的通用音乐库 CLI。Agent 可以按歌名、歌手、标签或自然语言搜索曲库，为 K-pop 舞台、电商营销等视频匹配 BGM，获取限时音频链接，或在没有合适/可商用曲目时调用 Makaron 生成原创音乐。

## 架构

- npm CLI + 单文件 Agent Skill：安装到任意 Agent 所在电脑。
- Cloudflare Worker：提供鉴权搜索、推荐和限时音频访问。
- D1：保存可检索曲目元数据，不保存本地路径。
- 私有 R2 Bucket：保存真实音频，外部 Agent 看不到对象地址。
- 本地 Owner 工具：索引百度网盘同步目录、同步 R2/D1、为本地视频混音。

外部 Agent 不需要和曲库主人在同一台电脑，也不需要访问百度网盘或 Mac 路径。

## Agent 安装和使用

```bash
npx makaron-music-library-cli setup \
  --api-url https://makaron-music-library-api.bzz0309.workers.dev

export MUSICLIB_API_TOKEN=由曲库管理员分配的Agent令牌
musiclib doctor --remote
```

`setup` 会安装 `musiclib` 命令和仅含一个 `SKILL.md` 的 Agent Skill。API URL 可以保存在本机配置中；令牌只从环境变量读取，不接受命令参数，也不会写进 Skill。

常用命令：

```bash
musiclib search --query "Taylor Swift Love Story" --limit 5
musiclib search --query "日系、治愈、轻快、纯音乐" --limit 5
musiclib recommend --scene kpop-stage --duration 20 \
  --brief "五人女团舞台，强节拍、灯光切换、副歌高潮"
musiclib recommend --scene ecommerce --duration 15 \
  --brief "高端美妆产品，干净现代、抓人、尽量无人声"
musiclib access --track TRACK_ID
```

`access` 返回带过期时间和签名的音频 URL。音频接口支持 Range 分段读取，可用于播放器、下载器和支持 URL 输入的生成工具。结果不会泄露本地文件路径或 R2 object key。

## 音乐理解与原创生成

CLI 内置 40 个音乐 Profile、中文/英文意图解析、可解释排序，以及 `generic`、`makaron`、`video_editor`、`short_video_agent` 四种适配器。

```bash
musiclib brief \
  --request "15秒高端美妆精华电商视频，干净现代、抓人、无人声" \
  --duration 15 \
  --adapter makaron

musiclib generate \
  --prompt "30 seconds, warm piano and strings, cinematic, no vocals"
```

当曲库没有合适结果或版权信息不明确时，读取返回值中的 `decision` 和 `generation_prompt`，再选择核验版权或通过 Makaron 生成原创音乐。

## 部署 Cloudflare

部署前需要 Cloudflare 账号和 Node.js 18+。下面的资源创建和部署命令会修改你的 Cloudflare 账号；先本地检查，确认后再执行。

1. 安装并登录 Wrangler：

```bash
npx wrangler login
```

2. 创建私有 R2 Bucket 和 D1 数据库：

```bash
npx wrangler r2 bucket create makaron-music-library
npx wrangler d1 create makaron-music-library
```

3. 把 D1 命令返回的 `database_id` 填进 `wrangler.toml`，然后创建两项 Worker Secret：

```bash
npx wrangler secret put AGENT_TOKENS
npx wrangler secret put SIGNING_SECRET
```

`AGENT_TOKENS` 是一个或多个逗号分隔的随机 Agent 令牌。`SIGNING_SECRET` 是另一条独立的长随机值，只用于生成限时音频签名。不要提交它们。

4. 建表并部署：

```bash
npx wrangler d1 migrations apply makaron-music-library --remote
npx wrangler deploy
```

5. 在 Cloudflare 控制台创建：

- 一个可写入目标 R2 Bucket 的 R2 S3 API 凭证；
- 一个可查询目标 D1 数据库的 Cloudflare API Token。

把凭证仅放进当前终端环境：

```bash
export CLOUDFLARE_ACCOUNT_ID=...
export CLOUDFLARE_D1_DATABASE_ID=...
export CLOUDFLARE_R2_BUCKET=makaron-music-library
export CLOUDFLARE_API_TOKEN=...
export R2_ACCESS_KEY_ID=...
export R2_SECRET_ACCESS_KEY=...
```

## 索引并上传曲库

百度网盘里的歌曲需先通过桌面客户端下载/同步成当前电脑可见的文件：

```bash
musiclib init --library ~/.musiclib --name "My Music"
musiclib index \
  --library ~/.musiclib \
  --source "/path/to/BaiduNetdisk/Music" \
  --source-name baidu-netdisk-local
```

先进行零写入预检：

```bash
musiclib cloud-sync --library ~/.musiclib --dry-run
```

确认曲目数和总字节数后上传：

```bash
musiclib cloud-sync --library ~/.musiclib --concurrency 3
```

音频会写入私有 R2，安全元数据会写入 D1；本地路径不会进入 D1。重复执行会按曲目 ID 更新索引和覆盖对应对象。

可用 `<歌曲文件>.music.json` 补充标签和版权：

```json
{
  "title": "Morning Walk",
  "artist": "Example Artist",
  "tags": ["japanese", "healing", "guitar", "no_vocals"],
  "description": "light daily vlog background music",
  "license": "owned-commercial-license",
  "commercial_use": true
}
```

## 本地 Owner 模式

```bash
musiclib search --local --query "歌名或歌手"
musiclib recommend --local --scene ecommerce --duration 15
musiclib soundtrack --local --video input.mp4 --track TRACK_ID --output output.mp4
```

需要 `ffprobe` 读取完整媒体元数据，`ffmpeg` 分析视频和混音；macOS 可用 `afinfo` 作为音频时长后备。Makaron 生成需要 `MAKARON_API_KEY` 或 makaron-cli 已保存的认证。

## API

- `GET /v1/health`：公开、无曲库内容。
- `GET /v1/search?query=...`：Bearer 鉴权。
- `POST /v1/recommend`：Bearer 鉴权。
- `POST /v1/tracks/:id/access`：Bearer 鉴权，生成限时 URL。
- `GET /v1/tracks/:id/audio?...`：HMAC 签名和过期校验，支持 Range。

版本 0.1.0 使用共享令牌列表。每 Agent 签发/吊销、审计日志、远程视频上传和服务端视频混音属于后续版本。

## 版权

拥有歌曲文件不等于拥有发布许可。版权未知的歌曲可以被搜索，但不会被标记为可直接商用；`--commercial-only` 只返回明确标记 `commercial_use: true` 的曲目。
