// 瀑布流管理页面类型定义

export type AdScene = 'splash' | 'interstitial' | 'feed' | 'search';

export type PricingType = 'CPM' | 'CPC' | 'CPA' | 'CPS' | 'bidding';

export type Platform = 'Android' | 'iOS';

// 分组规则类型
export type RuleType = 'app_version' | 'region' | 'identity' | 'phone_brand' | 'time_period' | 'sub_position' | 'device_id';

export type MatchType = 'include' | 'exclude';

// 应用版本比较运算符
export type VersionOperator = '>=' | '>' | '=' | '<=' | '<';

// 广告位对应的子位配置
// 每个广告位有固定子位（1~N）和长尾开始位（N+1 起的起始编号）
export const SLOT_SUB_POSITIONS: Record<string, { fixedCount: number; longTailStart: number }> = {
  '1000': { fixedCount: 2, longTailStart: 3 },
  '2101': { fixedCount: 2, longTailStart: 3 },
  '2514': { fixedCount: 1, longTailStart: 2 },
  '1120': { fixedCount: 2, longTailStart: 21 },
  '1601': { fixedCount: 1, longTailStart: 2 },
  '1602': { fixedCount: 2, longTailStart: 3 },
};

// 生成子位选项列表（用于多选下拉）
export function generateSubPositionOptions(slotId: string, slotName: string): { label: string; value: string }[] {
  const config = SLOT_SUB_POSITIONS[slotId];
  if (!config) return [];
  const options: { label: string; value: string }[] = [];
  // 固定子位
  for (let i = 1; i <= config.fixedCount; i++) {
    const value = `${slotId}-${slotName}-固定子位-${i}`;
    options.push({ label: value, value });
  }
  // 长尾开始位
  const longTailValue = `${slotId}-${slotName}-长尾开始位-${config.longTailStart}`;
  options.push({ label: longTailValue, value: longTailValue });
  return options;
}

// 规则类型对应枚举值
export const RULE_VALUES: Record<RuleType, { label: string; values: string[] }> = {
  app_version: {
    label: '应用版本',
    values: [], // 不再使用预定义值，改为运算符+输入框
  },
  region: {
    label: '地区',
    values: ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安'],
  },
  identity: {
    label: '身份',
    values: ['经期', '备孕', '怀孕', '辣妈'],
  },
  phone_brand: {
    label: '手机品牌',
    values: ['苹果', '华为', '小米', 'OPPO', 'vivo', '三星', '荣耀', '一加'],
  },
  time_period: {
    label: '时段',
    values: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  },
  sub_position: {
    label: '子位',
    values: ['246'], // 默认子位值
  },
  device_id: {
    label: '设备ID',
    values: [],
  },
};

export interface GroupRule {
  ruleType: RuleType;
  matchType: MatchType;
  values: string[];
  operator?: VersionOperator; // 应用版本比较运算符
}

export interface AdSource {
  id: string;
  name: string;
  icon?: string;
  status: 'enabled' | 'disabled';
  pricingType: PricingType;
  price: number;
  /** A/B 测试对照组价格 */
  priceA?: number;
  /** A/B 测试测试组价格 */
  priceB?: number;
  estimatedRevenue: number;
  ecpm: number;
  thousandRequestValue: number;
  requests: number;
  responses: number;
  responseRate: number;
  bidWins: number;
  bidWinRate: number;
  revenuePerThousand?: number;
  impressions?: number;
  winImpressionRate?: number;
  clicks?: number;
  ctr?: number;
  cpc?: number;
  isFallback?: boolean;
  lastUpdated: string;
  platforms?: Platform[]; // 支持多选平台
  codeId?: string;
  subPositions?: string[]; // 子位
  dspSources?: string[]; // 关联的多个DSP来源
  minVersion?: string; // SDK最小版本
  maxVersion?: string; // SDK最大版本
  dimension?: string; // 尺寸（全尺寸 或 自定义尺寸如 "1080*1555"）
  overrideMode?: boolean; // 是否开启覆盖配置
  overridePids?: string; // 覆盖配置下的多PID列表，JSON数组 [{codeId, minVersion?, maxVersion?}]
}

