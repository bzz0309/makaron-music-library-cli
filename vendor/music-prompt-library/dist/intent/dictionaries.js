const entry = (field, canonical, zh, en, specificity = "phrase", weight = 0.9, implies) => ({ field, canonical, zh, en, specificity, weight, implies });
export const applicationDictionary = [
    entry("application_fit.domains", "corporate", ["企业创新文化", "组织成长", "组织升级", "企业创新", "创新叙事"], ["corporate innovation", "organizational transformation", "corporate progress", "innovation culture"], "compound", 1, { "application_fit.usage_context": ["growth", "background"], "music_role": ["background"], "music_identity.mood": ["innovative", "confident"] }),
    entry("application_fit.domains", "branding", ["可持续品牌", "环保品牌", "自然品牌", "品牌责任"], ["sustainable brand", "ethical brand", "organic brand identity", "purpose-driven brand"], "compound", 1, { "application_fit.usage_context": ["brand_expression", "identity"], "music_role": ["brand_signature"], "audio_character.texture": ["organic"], "audio_character.warmth": ["warm"] }),
    entry("application_fit.domains", "technology", ["金融科技", "支付安全", "数字金融", "金融系统"], ["fintech", "financial technology", "payment security", "digital finance", "secure platform"], "compound", 1, { "application_fit.usage_context": ["identity", "brand_signature"], "music_role": ["brand_signature"], "music_identity.mood": ["precise", "confident"] }),
    entry("application_fit.domains", "product_showcase", ["多产品陈列", "商品系列", "零售音乐", "购物节奏", "商店活动"], ["retail momentum", "retail campaign", "shopping groove", "cross-category merchandising", "multi-product"], "compound", 1, { "application_fit.usage_context": ["product_showcase", "background"], "music_role": ["background"], "music_identity.mood": ["friendly", "bright"] }),
    entry("application_fit.domains", "design", ["建筑和地产项目", "建筑空间", "地产展示", "建筑设计", "空间材质尺度", "空间与材质"], ["architectural real estate", "architecture film", "property showcase", "spatial design", "built environment"], "compound", 1, { "application_fit.usage_context": ["product_showcase", "background"], "music_role": ["background"], "music_identity.mood": ["expansive", "premium"] }),
    entry("application_fit.domains", "fashion", ["高定时装", "高级定制", "管弦走秀", "时装编辑", "时装内容"], ["couture orchestral", "couture runway", "editorial orchestra", "orchestral runway"], "compound", 1, { "application_fit.usage_context": ["runway", "brand_expression"], "music_role": ["rhythmic_driver"], "music_identity.mood": ["elegant", "controlled"] }),
    entry("application_fit.domains", "beauty", ["天然护肤", "有机护肤", "护理仪式", "护肤成分"], ["organic skincare", "natural skincare", "care ritual", "ingredient detail"], "compound", 1, { "application_fit.usage_context": ["sensory_detail", "daily_ritual"], "music_role": ["background"], "music_identity.mood": ["calm", "fresh"], "audio_character.texture": ["organic"] }),
    entry("application_fit.domains", "luxury", ["珠宝声音标志", "晶体质感", "宝石细节", "稀有价值"], ["crystalline jewelry", "fine jewelry", "jewelry signature", "facet reflection", "precious detail"], "compound", 1, { "application_fit.usage_context": ["brand_signature", "reveal"], "music_role": ["brand_signature"], "music_identity.mood": ["precise", "elegant"] }),
    entry("application_fit.domains", "storytelling", ["亲密关系", "人物关系戏", "克制爱情", "爱情对话", "关系张力", "温柔连接"], ["intimate romance", "relationship score", "quiet relationship", "romantic tension", "vulnerable affection"], "compound", 1, { "application_fit.usage_context": ["conversation", "emotional_support"], "music_role": ["emotional_support"], "music_identity.mood": ["tender", "warm"], "music_identity.genre": ["cinematic_piano"] }),
    entry("application_fit.domains", "documentary", ["调查纪录片", "调查报道", "调查新闻", "证据推进", "事实叙事", "采访调查"], ["investigative documentary", "investigative journalism", "evidence pulse", "factual inquiry", "unfolding evidence"], "compound", 1, { "application_fit.usage_context": ["investigation", "observation"], "music_role": ["background", "tension_builder"], "music_identity.mood": ["thoughtful", "mysterious"] }),
    entry("application_fit.domains", "product_showcase", ["手机发布会", "产品发布会", "新品发布会", "产品发布", "产品展示", "产品功能", "功能展示", "功能演示", "科技产品", "智能设备"], ["product showcase", "product reveal", "product launch", "device launch", "feature reveal", "feature rollout", "feature demo"], "compound", 1),
    entry("application_fit.domains", "technology", ["未来科技", "科技感", "智能设备", "数码", "科技"], ["technology", "tech", "smart device", "futuristic technology", "innovation"], "phrase", 0.9),
    entry("application_fit.domains", "advertising", ["广告", "商业广告", "宣传片"], ["advertisement", "advertising", "commercial", "campaign"], "token", 0.85),
    entry("application_fit.domains", "branding", ["声音标识", "声音logo", "声音 logo", "品牌升级", "品牌声音", "声音标志", "听觉标志"], ["sonic logo", "sonic identity", "audio branding", "brand recall"], "compound", 1),
    entry("application_fit.domains", "live_event", ["演唱会", "发布活动", "年度发布会", "嘉宾登场", "颁奖典礼", "开幕式", "大型活动", "典礼"], ["ceremony", "live event", "award show", "big entrance"], "phrase", 0.95),
    entry("application_fit.domains", "motion_design", ["章节中间", "声音转场", "章节切换", "章节之间", "电子过渡"], ["motion design", "section transition", "edit stinger"], "compound", 1),
    entry("application_fit.domains", "urban_culture", ["地铁数字广告牌", "数字广告牌", "城市大屏", "都市科技", "数字屏幕", "地铁屏幕"], ["urban screen", "digital billboard", "city screen"], "compound", 1),
    entry("application_fit.domains", "urban_culture", ["都市夜景", "城市夜景", "霓虹城市"], ["urban night", "neon city"], "compound", 0.95),
    entry("application_fit.domains", "comedy", ["搞笑反应", "反应音乐", "幽默反应", "综艺感"], ["comedy reaction", "reaction cue", "comic timing"], "compound", 1),
    entry("application_fit.domains", "family", ["狗狗", "小狗", "小猫", "宠物", "新玩具"], ["pet", "puppy", "kitten"], "phrase", 0.95),
    entry("application_fit.domains", "youth_content", ["日系少女", "少女写真", "青春写真", "校园青春", "校园故事"], ["youth portrait", "youthful campus", "campus portrait", "girl portrait", "campus story"], "compound", 1),
    entry("application_fit.domains", "luxury", ["高端设计品牌", "高级珠宝", "珠宝", "腕表", "奢侈品", "奢华品牌", "高端品牌"], ["luxury", "jewelry", "watch campaign", "premium brand", "design brand"], "phrase", 0.95),
    entry("application_fit.domains", "beauty", ["彩妆", "美妆", "护肤", "香水"], ["beauty", "skincare", "cosmetics", "fragrance"], "token", 0.95),
    entry("application_fit.domains", "performance", ["乐队现场", "现场乐队", "街舞比赛", "舞蹈比赛", "舞台", "表演", "演出", "偶像", "爱豆"], ["performance", "stage", "dance competition", "dance battle", "idol", "live band"], "phrase", 0.95),
    entry("application_fit.domains", "fashion", ["时尚", "秀场", "走秀", "服装", "时装周"], ["fashion", "runway", "editorial"], "token", 0.95),
    entry("application_fit.domains", "automotive", ["豪华汽车", "电动车", "汽车", "新车", "驾驶", "公路驾驶"], ["automotive", "car reveal", "driving", "luxury mobility"], "phrase", 0.95),
    entry("application_fit.domains", "travel", ["旅行", "旅拍", "旅程", "旅途", "海岛", "目的地"], ["travel", "vlog", "destination", "journey", "exploration"], "token", 0.9),
    entry("application_fit.domains", "storytelling", ["人生故事", "人物故事", "创业纪录", "成长历程", "剧情", "动画", "故事", "叙事", "人生"], ["story", "storytelling", "human drama", "anime", "training journey", "earned achievement"], "token", 0.9),
    entry("application_fit.domains", "social_media", ["社交短视频", "社交内容", "主播整活", "直播预告", "短内容", "热点", "潮流", "生活记录"], ["social media", "social content", "short social content", "short form", "viral", "trend", "creator content"], "phrase", 0.9),
    entry("application_fit.domains", "lifestyle", ["生活方式", "日常", "生活记录"], ["lifestyle", "daily life"], "phrase", 0.85),
    entry("application_fit.domains", "lifestyle", ["咖啡馆", "咖啡店", "咖啡"], ["cafe", "coffee shop"], "token", 0.9),
    entry("application_fit.domains", "food", ["零食", "食欲", "食品", "饮料", "餐饮", "美食", "果汁", "聚餐"], ["food", "beverage", "refreshment", "appetite"], "token", 0.95),
    entry("application_fit.domains", "documentary", ["纪录片", "纪实", "访谈", "社会议题"], ["documentary", "interview", "journalism"], "token", 1),
    entry("application_fit.domains", "storytelling", ["悬疑", "调查真相", "神秘调查", "剧情预告"], ["suspense", "thriller", "mystery investigation"], "compound", 0.9, { "music_identity.mood": ["suspenseful"] }),
    entry("application_fit.domains", "gaming", ["游戏", "电竞", "角色选择", "战斗", "boss"], ["game", "gaming", "esports", "character select", "boss battle"], "token", 0.85),
    entry("application_fit.domains", "live_streaming", ["直播", "直播间", "主播"], ["livestream", "live stream", "streamer"], "token", 0.85)
];
export const usageDictionary = [
    entry("application_fit.usage_context", "emotional_arc", ["脆弱到", "走向和解", "重新获得希望", "情绪弧线", "从低谷"], ["emotional arc", "dramatic arc", "from vulnerable to hope"], "compound", 1),
    entry("application_fit.usage_context", "hook", ["第一秒", "抓人的", "抓人", "抓耳", "记忆点", "热门循环", "反复循环"], ["instant hook", "catchy loop", "catchy", "hook first"], "phrase", 1),
    entry("application_fit.usage_context", "opening", ["开场", "开头", "片头", "登场"], ["opening", "intro", "entrance"], "token", 0.95),
    entry("application_fit.usage_context", "background", ["背景", "铺底", "旁白", "不抢旁白"], ["background", "underscore", "under dialogue"], "token", 0.9),
    entry("application_fit.usage_context", "transition", ["转场", "过渡", "切换"], ["transition", "section change"], "token", 1),
    entry("application_fit.usage_context", "climax", ["高潮", "高光", "爆发", "夺冠"], ["climax", "peak", "victory"], "token", 0.9),
    entry("application_fit.usage_context", "ending", ["结尾", "片尾", "收束", "最后"], ["ending", "outro", "resolution"], "token", 0.95),
    entry("application_fit.usage_context", "brand_signature", ["品牌标识", "品牌声音", "声音标志", "声音logo", "声音 logo"], ["brand signature", "sonic identity", "sonic logo"], "compound", 1),
    entry("application_fit.usage_context", "product_reveal", ["产品揭晓", "新品揭晓", "产品亮相", "新车发布"], ["product reveal", "device reveal", "car reveal"], "compound", 0.95),
    entry("application_fit.usage_context", "product_reveal", ["揭晓", "亮相"], ["reveal"], "token", 0.82),
    entry("application_fit.usage_context", "feature_reveal", ["功能展示", "功能演示", "产品功能", "逐项出现"], ["feature reveal", "feature rollout", "feature demo"], "compound", 0.95),
    entry("application_fit.usage_context", "journey", ["从车站出发", "旅行出发", "旅程", "旅途", "一路成长", "成长旅程"], ["journey", "growth journey"], "token", 0.9),
    entry("application_fit.usage_context", "reflection", ["反思", "回看", "回望", "过去", "旧照片"], ["reflection", "reflective", "looking back", "old photographs", "old photos"], "token", 0.9),
    entry("application_fit.usage_context", "performance", ["舞蹈表演", "舞台表演", "现场表演", "演出"], ["performance", "live performance"], "phrase", 0.9),
    entry("application_fit.usage_context", "brand_expression", ["品牌广告", "品牌宣传", "品牌表达"], ["brand campaign", "brand expression"], "phrase", 0.9),
    entry("application_fit.usage_context", "driving", ["驾驶", "公路行驶", "开车"], ["driving", "road drive"], "token", 0.95),
    entry("application_fit.usage_context", "night_drive", ["夜间驾驶", "夜晚驾驶", "夜间开车"], ["night drive", "night driving"], "compound", 1)
];
export const roleDictionary = [
    entry("music_role", "intro", ["开场", "开头", "片头", "登场"], ["opening", "intro", "entrance"], "token", 0.95),
    entry("music_role", "background", ["背景", "铺底", "旁白"], ["background", "underscore"], "token", 0.9),
    entry("music_role", "transition", ["转场", "过渡", "切换"], ["transition", "stinger"], "token", 1),
    entry("music_role", "emotional_support", ["情绪支撑", "情感铺垫", "感人", "情感钢琴"], ["emotional support", "emotional underscore"], "phrase", 0.95),
    entry("music_role", "rhythmic_driver", ["节奏驱动", "卡点", "动感", "推进感", "重拍清晰"], ["rhythmic driver", "beat driven", "sync music"], "phrase", 0.9),
    entry("music_role", "rhythmic_driver", ["驾驶", "行驶"], ["driving"], "token", 0.78),
    entry("music_role", "tension_builder", ["逐步建立悬疑", "紧张感", "紧张推进", "悬念", "危机", "越来越不安"], ["tension builder", "slow burn suspense", "build tension"], "phrase", 1),
    entry("music_role", "climax_support", ["高潮", "高光", "爆发", "夺冠", "大揭晓"], ["climax", "peak", "big reveal"], "token", 0.95),
    entry("music_role", "ending", ["结尾", "片尾", "收束", "最后"], ["ending", "outro"], "token", 0.95),
    entry("music_role", "brand_signature", ["品牌", "品牌标识", "品牌声音", "声音标志", "声音logo", "声音 logo"], ["brand signature", "sonic identity", "sonic logo"], "phrase", 0.95)
];
export const moodDictionary = [
    entry("music_identity.mood", "premium", ["高级", "高端", "精致", "奢华", "豪华", "有质感"], ["premium", "luxury", "refined", "high end"], "token", 0.95),
    entry("music_identity.mood", "futuristic", ["未来", "未来感", "科技感"], ["futuristic", "future facing"], "token", 0.9),
    entry("music_identity.mood", "energetic", ["活力", "动感", "燃", "兴奋", "热血"], ["energetic", "dynamic", "exciting", "high energy"], "token", 0.9),
    entry("music_identity.mood", "emotional", ["有情绪", "情绪", "感人", "情感", "回忆", "温情"], ["emotional", "heartfelt", "nostalgic"], "token", 0.9),
    entry("music_identity.mood", "reflective", ["反思", "回望", "自省", "回看"], ["reflective", "introspective"], "token", 0.95),
    entry("music_identity.mood", "inspirational", ["励志", "鼓舞", "希望", "成长", "成功", "实现梦想"], ["inspirational", "uplifting", "hopeful", "achievement"], "token", 0.9),
    entry("music_identity.mood", "playful", ["俏皮", "有趣", "可爱", "轻松", "萌趣", "搞笑", "整活"], ["playful", "fun", "cute", "cheeky"], "token", 0.9),
    entry("music_identity.mood", "calm", ["治愈", "平静", "舒缓", "安静", "松弛", "克制"], ["calm", "relaxed", "peaceful", "healing", "restrained"], "token", 0.9),
    entry("music_identity.mood", "suspenseful", ["悬疑", "紧张", "不安", "危机", "神秘"], ["suspenseful", "tense", "tension", "mystery", "mysterious", "thriller"], "token", 1),
    entry("music_identity.mood", "dreamy", ["梦幻", "空灵", "浪漫", "空气感"], ["dreamy", "ethereal", "romantic", "ambient"], "token", 0.9),
    entry("music_identity.mood", "confident", ["自信", "强势", "酷", "冷感"], ["confident", "bold", "cool"], "token", 0.9),
    entry("music_identity.mood", "bright", ["明亮", "阳光", "清新", "清透", "开心爽脆"], ["bright", "sunny", "fresh", "radiant"], "token", 0.9),
    entry("music_identity.mood", "youthful", ["年轻一点", "更年轻", "年轻感", "青春感"], ["younger", "more youthful", "youthful"], "phrase", 0.95),
    entry("music_identity.mood", "warm", ["温暖", "温情", "舒服", "舒适"], ["warm", "cozy", "heartwarming"], "token", 0.9),
    entry("music_identity.mood", "nostalgic", ["怀旧", "回忆", "多年前", "旧照片"], ["nostalgic", "memory"], "token", 0.9),
    entry("music_identity.mood", "powerful", ["有力量", "力量感", "力量", "强劲", "宏大", "隆重", "庄重", "冲击"], ["powerful", "grand", "massive", "impact"], "token", 0.9)
];
export const genreDictionary = [
    entry("music_identity.genre", "kpop", ["韩流", "爱豆舞曲"], ["k-pop", "kpop", "idol pop"], "token", 1),
    entry("music_identity.genre", "jpop", ["日系流行", "日系少女", "日系校园"], ["j-pop", "jpop", "japanese pop"], "phrase", 1),
    entry("music_identity.genre", "cinematic", ["电影感", "电影叙事", "大片感"], ["cinematic", "film score"], "token", 0.9),
    entry("music_identity.genre", "electronic", ["电子音乐", "电子氛围", "电子脉冲"], ["electronic", "electronica"], "token", 0.85),
    entry("music_identity.genre", "deep_house", ["deep house", "深浩室"], ["deep house"], "compound", 1),
    entry("music_identity.genre", "ambient", ["氛围音乐", "氛围背景"], ["ambient", "atmospheric"], "token", 0.9),
    entry("music_identity.genre", "piano", ["钢琴", "情感钢琴"], ["piano", "felt piano"], "token", 0.9),
    entry("music_identity.genre", "live_band", ["现场乐队", "乐队现场", "全场合唱"], ["live band", "anthem", "live drums"], "phrase", 1)
];
export const audioCharacterDictionary = [
    entry("audio_character.texture", "clean", ["干净", "清透", "纯净"], ["clean", "pristine"], "token", 0.95),
    entry("audio_character.texture", "minimal", ["极简", "留白", "简洁"], ["minimal", "minimalist", "restrained"], "token", 0.95),
    entry("audio_character.texture", "futuristic", ["未来科技", "未来感", "科技感"], ["futuristic", "future tech"], "token", 0.9),
    entry("audio_character.texture", "organic", ["自然", "有机", "真实"], ["organic", "natural"], "token", 0.85),
    entry("audio_character.texture", "glossy", ["闪亮", "光泽", "发光"], ["glossy", "luminous", "shimmering"], "token", 0.85),
    entry("audio_character.brightness", "bright", ["明亮", "清新", "清透", "阳光"], ["bright", "fresh", "radiant"], "token", 0.9),
    entry("audio_character.brightness", "dark", ["黑暗", "低沉", "阴暗"], ["dark", "low", "shadowy"], "token", 0.9),
    entry("audio_character.warmth", "warm", ["温暖", "温润", "治愈", "舒服"], ["warm", "cozy"], "token", 0.9),
    entry("audio_character.warmth", "cold", ["冷感", "冷酷", "冰冷"], ["cold", "cool toned"], "token", 0.9),
    entry("audio_character.punch", "hard", ["冲击力", "重拍", "有力", "炸裂"], ["hard hitting", "punchy", "impactful"], "token", 0.9),
    entry("audio_character.punch", "soft", ["轻柔", "柔和", "克制", "不抢"], ["soft", "gentle", "subtle"], "token", 0.9),
    entry("audio_character.space", "wide", ["宽广", "开阔", "空间感"], ["wide", "spacious", "open"], "token", 0.85),
    entry("audio_character.space", "cinematic", ["更电影感", "电影感", "电影空间", "宏大空间", "大片空间"], ["more cinematic", "cinematic space", "epic space"], "phrase", 0.9),
    entry("audio_character.polish", "premium", ["高级", "高端", "精致", "有质感"], ["premium", "polished", "refined"], "token", 0.95),
    entry("audio_character.polish", "clean", ["干净", "清透"], ["clean production", "clean"], "token", 0.85),
    entry("audio_character.density", "sparse", ["留白", "稀疏", "不要太满"], ["sparse", "uncluttered"], "token", 0.9),
    entry("audio_character.density", "dense", ["饱满", "密集", "厚重"], ["dense", "full", "layered"], "token", 0.85)
];
export const tempoDictionary = [
    entry("music_identity.tempo_feel", "fast", ["快速", "快节奏", "轻快"], ["fast", "up tempo", "uptempo"], "token", 0.85),
    entry("music_identity.tempo_feel", "medium", ["适中", "稳稳推进", "中速"], ["medium tempo", "steady"], "token", 0.85),
    entry("music_identity.tempo_feel", "slow", ["缓慢", "慢慢铺开", "慢节奏"], ["slow", "slow burn"], "token", 0.85)
];
export const intentDictionary = [
    ...applicationDictionary,
    ...usageDictionary,
    ...roleDictionary,
    ...moodDictionary,
    ...genreDictionary,
    ...audioCharacterDictionary,
    ...tempoDictionary
];
export const energySignals = [
    { value: 5, terms: ["高能", "强烈", "炸裂", "爆发", "high energy", "intense", "massive impact"], confidence: 0.95 },
    { value: 4, terms: ["动感", "有力", "推动", "热血", "energetic", "driving", "powerful beat"], confidence: 0.9 },
    { value: 3, terms: ["中等能量", "稳健", "适中", "有一点律动", "medium energy", "balanced", "controlled"], confidence: 0.9 },
    { value: 2, terms: ["舒缓", "轻柔", "克制", "安静", "low energy", "gentle", "subtle", "restrained"], confidence: 0.9 },
    { value: 1, terms: ["极简安静", "静谧", "非常平静", "minimal calm", "very soft"], confidence: 0.95 }
];
export const referenceMappings = [
    { name: "Apple keynote", terms: ["像苹果发布会", "苹果发布会一样", "apple keynote", "apple launch"], interpreted_as: ["premium", "clean", "minimal", "futuristic"] }
];
