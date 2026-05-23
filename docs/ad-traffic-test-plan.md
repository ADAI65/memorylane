# MemoryLane 广告投流测试方案

> 适用阶段：冷启动期（0-1000 用户）
> 前置条件：社媒账号已注册（#71）、首批内容已发布（#72）

---

## 1. 投放策略概述

**目标**：以最低成本获取首批真实用户，验证产品-市场匹配度

**预算建议**：$50-100 测试期（约 ¥350-700）

**核心原则**：
- 先测素材，再放量
- 单平台跑通再扩
- 追踪注册转化率 > 追踪点击量

---

## 2. 平台优先级

| 优先级 | 平台 | 日预算 | 原因 |
|--------|------|--------|------|
| 1️⃣ | **TikTok Ads** | $10-15/天 | 老照片修复视频天然适合短视频平台，CPM 低 |
| 2️⃣ | **Reddit Ads** | $5-10/天 | r/OldPhotos, r/Genealogy 等精准社区 |
| 3️⃣ | **Meta (IG+FB)** | $10-15/天 | 受众广泛，可选兴趣定向 |
| ⏸️ | Google Ads | 暂缓 | "photo restoration" CPC 偏高（$1-3），等有自然流量 |

### 不建议投的平台
- Twitter/X Ads — ROI 低，除非预算充足
- Pinterest Ads — 转化链路长，不适合免费工具
- YouTube Ads — 制作成本高，冷启动不划算

---

## 3. 受众定位

### TikTok Ads
```
地区：US, UK, Canada, Australia
年龄：35-65（对老照片有情感共鸣的人群）
兴趣：Family, History, Photography, Nostalgia
行为：Video engagement rate > 5%
设备：iOS + Android
```

### Reddit Ads
```
版块：r/OldPhotos, r/Colorization, r/Genealogy, r/FamilyHistory
地区：US, UK, Canada
格式：Promoted Post（看起来像普通帖子）
```

### Meta Ads
```
地区：US, UK, Canada, Australia
年龄：30-60
兴趣：Genealogy, Family history, Photography, History, Vintage
排除：已安装相似 App 的用户
```

---

## 4. 素材规格与创意方向

### TikTok 视频广告
| 规格 | 要求 |
|------|------|
| 尺寸 | 1080×1920（9:16） |
| 时长 | 15-30 秒 |
| 格式 | MP4, H.264 |

**创意脚本 A（Before/After 对比型）：**
```
[0-3秒] 模糊老照片特写 + "This photo was from 1952"
[3-6秒] 修复过程（AI 处理动画）+ "Our AI fixed it in 10 seconds"
[6-10秒] 清晰修复后照片 + "Free. No limits. No catch."
[10-15秒] CTA "Try it now" + 网站链接
```

**创意脚本 B（情感故事型）：**
```
[0-3秒] "She hadn't seen her mom smile in 40 years"
[3-10秒] 照片动画化过程
[10-15秒] CTA "Bring your photos to life"
```

### Reddit 图文广告
| 规格 | 要求 |
|------|------|
| 图片 | 1200×628px |
| 标题 | 最多 300 字符 |
| 正文 | 最多 40,000 字符 |

**标题示例：**
```
"I restored my grandfather's WWII photo using AI — it's completely free"
```

### Meta 图文/视频广告
| 规格 | 要求 |
|------|------|
| 图片 | 1080×1080（1:1）或 1200×628（1.91:1） |
| 视频 | 1080×1080（1:1），最长 60 秒 |
| 文案 | 主文案 125 字符，说明 168 字符 |

---

## 5. A/B 测试计划

### 测试矩阵（$50 预算分配）

| 组 | 平台 | 素材 | 文案 | 日预算 | 测试天数 |
|----|------|------|------|--------|----------|
| A1 | TikTok | Before/After 视频 | "Free photo restoration" | $5 | 5 天 |
| A2 | TikTok | 情感故事 视频 | "Bring photos to life" | $5 | 5 天 |
| B1 | Reddit | 修复前后 图片 | 技术展示标题 | $3 | 5 天 |
| B2 | Meta | Before/After 图文 | "Restore your old photos" | $5 | 5 天 |

### 关键指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| CPM | < $5 | TikTok 目标 |
| CPC | < $0.50 | 点击成本 |
| CTR | > 1.5% | 点击率 |
| 注册转化率 | > 5% | 点击→注册 |
| 完成修复率 | > 30% | 注册→完成一次修复 |

### 决策规则
- **CPM > $10**：换素材或换受众
- **CPC > $1**：优化素材前3秒
- **CTR < 0.5%**：换素材方向
- **注册转化率 < 2%**：优化落地页（Signup → Upload 路径）

---

## 6. 追踪与归因

### 必须配置
- **UTM 参数**：所有广告链接加 `utm_source=tiktok&utm_medium=ads&utm_campaign=launch_test_a1`
- **Meta Pixel**（可选）：如投 Meta Ads，需安装 Pixel 追踪注册事件
- **Vercel Analytics**：已自带，可看流量来源

### UTM 模板
```
https://memorylane-web.vercel.app/?utm_source={platform}&utm_medium=ads&utm_campaign={campaign_name}&utm_content={ad_variant}
```

---

## 7. 时间线

```
Week 1: 注册社媒账号 + 发布自然内容（不发广告）
Week 2: 制作广告素材（Before/After 视频 + 图片）
Week 3: 启动 A/B 测试（TikTok + Reddit）
Week 4: 分析数据，决定是否扩量或换方向
```

---

## 8. 0成本替代方案（推荐先做）

在花广告费之前，先做这些免费渠道获取前 100 个用户：

| 渠道 | 动作 | 预期效果 |
|------|------|----------|
| Reddit | 发帖到 r/OldPhotos, r/Genealogy | 10-50 注册/帖 |
| Product Hunt | 上架 MemoryLane | 100-500 访问 |
| Hacker News | Show HN 帖子 | 50-200 访问 |
| Indie Hackers | 分享构建过程 | 10-30 注册 |
| Facebook 群组 | Genealogy, Family History 群组 | 5-20 注册/群 |
| YouTube Shorts | 发修复前后对比视频 | 100-1000 播放 |

**建议**：先做 0 成本渠道 2 周，有自然流量数据后再决定是否投广告。

---

*制作日期：2026-05-23 | 预算：$50-100 测试期*