export interface AdGroup {
  id: string;
  name: string;
  priority: number; // 优先级，数字越大优先级越高；默认分组 priority 固定为 1
  platforms: Platform[];
  adSlots: string[];
  scene: AdScene;          // 所属广告场景
  platform: Platform;      // 所属平台（单平台）
  rules: GroupRule[];
  status: 'enabled' | 'disabled';
  floorPrice: number;
  adSources: AdSource[];
  hasABTest?: boolean; // 是否有A/B测试
  abTestStarted?: boolean; // A/B测试是否已启动
  createdAt?: string; // 创建时间
  abTestStartedAt?: string; // A/B测试启动时间
  abTestEndedAt?: string; // A/B测试结束时间
  abTestDraftData?: { // A/B测试草稿数据
    name: string;
    groupA: string;
    groupB: string;
    copyConfig: boolean;
    config: {
      testGroup: 'A' | 'B';
      flowRatio: string;
      enabledSources: AdSource[];
      disabledSources: AdSource[];
    };
  };
}

export interface SceneNavItem {
  id: AdScene;
  name: string;
  icon: string;
}

export const SCENE_NAV_ITEMS: SceneNavItem[] = [
  { id: 'splash', name: '开屏', icon: 'tv' },
  { id: 'interstitial', name: '插屏', icon: 'square' },
  { id: 'feed', name: '信息流', icon: 'layout-list' },
];

