# Makaron Music Library CLI

一个供 Makaron 和所有外部 AI Agent 使用的通用音乐库 CLI。Agent 可以按歌名、歌手、标签或自然语言搜索曲库，为 K-pop 舞台、电商营销等视频匹配 BGM，获取限时音频链接，或在没有合适/可商用曲目时调用 Makaron 生成原创音乐。

## 架构

- npm CLI + 单文件 Agent Skill：安装到任意 Agent 所在电脑。
- 腾讯云香港 Web 函数：为妙搭等无法访问 `workers.dev` 的 Agent 提供正式 HTTPS 入口。
- Cloudflare Worker：提供鉴权搜索、推荐和限时音频访问；腾讯云入口只转发允许的 Agent 路由。
- D1：保存可检索曲目元数据，不保存本地路径。
- 私有 R2 Bucket：保存真实音频，外部 Agent 看不到对象地址。
- 本地 Owner 工具：索引百度网盘同步目录、同步 R2/D1、为本地视频混音。

外部 Agent 不需要和曲库主人在同一台电脑，也不需要访问百度网盘或 Mac 路径。

## Agent 安装和使用

```bash
npx makaron-music-library-cli setup
musiclib doctor --remote
```

`setup` 会安装 `musiclib` 命令和仅含一个 `SKILL.md` 的 Agent Skill，自动连接妙搭可访问的腾讯云入口、完成一次轻量计算挑战，并为当前 Agent 签发独立凭证。凭证以 `0600` 权限写入 `~/.musiclib/auth.json`，不会显示在正常命令输出中，也不会写进 Skill。

无需曲库管理员逐个发送 `MUSICLIB_API_TOKEN`。需要更换凭证时运行：

```bash
musiclib register --force --agent "my-agent-name"
```

私有部署可通过 `--api-url` 覆盖默认地址。`MUSICLIB_API_TOKEN` 环境变量仍受支持，并优先于本机凭证文件。

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

3. 把 D1 命令返回的 `database_id` 填进 `wrangler.toml`，然后创建 Worker Secret：

```bash
npx wrangler secret put SIGNING_SECRET
npx wrangler secret put ADMIN_TOKEN
```

`SIGNING_SECRET` 用于注册来源散列和限时音频签名。`ADMIN_TOKEN` 仅供曲库主人上传音频和元数据。两者必须使用不同随机值，且不要提交。升级自 0.1.0 时可保留 `AGENT_TOKENS`，旧共享 Token 会继续兼容，但新 Agent 不再依赖它。

4. 建表并部署：

```bash
npx wrangler d1 migrations apply makaron-music-library --remote
npx wrangler deploy
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
export MUSICLIB_API_URL=https://makaron-music-library-api.bzz0309.workers.dev
export MUSICLIB_ADMIN_TOKEN=曲库管理员令牌
musiclib cloud-sync --library ~/.musiclib --dry-run
```

确认曲目数和总字节数后上传：

```bash
musiclib cloud-sync --library ~/.musiclib --concurrency 3
```

音频会写入私有 R2，安全元数据会写入 D1；本地路径不会进入 D1。重复执行会按曲目 ID 更新索引和覆盖对应对象。
上传走独立的 Worker 管理员通道，不需要把 Cloudflare 账号令牌或 R2 S3 Key 分发给 CLI。

只刷新标签、版权或描述而不重复上传音频：

```bash
musiclib cloud-sync --library ~/.musiclib --metadata-only
```

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
- `POST /v1/register`：公开获取短时计算挑战，按来源限流。
- `POST /v1/register/verify`：验证挑战并一次性签发 Agent 凭证。
- `GET /v1/search?query=...`：Bearer 鉴权。
- `POST /v1/recommend`：Bearer 鉴权。
- `POST /v1/tracks/:id/access`：Bearer 鉴权，生成限时 URL。
- `GET /v1/tracks/:id/audio?...`：HMAC 签名和过期校验，支持 Range。
- `PUT /v1/admin/tracks/:id/audio`：独立管理员鉴权，写入私有 R2。
- `POST /v1/admin/tracks/batch`：独立管理员鉴权，批量更新 D1。

版本 0.2.1 默认使用妙搭可访问的腾讯云香港入口，并为每个 Agent 自助签发独立凭证。D1 只保存 SHA-256 哈希，并分别限制每日搜索、推荐和音频访问次数。管理员可在 D1 将 `agent_tokens.status` 改为 `revoked` 以单独吊销凭证。远程视频上传和服务端视频混音属于后续版本。

## 妙搭与中国网络入口

默认 Agent API 为：

```text
https://1358141432-dnfx3j6t7j.ap-hongkong.tencentscf.com
```

中转代码位于 `tencent-relay/`，仅允许健康检查、注册、搜索、推荐、限时访问和音频 Range 请求；管理员上传接口和任意 URL 代理均被拒绝。腾讯云与 Worker 通过独立的 `MUSICLIB_RELAY_SECRET` / `RELAY_SHARED_SECRET` 验证注册来源。音频仍保存在私有 R2，只有实际播放的字节经过腾讯云中转并产生相应流量。

## 版权

拥有歌曲文件不等于拥有发布许可。版权未知的歌曲可以被搜索，但不会被标记为可直接商用；`--commercial-only` 只返回明确标记 `commercial_use: true` 的曲目。