export const MOCK_AD_GROUPS: AdGroup[] = [
  // ===== 开屏 × Android =====
  {
    id: 'splash-android-default',
    name: '默认分组',
    priority: 1,
    platforms: ['Android'],
    adSlots: ['1000'],
    scene: 'splash',
    platform: 'Android',
    rules: [],
    status: 'enabled',
    floorPrice: 0,
    adSources: [
      {
        id: 'sp-and-s1', name: '穿山甲-开屏', status: 'enabled', pricingType: 'bidding', price: 16.33,
        estimatedRevenue: 11234.56, ecpm: 14.56, thousandRequestValue: 0.56, requests: 120000, responses: 60000,
        responseRate: 50.0, bidWins: 20000, bidWinRate: 50.0, revenuePerThousand: 0.05, impressions: 26462,
        winImpressionRate: 100.0, clicks: 1058, ctr: 4.0, cpc: 0.96, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10001', dspSources: ['pangle'],
      },
      {
        id: 'sp-and-s2', name: '优量汇-开屏', status: 'enabled', pricingType: 'CPM', price: 16.32,
        estimatedRevenue: 11234.56, ecpm: 14.56, thousandRequestValue: 0.56, requests: 120000, responses: 60000,
        responseRate: 50.0, bidWins: 20000, bidWinRate: 50.0, revenuePerThousand: 0.05, impressions: 26462,
        winImpressionRate: 100.0, clicks: 1058, ctr: 4.0, cpc: 0.96, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10002', dspSources: ['ylh'],
      },
    ],
  },
  {
    id: 'splash-android-group1',
    name: '开屏高价分组',
    priority: 2,
    platforms: ['Android'],
    adSlots: ['1000'],
    scene: 'splash',
    platform: 'Android',
    rules: [],
    status: 'enabled',
    floorPrice: 10.0,
    adSources: [],
  },
  // ===== 开屏 × iOS =====
  {
    id: 'splash-ios-default',
    name: '默认分组',
    priority: 1,
    platforms: ['iOS'],
    adSlots: ['1000'],
    scene: 'splash',
    platform: 'iOS',
    rules: [],
    status: 'enabled',
    floorPrice: 0,
    adSources: [
      {
        id: 'sp-ios-s1', name: '穿山甲-开屏iOS', status: 'enabled', pricingType: 'bidding', price: 18.50,
        estimatedRevenue: 15230.8, ecpm: 22.15, thousandRequestValue: 0.85, requests: 168000, responses: 95200,
        responseRate: 56.67, bidWins: 42100, bidWinRate: 44.21, revenuePerThousand: 0.09, impressions: 65000,
        winImpressionRate: 100.0, clicks: 3250, ctr: 5.0, cpc: 1.85, lastUpdated: '2024-01-15 10:30',
        platforms: ['iOS'], codeId: '10011', dspSources: ['mintegral'],
      },
      {
        id: 'sp-ios-s2', name: '快手-开屏iOS', status: 'enabled', pricingType: 'bidding', price: 15.20,
        estimatedRevenue: 7850.25, ecpm: 15.6, thousandRequestValue: 0.58, requests: 88000, responses: 50300,
        responseRate: 57.16, bidWins: 18200, bidWinRate: 36.2, revenuePerThousand: 0.07, impressions: 38000,
        winImpressionRate: 100.0, clicks: 1520, ctr: 4.0, cpc: 1.02, lastUpdated: '2024-01-15 10:30',
        platforms: ['iOS'], codeId: '10013', dspSources: ['kuaishou'],
      },
    ],
  },
  // ===== 插屏 × Android =====
  {
    id: 'interstitial-android-default',
    name: '默认分组',
    priority: 1,
    platforms: ['Android'],
    adSlots: ['2101', '2514'],
    scene: 'interstitial',
    platform: 'Android',
    rules: [],
    status: 'enabled',
    floorPrice: 0,
    adSources: [
      {
        id: 'ia-and-s1', name: '穿山甲-插屏', status: 'enabled', pricingType: 'bidding', price: 12.5,
        estimatedRevenue: 8560.32, ecpm: 18.25, thousandRequestValue: 0.68, requests: 98000, responses: 52000,
        responseRate: 53.06, bidWins: 18500, bidWinRate: 35.58, revenuePerThousand: 0.08, impressions: 42000,
        winImpressionRate: 100.0, clicks: 2100, ctr: 5.0, cpc: 1.25, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10007', dspSources: ['pangle'],
      },
      {
        id: 'ia-and-s2', name: 'MY-TapTap-安卓', status: 'enabled', pricingType: 'CPM', price: 15.8,
        estimatedRevenue: 12890.45, ecpm: 16.78, thousandRequestValue: 0.72, requests: 145000, responses: 76800,
        responseRate: 52.97, bidWins: 0, bidWinRate: 0, revenuePerThousand: 0.07, impressions: 55000,
        winImpressionRate: 100.0, clicks: 2200, ctr: 4.0, cpc: 1.58, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10008', dspSources: ['mintegral'],
      },
    ],
  },
  {
    id: 'interstitial-android-group1',
    name: '分组测试1',
    priority: 2,
    platforms: ['Android'],
    adSlots: ['2101'],
    scene: 'interstitial',
    platform: 'Android',
    rules: [{ ruleType: 'identity' as RuleType, matchType: 'include' as MatchType, values: ['经期'] }],
    status: 'enabled',
    floorPrice: 2.5,
    adSources: [
      {
        id: 'ia-g1-s1', name: 'MY--嗨量', status: 'enabled', pricingType: 'bidding', price: 12.5,
        estimatedRevenue: 8560.32, ecpm: 18.25, thousandRequestValue: 0.68, requests: 98000, responses: 52000,
        responseRate: 53.06, bidWins: 18500, bidWinRate: 35.58, revenuePerThousand: 0.08, impressions: 42000,
        winImpressionRate: 100.0, clicks: 2100, ctr: 5.0, cpc: 1.25, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10015', dspSources: ['kuaishou'],
      },
      {
        id: 'ia-g1-s2', name: 'MY-TapTap-安卓', status: 'enabled', pricingType: 'CPM', price: 15.8,
        estimatedRevenue: 12890.45, ecpm: 16.78, thousandRequestValue: 0.72, requests: 145000, responses: 76800,
        responseRate: 52.97, bidWins: 0, bidWinRate: 0, revenuePerThousand: 0.07, impressions: 55000,
        winImpressionRate: 100.0, clicks: 2200, ctr: 4.0, cpc: 1.58, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10016', dspSources: ['mintegral'],
      },
      {
        id: 'ia-g1-s3', name: 'MY-佳投', status: 'enabled', pricingType: 'bidding', price: 8.9,
        estimatedRevenue: 5420.18, ecpm: 14.56, thousandRequestValue: 0.45, requests: 72000, responses: 37200,
        responseRate: 51.67, bidWins: 12400, bidWinRate: 33.33, revenuePerThousand: 0.06, impressions: 28000,
        winImpressionRate: 100.0, clicks: 1120, ctr: 4.0, cpc: 0.89, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10017', dspSources: ['unity'],
      },
    ],
  },
  {
    id: 'interstitial-android-group2',
    name: '分组测试2',
    priority: 3,
    platforms: ['Android'],
    adSlots: ['2514'],
    scene: 'interstitial',
    platform: 'Android',
    rules: [{ ruleType: 'identity' as RuleType, matchType: 'include' as MatchType, values: ['辣妈'] }],
    status: 'disabled',
    floorPrice: 5.0,
    adSources: [
      {
        id: 'ia-g2-s1', name: 'MY-TapTap(插屏)', status: 'enabled', pricingType: 'bidding', price: 18.5,
        estimatedRevenue: 15230.8, ecpm: 22.15, thousandRequestValue: 0.85, requests: 168000, responses: 95200,
        responseRate: 56.67, bidWins: 42100, bidWinRate: 44.21, revenuePerThousand: 0.09, impressions: 65000,
        winImpressionRate: 100.0, clicks: 3250, ctr: 5.0, cpc: 1.85, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10019', dspSources: ['mintegral'],
      },
      {
        id: 'ia-g2-s2', name: 'MY-倍业(美团)', status: 'enabled', pricingType: 'CPM', price: 20.0,
        estimatedRevenue: 18920.5, ecpm: 19.8, thousandRequestValue: 0.92, requests: 198000, responses: 115000,
        responseRate: 58.08, bidWins: 0, bidWinRate: 0, revenuePerThousand: 0.08, impressions: 72000,
        winImpressionRate: 100.0, clicks: 2880, ctr: 4.0, cpc: 2.0, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10020', dspSources: ['tencent'],
      },
    ],
  },
  // ===== 插屏 × iOS =====
  {
    id: 'interstitial-ios-default',
    name: '默认分组',
    priority: 1,
    platforms: ['iOS'],
    adSlots: ['2101', '2514'],
    scene: 'interstitial',
    platform: 'iOS',
    rules: [],
    status: 'enabled',
    floorPrice: 0,
    adSources: [
      {
        id: 'ii-s1', name: 'MY-TapTap(iOS-图片)', status: 'enabled', pricingType: 'bidding', price: 18.5,
        estimatedRevenue: 15230.8, ecpm: 22.15, thousandRequestValue: 0.85, requests: 168000, responses: 95200,
        responseRate: 56.67, bidWins: 42100, bidWinRate: 44.21, revenuePerThousand: 0.09, impressions: 65000,
        winImpressionRate: 100.0, clicks: 3250, ctr: 5.0, cpc: 1.85, lastUpdated: '2024-01-15 10:30',
        platforms: ['iOS'], codeId: '10021', dspSources: ['mintegral'],
      },
      {
        id: 'ii-s2', name: 'MY-倍业(美团)', status: 'enabled', pricingType: 'CPM', price: 20.0,
        estimatedRevenue: 18920.5, ecpm: 19.8, thousandRequestValue: 0.92, requests: 198000, responses: 115000,
        responseRate: 58.08, bidWins: 0, bidWinRate: 0, revenuePerThousand: 0.08, impressions: 72000,
        winImpressionRate: 100.0, clicks: 2880, ctr: 4.0, cpc: 2.0, lastUpdated: '2024-01-15 10:30',
        platforms: ['iOS'], codeId: '10022', dspSources: ['tencent'],
      },
    ],
  },
  {
    id: 'interstitial-ios-group1',
    name: '插屏iOS高价组',
    priority: 2,
    platforms: ['iOS'],
    adSlots: ['2101'],
    scene: 'interstitial',
    platform: 'iOS',
    rules: [],
    status: 'enabled',
    floorPrice: 8.0,
    adSources: [],
  },
  // ===== 搜索 × Android =====
  {
    id: 'search-android-default',
    name: '默认分组',
    priority: 1,
    platforms: ['Android'],
    adSlots: ['4001'],
    scene: 'search',
    platform: 'Android',
    rules: [],
    status: 'enabled',
    floorPrice: 0,
    adSources: [],
  },
  // ===== 搜索 × iOS =====
  {
    id: 'search-ios-default',
    name: '默认分组',
    priority: 1,
    platforms: ['iOS'],
    adSlots: ['4001'],
    scene: 'search',
    platform: 'iOS',
    rules: [],
    status: 'enabled',
    floorPrice: 0,
    adSources: [],
  },
  // ===== 信息流 × Android =====
  {
    id: 'feed-android-default',
    name: '默认分组',
    priority: 1,
    platforms: ['Android'],
    adSlots: ['1120', '1601', '1602'],
    scene: 'feed',
    platform: 'Android',
    rules: [],
    status: 'enabled',
    floorPrice: 0,
    adSources: [
      {
        id: 'fa-s1', name: '穿山甲-信息流', status: 'enabled', pricingType: 'bidding', price: 16.33,
        estimatedRevenue: 11234.56, ecpm: 14.56, thousandRequestValue: 0.56, requests: 120000, responses: 60000,
        responseRate: 50.0, bidWins: 20000, bidWinRate: 50.0, revenuePerThousand: 0.05, impressions: 26462,
        winImpressionRate: 100.0, clicks: 1058, ctr: 4.0, cpc: 0.96, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10024', dspSources: ['pangle'],
      },
      {
        id: 'fa-s2', name: '快手-信息流', status: 'enabled', pricingType: 'bidding', price: 15.20,
        estimatedRevenue: 11234.56, ecpm: 14.56, thousandRequestValue: 0.56, requests: 120000, responses: 60000,
        responseRate: 50.0, bidWins: 20000, bidWinRate: 50.0, revenuePerThousand: 0.05, impressions: 26462,
        winImpressionRate: 100.0, clicks: 1058, ctr: 4.0, cpc: 0.96, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10025', dspSources: ['kuaishou'],
      },
    ],
  },
  // ===== 信息流 × iOS =====
  {
    id: 'feed-ios-default',
    name: '默认分组',
    priority: 1,
    platforms: ['iOS'],
    adSlots: ['1120', '1601', '1602'],
    scene: 'feed',
    platform: 'iOS',
    rules: [],
    status: 'enabled',
    floorPrice: 0,
    adSources: [
      {
        id: 'fi-s1', name: '广点通-信息流iOS', status: 'enabled', pricingType: 'CPM', price: 16.80,
        estimatedRevenue: 11234.56, ecpm: 14.56, thousandRequestValue: 0.56, requests: 120000, responses: 60000,
        responseRate: 50.0, bidWins: 20000, bidWinRate: 50.0, revenuePerThousand: 0.05, impressions: 26462,
        winImpressionRate: 100.0, clicks: 1058, ctr: 4.0, cpc: 0.96, lastUpdated: '2024-01-15 10:30',
        platforms: ['iOS'], codeId: '10027', dspSources: ['gdt'],
      },
    ],
  },
];