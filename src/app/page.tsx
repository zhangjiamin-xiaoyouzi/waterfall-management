'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Tv,
  RectangleHorizontal,
  Square,
  Gift,
  Layout,
  Home,
  Plus,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  Trash2,
  Info,
  Check,
  X,
  ChevronRightIcon,
  ChevronUp,
  Layers,
  ChevronLeft,
  ChevronLast,
  TrendingUp,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  MultipleSelect,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Drawer, DrawerContent, DrawerOverlay } from '@/components/ui/drawer';
import { ChevronDownIcon, ChevronsRightIcon, ChevronsLeftIcon, InboxIcon, Package, ArrowRightIcon, ArrowLeftIcon } from 'lucide-react';
import {
  SCENE_NAV_ITEMS,
  MOCK_AD_GROUPS,
  type AdScene,
  type AdGroup,
  type AdSource,
  type Platform,
  type PricingType,
  type RuleType,
  type GroupRule,
  type MatchType,
  RULE_VALUES,
  SLOT_SUB_POSITIONS,
} from '@/lib/waterfall-types';

// DSP来源颜色标识配置
const SOURCE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  '穿山甲': { bg: '#E8FFEA', text: '#00B42A', dot: '#52C41A' },
  '优量汇': { bg: '#EFF6FF', text: '#2563EB', dot: '#2563EB' },
  '快手': { bg: '#FFF7E6', text: '#FF7A00', dot: '#FF7A00' },
  '广点通': { bg: '#F5F3FF', text: '#7C3AED', dot: '#7C3AED' },
  'default': { bg: '#F2F3F5', text: '#86909C', dot: '#86909C' },
};

// 获取DSP来源颜色配置
const getSourceColor = (name: string) => {
  for (const key of Object.keys(SOURCE_COLORS)) {
    if (name.includes(key)) return SOURCE_COLORS[key];
  }
  return SOURCE_COLORS['default'];
};

// 格式化大数字
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toLocaleString();
};

// 获取图标组件
const getSceneIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    tv: <Tv className="w-5 h-5" />,
    'rectangle-horizontal': <RectangleHorizontal className="w-5 h-5" />,
    square: <Square className="w-5 h-5" />,
    gift: <Gift className="w-5 h-5" />,
    layout: <Layout className="w-5 h-5" />,
  };
  return icons[iconName] || <Tv className="w-5 h-5" />;
};

// DSP来源映射
const DSP_SOURCE_NAMES: Record<string, string> = {
  dsp_1: '穿山甲',
  dsp_2: '快手',
  dsp_3: '腾讯广告',
  dsp_4: '巨量引擎',
  dsp_5: 'Mintegral',
  dsp_6: 'Unity Ads',
  dsp_7: 'AppLovin',
  dsp_8: 'AdMob',
};

// DSP来源列表
const DSP_SOURCE_LIST = [
  { value: 'dsp_1', label: '穿山甲' },
  { value: 'dsp_2', label: '快手' },
  { value: 'dsp_3', label: '腾讯广告' },
  { value: 'dsp_4', label: '巨量引擎' },
  { value: 'dsp_5', label: 'Mintegral' },
  { value: 'dsp_6', label: 'Unity Ads' },
  { value: 'dsp_7', label: 'AppLovin' },
  { value: 'dsp_8', label: 'AdMob' },
];

// 代码位类型定义
interface AdSlot {
  id: string;
  name: string;
  scene: string;
}

interface CodePosition {
  id: string;
  codeId: string;
  name: string;
  platform: 'Android' | 'iOS';
  dspSource: string;
  scene: string;
  slot: string;
  slotName: string;
  priceMode: 'bidding' | 'pricing';
  status: 'enabled' | 'disabled';
}

// Mock代码位数据
const MOCK_CODE_POSITIONS: CodePosition[] = [
  { id: '1', codeId: '10001', name: '开屏广告-主', platform: 'Android', dspSource: '穿山甲', scene: '开屏', slot: '1000', slotName: '美柚--开屏', priceMode: 'bidding', status: 'enabled' },
  { id: '2', codeId: '10002', name: '插屏广告-高活跃', platform: 'iOS', dspSource: '优量汇', scene: '插屏', slot: '2101', slotName: '美柚-首页-插屏', priceMode: 'pricing', status: 'enabled' },
  { id: '3', codeId: '10003', name: '插屏广告', platform: 'Android', dspSource: '穿山甲', scene: '插屏', slot: '2514', slotName: '爱爱记录-记录完成插屏', priceMode: 'bidding', status: 'enabled' },
  { id: '4', codeId: '10004', name: '信息流广告', platform: 'iOS', dspSource: 'ToBid', scene: '信息流', slot: '1120', slotName: '首页大社区feeds流', priceMode: 'bidding', status: 'disabled' },
  { id: '5', codeId: '10005', name: '开屏广告-备用', platform: 'Android', dspSource: '优量汇', scene: '开屏', slot: '1000', slotName: '美柚--开屏', priceMode: 'pricing', status: 'enabled' },
  { id: '6', codeId: '10006', name: '信息流-帖子详情', platform: 'iOS', dspSource: '穿山甲', scene: '信息流', slot: '1601', slotName: '美柚-她她圈-帖子详情楼间广告', priceMode: 'bidding', status: 'enabled' },
  { id: '7', codeId: '10007', name: '信息流-社区', platform: 'Android', dspSource: '优量汇', scene: '信息流', slot: '1602', slotName: '美柚-她她圈-帖子详情信息流', priceMode: 'bidding', status: 'enabled' },
];

// 广告场景
const SCENE_ITEMS = [
  { value: 'splash', label: '开屏' },
  { value: 'interstitial', label: '插屏' },
  { value: 'feed', label: '信息流' },
];

// 广告位名称映射
const SLOT_NAME_MAP: Record<string, string> = {
  '1000': '美柚--开屏',
  '2101': '美柚-首页-插屏',
  '2514': '爱爱记录-记录完成插屏',
  '1120': '首页大社区feeds流',
  '1601': '美柚-她她圈-帖子详情楼间广告',
  '1602': '美柚-她她圈-帖子详情信息流',
};

// 广告场景 - 广告位ID映射
const SCENE_SLOT_IDS: Record<AdScene, string[]> = {
  splash: ['1000'],
  interstitial: ['2101', '2514'],
  feed: ['1120', '1601', '1602'],
};

// 按场景获取广告位选项
const getSlotOptionsByScene = (scene: string) => {
  const options: { value: string; label: string }[] = [];
  if (scene === 'splash') {
    options.push({ value: '1000', label: '1000 - 美柚--开屏' });
  } else if (scene === 'interstitial') {
    options.push({ value: '2101', label: '2101 - 美柚-首页-插屏' });
    options.push({ value: '2514', label: '2514 - 爱爱记录-记录完成插屏' });
  } else if (scene === 'feed') {
    options.push({ value: '1120', label: '1120 - 首页大社区feeds流' });
    options.push({ value: '1601', label: '1601 - 美柚-她她圈-帖子详情楼间广告' });
    options.push({ value: '1602', label: '1602 - 美柚-她她圈-帖子详情信息流' });
  }
  return options;
};

// 代码位管理广告位名称映射
const CODE_SLOT_MAP: Record<string, string> = {
  '1000': '美柚--开屏',
  '2101': '美柚-首页-插屏',
  '2514': '爱爱记录-记录完成插屏',
  '1120': '首页大社区feeds流',
  '1601': '美柚-她她圈-帖子详情楼间广告',
  '1602': '美柚-她她圈-帖子详情信息流',
};

export default function WaterfallManagementPage() {
  // 页面切换状态
  const [currentPage, setCurrentPage] = useState<'waterfall' | 'codePosition'>('waterfall');
  
  // 状态管理
  const [activeScene, setActiveScene] = useState<AdScene>('splash');
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'Android' | 'iOS'>('iOS');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  
  // 数据版本号 - 当数据结构变更时更新
  const DATA_VERSION = '4.1';

  // 初始分组数据 - 始终确保有默认分组
  const getInitialGroups = (): AdGroup[] => {
    // 优先使用 localStorage 中的有效数据
    if (typeof window !== 'undefined') {
      const savedVersion = localStorage.getItem('adGroupsVersion');
      if (savedVersion !== DATA_VERSION) {
        // 版本不匹配，清除旧数据
        localStorage.removeItem('adGroups');
        localStorage.setItem('adGroupsVersion', DATA_VERSION);
      } else {
        const saved = localStorage.getItem('adGroups');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            // 验证数据有效性：必须是数组且至少有一个默认分组
            if (Array.isArray(parsed) && parsed.length > 0 && parsed.some(g => g.priority === Infinity)) {
              return parsed;
            }
          } catch {
            // 解析失败，清除无效数据
            localStorage.removeItem('adGroups');
          }
        }
      }
    }
    // 使用默认数据并保存
    return MOCK_AD_GROUPS;
  };

  const [adGroups, setAdGroups] = useState<AdGroup[]>(() => getInitialGroups());
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const [collapsedDisabled, setCollapsedDisabled] = useState(true);
  const [selectedSubPositions, setSelectedSubPositions] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  
  // 广告位对应的子位选项
  const slotSubPositionOptions: Record<string, { value: string; label: string }[]> = {
    '1120': [
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
    ],
    '1601': [
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
      { value: '4', label: '4' },
    ],
    '1602': [
      { value: '1', label: '1' },
      { value: '2', label: '2' },
    ],
  };
  
  // 保存分组数据到 localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && adGroups.length > 0) {
      localStorage.setItem('adGroups', JSON.stringify(adGroups));
    }
  }, [adGroups]);

  // 默认选中第一个分组（priority 最小非 Infinity）
  useEffect(() => {
    if (adGroups.length > 0) {
      const firstGroup = adGroups
        .filter((g) => g.priority !== Infinity)
        .sort((a, b) => a.priority - b.priority)[0];
      if (firstGroup && !selectedGroupId) {
        setSelectedGroupId(firstGroup.id);
      }
    }
  }, [adGroups, selectedGroupId]);
  const [showAddSourceDialog, setShowAddSourceDialog] = useState(false);
  const [addSourceFromABTest, setAddSourceFromABTest] = useState(false);
  const [showAddGroupDialog, setShowAddGroupDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AdGroup | null>(null);
  const [showABTestDialog, setShowABTestDialog] = useState(false);
  const [hoveredSource, setHoveredSource] = useState<AdSource | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [editingPrice, setEditingPrice] = useState<{ id: string; value: string } | null>(null);

  // DSP选择器相关状态

  // 新建分组表单状态
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupPriority, setNewGroupPriority] = useState(0);
  const [newGroupSlots, setNewGroupSlots] = useState<string[]>([]);
  const [newGroupRules, setNewGroupRules] = useState<GroupRule[]>([]);

  // 同步editingGroup到表单
  useEffect(() => {
    if (editingGroup) {
      setNewGroupName(editingGroup.name);
      setNewGroupPriority(editingGroup.priority);
      setNewGroupSlots(editingGroup.adSlots || []);
      setNewGroupRules(editingGroup.rules || []);
    } else {
      setNewGroupName('');
      setNewGroupPriority(0);
      setNewGroupSlots(selectedSlot ? [selectedSlot] : []);
      setNewGroupRules([]);
    }
  }, [editingGroup, selectedSlot]);

  // 新建DSP来源表单状态
  const [newSourceName, setNewSourceName] = useState<string[]>([]);
  const [newSourcePlatform, setNewSourcePlatform] = useState<string[]>(['Android']);
  const [newSourcePid, setNewSourcePid] = useState('');
  const [newSourceCodeId, setNewSourceCodeId] = useState('');
  const [newSourcePrice, setNewSourcePrice] = useState('');
  const [newSourceStatus, setNewSourceStatus] = useState(true);
  const [newSourceSubPositions, setNewSourceSubPositions] = useState<string[]>([]);
  const [showDSPSelectorDrawer, setShowDSPSelectorDrawer] = useState(false);
  const [dspSearchLeft, setDspSearchLeft] = useState('');
  const [dspSearchRight, setDspSearchRight] = useState('');
  const [tempSelectedDSPSources, setTempSelectedDSPSources] = useState<string[]>([]);
  const [dspSearchKeyword, setDspSearchKeyword] = useState('');
  const [selectedDspSearchKeyword, setSelectedDspSearchKeyword] = useState('');
  
  // DSP选择器相关计算
  const filteredAvailableDSPSources = DSP_SOURCE_LIST.filter(
    (d: { value: string; label: string }) => !tempSelectedDSPSources.includes(d.value) && d.label.includes(dspSearchKeyword)
  );
  const filteredSelectedDSPSources = DSP_SOURCE_LIST.filter(
    (d: { value: string; label: string }) => tempSelectedDSPSources.includes(d.value) && d.label.includes(selectedDspSearchKeyword)
  );
  const handleToggleDSPSource = (value: string) => {
    setTempSelectedDSPSources((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };
  const handleAddAllDSPSources = () => {
    const newValues = filteredAvailableDSPSources.map((d: { value: string }) => d.value);
    setTempSelectedDSPSources((prev) => [...new Set([...prev, ...newValues])]);
  };
  const handleRemoveAllDSPSources = () => {
    setTempSelectedDSPSources([]);
  };
  const handleConfirmDSPSelection = () => {
    setNewSourceName(tempSelectedDSPSources);
    setShowDSPSelectorDrawer(false);
  };
  
  // 编辑DSP来源
  const [editingSource, setEditingSource] = useState<AdSource | null>(null);
  
  // 子位选项
  const subPositionOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  
  // 处理编辑DSP来源
  const handleEditSource = (source: AdSource) => {
    setEditingSource(source);
    // 填充表单数据
    // 如果有 dspSources 字段则使用，否则尝试从 name 中解析
    let dspSources = source.dspSources || [];
    if (dspSources.length === 0 && source.name) {
      // 尝试从 name 中匹配 DSP 来源
      const matchedSource = DSP_SOURCE_LIST.find((d: { value: string; label: string }) => d.label === source.name);
      if (matchedSource) {
        dspSources = [matchedSource.value];
      }
    }
    setNewSourceName(dspSources);
    setNewSourcePlatform(source.platforms && source.platforms.length > 0 ? source.platforms : ['Android']);
    setNewSourceCodeId(source.codeId || '');
    setNewSourcePrice(source.price.toString());
    setNewSourceStatus(source.status === 'enabled');
    setNewSourceSubPositions(source.subPositions || []);
    setShowAddSourceDialog(true);
  };
  
  // 重置DSP来源表单
  const resetSourceForm = () => {
    setNewSourceName([]);
    setNewSourcePlatform(['Android']);
    setNewSourceCodeId('');
    setNewSourcePrice('');
    setNewSourceStatus(true);
    setNewSourceSubPositions([]);
    setEditingSource(null);
  };

  // A/B测试表单状态
  const [abTestName, setAbTestName] = useState('');
  const [abTestGroupA, setAbTestGroupA] = useState('50');
  const [abTestGroupB, setAbTestGroupB] = useState('50');
  const [abTestCopyConfig, setAbTestCopyConfig] = useState<boolean>(true);
  const [abTestStep, setAbTestStep] = useState(1); // 1: 第一步, 2: 第二步
  const [abTestGroupSources, setAbTestGroupSources] = useState<{ groupA: AdSource[], groupB: AdSource[] }>({ groupA: [], groupB: [] });
  const [abTestSelectedGroup, setAbTestSelectedGroup] = useState<'A' | 'B'>('B');
  const [showAbTestAddSource, setAbTestAddSource] = useState(false);
  const [showABTestDataDialog, setShowABTestDataDialog] = useState(false);
  const [abTestDraftData, setAbTestDraftData] = useState<{
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
  } | null>(null);
  const [abTestConfig, setAbTestConfig] = useState<{
    testGroup: 'A' | 'B';
    flowRatio: string;
    enabledSources: AdSource[];
    disabledSources: AdSource[];
  }>({
    testGroup: 'B',
    flowRatio: '50',
    enabledSources: [],
    disabledSources: []
  });

  // 代码位管理状态
  const [codePositions, setCodePositions] = useState<CodePosition[]>(MOCK_CODE_POSITIONS);
  const [showAddCodeDialog, setShowAddCodeDialog] = useState(false);
  const [editingCodePosition, setEditingCodePosition] = useState<CodePosition | null>(null);
  const [newCodeForm, setNewCodeForm] = useState({
    platform: '',
    dspSource: '',
    scene: '',
    slot: '',
    name: '',
    codeId: '',
    priceMode: 'bidding' as 'bidding' | 'pricing',
    enabled: true,
  });

  // 代码位分页状态
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalCodeCount = codePositions.length;
  const totalPages = Math.ceil(totalCodeCount / pageSize);

  // 代码位分页数据
  const paginatedCodePositions = codePositions.slice(
    (currentPageNum - 1) * pageSize,
    currentPageNum * pageSize
  );

  // 切换代码位状态
  const toggleCodePositionStatus = useCallback((id: string) => {
    setCodePositions((prev) =>
      prev.map((cp) =>
        cp.id === id
          ? { ...cp, status: cp.status === 'enabled' ? 'disabled' : 'enabled' }
          : cp
      )
    );
  }, []);

  // 新增/编辑代码位
  const handleAddCodePosition = useCallback(() => {
    if (!newCodeForm.codeId.trim() || !newCodeForm.platform || !newCodeForm.scene || !newCodeForm.slot || !newCodeForm.name) return;
    const sceneItem = SCENE_ITEMS.find(s => s.value === newCodeForm.scene);
    const dspMap: Record<string, string> = {
      'pangolin': '穿山甲',
      'yqlh': '优量汇',
      'tobid': 'ToBid',
      'gdt': '广点通',
    };
    const slotMap: Record<string, string> = {
      '1000': '美柚--开屏',
      '2101': '美柚-首页-插屏',
      '2514': '爱爱记录-记录完成插屏',
      '1120': '首页大社区feeds流',
      '1601': '美柚-她她圈-帖子详情楼间广告',
      '1602': '美柚-她她圈-帖子详情信息流',
    };

    if (editingCodePosition) {
      // 编辑模式
      setCodePositions((prev) =>
        prev.map((cp) =>
          cp.id === editingCodePosition.id
            ? {
                ...cp,
                codeId: newCodeForm.codeId,
                name: newCodeForm.name,
                platform: newCodeForm.platform === 'ios' ? 'iOS' : 'Android',
                dspSource: dspMap[newCodeForm.dspSource] || newCodeForm.dspSource,
                scene: sceneItem?.label || newCodeForm.scene,
                slot: newCodeForm.slot,
                slotName: slotMap[newCodeForm.slot] || newCodeForm.slot,
                priceMode: newCodeForm.priceMode,
                status: newCodeForm.enabled ? 'enabled' : 'disabled',
              }
            : cp
        )
      );
    } else {
      // 新增模式
      const newCode: CodePosition = {
        id: `cp-${Date.now()}`,
        codeId: newCodeForm.codeId,
        name: newCodeForm.name,
        platform: newCodeForm.platform === 'ios' ? 'iOS' : 'Android',
        dspSource: dspMap[newCodeForm.dspSource] || newCodeForm.dspSource,
        scene: sceneItem?.label || newCodeForm.scene,
        slot: newCodeForm.slot,
        slotName: slotMap[newCodeForm.slot] || newCodeForm.slot,
        priceMode: newCodeForm.priceMode,
        status: newCodeForm.enabled ? 'enabled' : 'disabled',
      };
      setCodePositions((prev) => [...prev, newCode]);
    }

    setNewCodeForm({ platform: '', dspSource: '', scene: '', slot: '', name: '', codeId: '', priceMode: 'bidding', enabled: true });
    setEditingCodePosition(null);
    setShowAddCodeDialog(false);
  }, [newCodeForm, editingCodePosition]);

  // 根据广告场景+平台筛选分组
  const filteredAdGroups = adGroups.filter((group) => {
    // 按广告场景过滤：分组的广告位必须与当前场景的广告位有交集
    const sceneSlots = SCENE_SLOT_IDS[activeScene];
    const matchesScene = group.adSlots.some((slot) => sceneSlots.includes(slot));
    // 按平台过滤
    const matchesPlatform = selectedPlatform === 'all' || group.platforms.includes(selectedPlatform);
    return matchesScene && matchesPlatform;
  });

  // 当广告场景或平台切换时，自动选中筛选后第一个分组
  useEffect(() => {
    if (filteredAdGroups.length > 0) {
      const stillExists = filteredAdGroups.some((g) => g.id === selectedGroupId);
      if (!stillExists) {
        const firstGroup = filteredAdGroups
          .filter((g) => g.priority !== Infinity)
          .sort((a, b) => a.priority - b.priority)[0];
        setSelectedGroupId(firstGroup?.id || filteredAdGroups[0]?.id || '');
      }
    }
  }, [activeScene, selectedPlatform, filteredAdGroups, selectedGroupId]);

  // 获取当前选中的分组（从筛选后的分组中选）
  const currentGroup = filteredAdGroups.find((g) => g.id === selectedGroupId) || filteredAdGroups[0] || adGroups[0];
  const enabledSources = currentGroup?.adSources.filter((s) => s.status === 'enabled') || [];
  const disabledSources = currentGroup?.adSources.filter((s) => s.status === 'disabled') || [];

  // 汇总已启用DSP来源数据
  const summaryData = {
    revenuePerThousand: enabledSources.reduce((sum, s) => sum + (s.revenuePerThousand || 0), 0),
    estimatedRevenue: enabledSources.reduce((sum, s) => sum + (s.estimatedRevenue || 0), 0),
    ecpm: enabledSources.reduce((sum, s) => sum + (s.ecpm || 0), 0),
    revenuePerThousandRequests: enabledSources.reduce((sum, s) => sum + (s.revenuePerThousand || 0), 0),
    requests: enabledSources.reduce((sum, s) => sum + (s.requests || 0), 0),
    responseRate: enabledSources.length > 0 
      ? enabledSources.reduce((sum, s) => sum + (s.responseRate || 0), 0) / enabledSources.length 
      : 0,
    bidWins: enabledSources.reduce((sum, s) => sum + (s.bidWins || 0), 0),
    bidWinRate: enabledSources.length > 0 
      ? enabledSources.reduce((sum, s) => sum + (s.bidWinRate || 0), 0) / enabledSources.length 
      : 0,
    impressions: enabledSources.reduce((sum, s) => sum + (s.impressions || 0), 0),
    winImpressionRate: enabledSources.length > 0 
      ? enabledSources.reduce((sum, s) => sum + (s.winImpressionRate || 0), 0) / enabledSources.length 
      : 0,
    clicks: enabledSources.reduce((sum, s) => sum + (s.clicks || 0), 0),
    ctr: enabledSources.length > 0 
      ? enabledSources.reduce((sum, s) => sum + (s.ctr || 0), 0) / enabledSources.length 
      : 0,
    cpc: enabledSources.length > 0 
      ? enabledSources.reduce((sum, s) => sum + (s.cpc || 0), 0) / enabledSources.length 
      : 0,
  };

  // 当切换分组时，恢复A/B测试草稿数据
  useEffect(() => {
    if (currentGroup?.abTestDraftData) {
      setAbTestDraftData(currentGroup.abTestDraftData);
    }
  }, [currentGroup?.id]);

  // 全选状态
  const allSourceIds = currentGroup?.adSources.map((s) => s.id) || [];
  const isAllSelected = allSourceIds.length > 0 && selectedSources.size === allSourceIds.length;
  const isIndeterminate = selectedSources.size > 0 && selectedSources.size < allSourceIds.length;

  // 切换全选
  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedSources(new Set());
    } else {
      setSelectedSources(new Set(allSourceIds));
    }
  }, [isAllSelected, allSourceIds]);

  // 切换单个选择
  const toggleSelectSource = useCallback((id: string) => {
    setSelectedSources((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // 切换分组开关
  const toggleGroupStatus = useCallback((groupId: string) => {
    setAdGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, status: g.status === 'enabled' ? 'disabled' : 'enabled' }
          : g
      )
    );
  }, []);

  // 切换DSP来源开关
  const toggleSourceStatus = useCallback((sourceId: string) => {
    setAdGroups((prev) =>
      prev.map((g) => ({
        ...g,
        adSources: g.adSources.map((s) =>
          s.id === sourceId
            ? { ...s, status: s.status === 'enabled' ? 'disabled' : 'enabled' }
            : s
        ),
      }))
    );
  }, []);

  // 更新DSP来源价格
  const updateSourcePrice = useCallback((sourceId: string, price: number) => {
    setAdGroups((prev) =>
      prev.map((g) => ({
        ...g,
        adSources: g.adSources.map((s) =>
          s.id === sourceId ? { ...s, price } : s
        ),
      }))
    );
  }, []);


  const handleAddGroup = useCallback(() => {
    if (!newGroupName.trim()) return;
    if (newGroupSlots.length === 0) return;

    if (editingGroup) {
      // 编辑模式：更新现有分组
      setAdGroups((prev) =>
        prev.map((g) =>
          g.id === editingGroup.id ? { ...g, name: newGroupName, priority: newGroupPriority, adSlots: newGroupSlots, rules: newGroupRules } : g
        )
      );
      setEditingGroup(null);
    } else {
      // 新建模式
      const newGroup: AdGroup = {
        id: `group-${Date.now()}`,
        name: newGroupName,
        priority: newGroupPriority,
        platforms: ['Android', 'iOS'],
        adSlots: newGroupSlots,
        rules: newGroupRules,
        status: 'enabled',
        floorPrice: 0,
        adSources: [],
      };
      setAdGroups((prev) => [...prev, newGroup]);
      setSelectedGroupId(newGroup.id);
    }
    setNewGroupName('');
    setNewGroupPriority(0);
    setNewGroupSlots([]);
    setNewGroupRules([]);
    setShowAddGroupDialog(false);
  }, [newGroupName, newGroupPriority, newGroupSlots, newGroupRules, editingGroup]);

  // 添加PID
  const handleAddSource = useCallback(() => {
    if (!newSourceName || newSourceName.length === 0) return;
    if (newSourcePlatform.length === 0) return;
    if (!newSourceCodeId.trim()) return;
    
    if (editingSource) {
      // 编辑模式：更新现有DSP来源
      setAdGroups((prev) =>
        prev.map((g) => ({
          ...g,
          adSources: g.adSources.map((s) =>
            s.id === editingSource.id
              ? {
                  ...s,
                  dspSources: newSourceName,
                  status: newSourceStatus ? 'enabled' : 'disabled',
                  platforms: newSourcePlatform as ('Android' | 'iOS')[],
                  codeId: newSourceCodeId,
                  subPositions: newSourceSubPositions,
                  lastUpdated: new Date().toLocaleString('zh-CN'),
                }
              : s
          ),
        }))
      );
    } else {
      // 新增模式
      const newSource: AdSource = {
        id: `source-${Date.now()}`,
        name: newSourceName.length > 0 ? newSourceName.map(d => DSP_SOURCE_NAMES[d] || d).join(', ') : '',
        status: newSourceStatus ? 'enabled' : 'disabled',
        pricingType: 'bidding' as const,
        price: 0,
        estimatedRevenue: 0,
        ecpm: 0,
        thousandRequestValue: 0,
        requests: 0,
        responses: 0,
        responseRate: 0,
        bidWins: 0,
        bidWinRate: 0,
        lastUpdated: new Date().toLocaleString('zh-CN'),
        platforms: newSourcePlatform as ('Android' | 'iOS')[],
        codeId: newSourceCodeId,
        subPositions: newSourceSubPositions,
        dspSources: newSourceName,
      };
      
      if (addSourceFromABTest) {
        // 添加到A/B测试配置
        setAbTestConfig((prev) => ({
          ...prev,
          enabledSources: [...prev.enabledSources, newSource],
        }));
      } else {
        // 添加到分组
        setAdGroups((prev) =>
          prev.map((g) =>
            g.id === selectedGroupId
              ? { ...g, adSources: [...g.adSources, newSource] }
              : g
          )
        );
      }
    }
    
    // 重置表单
    resetSourceForm();
    setAddSourceFromABTest(false);
    setShowAddSourceDialog(false);
  }, [newSourceName, newSourcePlatform, newSourceCodeId, newSourceStatus, newSourceSubPositions, selectedGroupId, addSourceFromABTest, editingSource, resetSourceForm, setAdGroups, setAbTestConfig, setAddSourceFromABTest, setShowAddSourceDialog]);

  // 鼠标悬停显示详情
  const handleMouseEnterSource = useCallback((source: AdSource, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setHoverPosition({ x: rect.right + 10, y: rect.top });
    setHoveredSource(source);
  }, []);

  const handleMouseLeaveSource = useCallback(() => {
    setHoveredSource(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F2F5] flex">
      {/* 左侧导航 */}
      <aside className="w-56 bg-white border-r border-[#E5E6EB] flex flex-col">
        <div className="p-4 border-b border-[#E5E6EB]">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-[#1D2129]" />
            <h1 className="text-sm font-medium text-[#1D2129]">广告投放运营后台</h1>
          </div>
        </div>
        <nav className="flex-1 py-2">
          {/* 一级菜单列表 */}
          {[
            '广告交互管理',
            '品牌管理',
            '品牌小工具',
            '柚+管理',
            '女人通管理',
            '女人通消费管理',
            '女人通数据管理',
            '媒体数据管理',
            'DSP数据管理',
            'MARKETING API管理',
            '第三方DMP管理',
            '小工具',
            'ADX流量工具',
          ].map((item) => (
            <div key={item}>
              {item === 'ADX流量工具' ? (
                <>
                  {/* 可展开的一级菜单 */}
                  <button
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-[#2563EB]"
                  >
                    <div className="flex items-center gap-2">
                      <Layout className="w-4 h-4 text-[#4B5563]" />
                      <span>{item}</span>
                    </div>
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  {/* 二级菜单 */}
                  <div className="ml-4">
                    {/* 流量分组管理 - 选中状态 */}
                    <button
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm border-r-2 ${
                        currentPage === 'waterfall'
                          ? 'bg-[#FFF7FA] text-[#1D2129] border-[#FF4D88]'
                          : 'text-[#1D2129] border-transparent hover:bg-[#F9FAFB]'
                      }`}
                      onClick={() => setCurrentPage('waterfall')}
                    >
                      <span>流量分组管理</span>
                    </button>
                    {/* 代码位ID管理 - 暂时隐藏 */}
                    {/* <button
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm border-r-2 ${
                        currentPage === 'codePosition'
                          ? 'bg-[#FFF7FA] text-[#1D2129] border-[#FF4D88]'
                          : 'text-[#1D2129] border-transparent hover:bg-[#F9FAFB]'
                      }`}
                      onClick={() => setCurrentPage('codePosition')}
                    >
                      <span>代码位ID管理</span>
                    </button> */}
                  </div>
                </>
              ) : (
                <button
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#1D2129] hover:bg-[#F9FAFB]"
                >
                  <Layout className="w-4 h-4 text-[#4B5563]" />
                  <span>{item}</span>
                </button>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部面包屑 */}
        <header className="bg-white border-b border-[#E5E6EB] px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#86909C]">流量管理</span>
            <ChevronRightIcon className="w-4 h-4 text-[#C9CDD4]" />
            <span className={`font-medium ${currentPage === 'codePosition' ? 'text-[#1D2129]' : 'text-[#1D2129]'}`}>
              {currentPage === 'waterfall' ? '瀑布流管理' : '代码位ID管理'}
            </span>
          </div>
        </header>

        {/* 广告场景与平台筛选 */}
        <div className="bg-white border-b border-[#E5E6EB] px-6 py-3">
          <div className="flex items-center gap-4">
            {/* 广告场景 */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#86909C]">广告场景：</span>
              <Select value={activeScene} onValueChange={(value) => { setActiveScene(value as AdScene); setSelectedSlot(''); setSelectedSubPositions([]); }}>
                <SelectTrigger className="w-28 h-8 border-[#E5E6EB]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="splash">开屏</SelectItem>
                  <SelectItem value="interstitial">插屏</SelectItem>
                  <SelectItem value="feed">信息流</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* 平台筛选 */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#86909C]">平台：</span>
              <Select value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value as 'all' | 'Android' | 'iOS')}>
                <SelectTrigger className="w-28 h-8 border-[#E5E6EB]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部平台</SelectItem>
                  <SelectItem value="Android">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                      安卓
                    </div>
                  </SelectItem>
                  <SelectItem value="iOS">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                      iOS
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {currentPage === 'waterfall' ? (
          <React.Fragment>
          {/* 分组管理区 */}
          <div className="bg-white rounded-lg border border-[#E5E6EB] mb-6">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E6EB]">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#FF4D88] text-[#FF4D88] hover:bg-[#FFF7FA]"
                  onClick={() => setShowAddGroupDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加分组
                </Button>
              </div>

            </div>

            {/* 分组标签 - 按优先级排序，默认分组固定在最右 */}
            <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
              {filteredAdGroups
                .sort((a, b) => {
                  // 默认分组（Infinity）固定在最右
                  if (a.priority === Infinity) return 1;
                  if (b.priority === Infinity) return -1;
                  // 其他按优先级升序排列（数值越小优先级越高）
                  return a.priority - b.priority;
                })
                .map((group) => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`px-4 py-2 text-sm whitespace-nowrap transition-colors relative cursor-pointer flex items-center gap-1 ${
                      selectedGroupId === group.id
                        ? 'text-[#FF4D88]'
                        : 'text-[#1D2129] hover:text-[#86909C]'
                    }`}
                  >
                    {group.priority === Infinity ? '默认-' + group.name : `${group.priority}-${group.name}`}
                    {group.abTestStarted && (
                      <span className="px-1 py-0.5 text-[10px] font-bold bg-[#FF4D88] text-white rounded">
                        AB
                      </span>
                    )}
                    {selectedGroupId === group.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4D88]" />
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="ml-1 p-0.5 rounded hover:bg-[#F2F3F5]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" side="bottom" sideOffset={0}>
                        <DropdownMenuItem onClick={() => {
                          setEditingGroup(group);
                          setNewGroupName(group.name);
                          setNewGroupPriority(group.priority === Infinity ? 0 : group.priority);
                          setNewGroupRules([...group.rules]);
                          setShowAddGroupDialog(true);
                        }}>
                          编辑分组
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
            </div>

            {/* 当前选中分组的配置信息 */}
            {currentGroup && (
              <div className="px-4 py-3 border-t border-[#E5E6EB] bg-[#FAFBFC]">
                {/* 广告位和分组规则 */}
                <div className="flex items-start gap-6 mb-3">
                  {/* 广告位 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#1D2129]">广告位：</span>
                    <div className="flex flex-wrap gap-1">
                      {currentGroup.adSlots && currentGroup.adSlots.length > 0 ? (
                        currentGroup.adSlots.map((slotId, index) => {
                          const slotName = SLOT_NAME_MAP[slotId as keyof typeof SLOT_NAME_MAP] || slotId;
                          return (
                            <Badge key={index} variant="secondary" className="bg-[#E8F3FF] text-[#165DFF] border border-[#A5C8FF]">
                              {slotId} - {slotName}
                            </Badge>
                          );
                        })
                      ) : (
                        <span className="text-sm text-[#86909C]">暂无广告位</span>
                      )}
                    </div>
                  </div>

                  {/* 分组规则 */}
                  {currentGroup.rules && currentGroup.rules.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#1D2129]">分组规则：</span>
                      <div className="flex flex-wrap gap-1">
                        {currentGroup.rules.map((rule, index) => {
                          // 获取规则值的显示文本
                          const getDisplayValues = () => {
                            if (rule.ruleType === 'sub_position') {
                              // 子位规则：显示ID和名称
                              const allSubPositions = Object.values(SLOT_SUB_POSITIONS).flat();
                              return rule.values.map(val => {
                                const sp = allSubPositions.find(s => s.id === val);
                                return sp ? `${sp.id} - ${sp.name}` : val;
                              }).join('、');
                            }
                            return rule.values.join('、');
                          };
                          return (
                            <Badge key={index} variant="secondary" className="bg-[#F2F3F5] text-[#1D2129] border border-[#E5E6EB]">
                              {RULE_VALUES[rule.ruleType]?.label || rule.ruleType} {rule.matchType === 'include' ? '包含' : '不包含'} {getDisplayValues()}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 分组配置行 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {/* 分组开关 */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#1D2129]">分组开关</span>
                      <Switch
                        checked={currentGroup.status === 'enabled'}
                        onCheckedChange={() => toggleGroupStatus(currentGroup.id)}
                      />
                      {/* A/B测试配置入口 */}
                      {currentGroup.hasABTest && (
                        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-[#E5E6EB]">
                          <Select
                            value={abTestSelectedGroup}
                            onValueChange={(v) => setAbTestSelectedGroup(v as 'A' | 'B')}
                          >
                            <SelectTrigger className="w-[120px] h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">A 对照组</SelectItem>
                              <SelectItem value="B">B 测试组</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-[#86909C]">流量占比:</span>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={abTestSelectedGroup === 'A' ? abTestGroupA : abTestGroupB}
                              onChange={(e) => {
                                if (abTestSelectedGroup === 'A') {
                                  setAbTestGroupA(e.target.value);
                                } else {
                                  setAbTestGroupB(e.target.value);
                                }
                              }}
                              className="w-16 h-8 text-sm text-center"
                            />
                            <span className="text-sm text-[#86909C]">%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {currentGroup.hasABTest && !abTestDraftData && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-[#FF4D88] text-[#FF4D88] hover:bg-[#FFF7FA]"
                        onClick={() => setShowABTestDataDialog(true)}
                      >
                        查看A/B测试数据
                      </Button>
                    )}
                    {currentGroup.hasABTest && currentGroup.abTestDraftData && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-[#FF4D88] text-[#FF4D88] hover:bg-[#FFF7FA]"
                          onClick={() => setShowABTestDataDialog(true)}
                        >
                          查看A/B测试数据
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-[#FF4D88] text-[#FF4D88] hover:bg-[#FFF7FA]"
                          onClick={() => {
                            // 从草稿恢复数据
                            if (currentGroup.abTestDraftData) {
                              const draft = currentGroup.abTestDraftData;
                              setAbTestName(draft.name);
                              setAbTestGroupA(draft.groupA);
                              setAbTestGroupB(draft.groupB);
                              setAbTestCopyConfig(draft.copyConfig);
                              setAbTestConfig(draft.config);
                              setAbTestDraftData(draft);
                            }
                            setShowABTestDialog(true);
                          }}
                        >
                          编辑A/B测试
                        </Button>
                      </>
                    )}
                    {!currentGroup.hasABTest && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-[#FF4D88] text-[#FF4D88] hover:bg-[#FFF7FA]"
                        onClick={() => {
                          if (currentGroup) {
                            const now = new Date();
                            const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
                            setAbTestName(`${currentGroup.name}_正式_测试_${timeStr}`);
                          }
                          setShowABTestDialog(true);
                        }}
                      >
                        创建A/B测试
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DSP来源管理区 */}
          <div className="bg-white rounded-lg border border-[#E5E6EB]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E6EB]">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#FF4D88] text-[#FF4D88] hover:bg-[#FFF7FA]"
                  onClick={() => setShowAddSourceDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加PID
                </Button>
              </div>
            </div>

            {/* 已启用DSP来源 */}
            <div className="p-4">
              <SourceTable
                sources={enabledSources}
                summaryData={summaryData}
                selectedSources={selectedSources}
                isAllSelected={isAllSelected}
                isIndeterminate={isIndeterminate}
                onToggleSelectAll={toggleSelectAll}
                onToggleSelect={toggleSelectSource}
                onToggleStatus={toggleSourceStatus}
                onUpdatePrice={updateSourcePrice}
                onMouseEnter={handleMouseEnterSource}
                onMouseLeave={handleMouseLeaveSource}
                onEditSource={handleEditSource}
              />
            </div>

            {/* 未启用DSP来源折叠区 */}
            {disabledSources.length > 0 && (
              <div className="border-t border-[#E5E6EB]">
                <button
                  onClick={() => setCollapsedDisabled(!collapsedDisabled)}
                  className="flex items-center gap-2 px-4 py-3 w-full hover:bg-[#F7F8FA] transition-colors"
                >
                  {collapsedDisabled ? (
                    <ChevronRight className="w-4 h-4 text-[#86909C]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#86909C]" />
                  )}
                  <span className="text-sm text-[#86909C]">
                    {disabledSources.length} 个DSP来源未启用
                  </span>
                </button>
                {!collapsedDisabled && (
                  <div className="p-4 pt-0">
                    <SourceTable
                      sources={disabledSources}
                      selectedSources={selectedSources}
                      isAllSelected={false}
                      isIndeterminate={false}
                      onToggleSelectAll={() => {}}
                      onToggleSelect={toggleSelectSource}
                      onToggleStatus={toggleSourceStatus}
                      onUpdatePrice={updateSourcePrice}
                      onMouseEnter={handleMouseEnterSource}
                      onMouseLeave={handleMouseLeaveSource}
                      onEditSource={handleEditSource}
                    />
                  </div>
                )}
              </div>
            )}

          </div>

          </React.Fragment>
          ) : (
          /* ==================== 代码位ID管理页面 ==================== */
          <React.Fragment>
            {/* 获取代码位绑定的分组 */}
            {(() => {
              const getBoundGroups = (codeId: string) => {
                return adGroups.filter(group => 
                  group.adSlots.some(slot => slot.includes(codeId))
                );
              };
              return null;
            })()}
            
            {/* 页面标题 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#1D2129]">代码位列表</h2>
              <Button
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                onClick={() => setShowAddCodeDialog(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                新增代码位
              </Button>
            </div>

            {/* 代码位数据表格 */}
            <div className="bg-white rounded-lg border border-[#E5E6EB]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F7F8FA]">
                    <TableHead className="text-[#86909C] font-medium">代码位ID</TableHead>
                    <TableHead className="text-[#86909C] font-medium">名称</TableHead>
                    <TableHead className="text-[#86909C] font-medium">状态</TableHead>
                    <TableHead className="text-[#86909C] font-medium">系统平台</TableHead>
                    <TableHead className="text-[#86909C] font-medium">广告场景</TableHead>
                    <TableHead className="text-[#86909C] font-medium">广告位</TableHead>
                    <TableHead className="text-[#86909C] font-medium">绑定分组信息</TableHead>
                    <TableHead className="text-[#86909C] font-medium">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCodePositions.map((code) => (
                    <TableRow key={code.id} className="hover:bg-[#F9FAFB]">
                      <TableCell className="text-[#1D2129]">{code.codeId}</TableCell>
                      <TableCell className="text-[#1D2129]">{code.name}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          code.status === 'enabled'
                            ? 'bg-[#E8F5E9] text-[#2E7D32]'
                            : 'bg-[#FFEBEE] text-[#C62828]'
                        }`}>
                          {code.status === 'enabled' ? '开启' : '停用'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          code.platform === 'Android'
                            ? 'bg-[#EFF6FF] text-[#2563EB]'
                            : 'bg-[#F5F3FF] text-[#7C3AED]'
                        }`}>
                          {code.platform === 'Android' ? '安卓' : 'iOS'}
                        </span>
                      </TableCell>
                      <TableCell className="text-[#1D2129]">{code.scene}</TableCell>
                      <TableCell className="text-[#1D2129]">{code.slotName}</TableCell>
                      <TableCell className="text-[#1D2129]">
                        {(() => {
                          const boundGroups = adGroups.filter(group => 
                            group.adSlots.includes(code.codeId)
                          );
                          if (boundGroups.length === 0) {
                            return <span className="text-[#86909C]">-</span>;
                          }
                          return (
                            <div className="flex flex-wrap gap-1">
                              {boundGroups.map((group, index) => (
                                <span key={group.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-[#FFF7ED] text-[#EA580C]">
                                  {group.priority === Infinity ? '默认' : `${group.priority} - ${group.name}`}
                                </span>
                              ))}
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setEditingCodePosition(code);
                              // 填充表单数据
                              const platformMap: Record<string, string> = {
                                'Android': 'android',
                                'iOS': 'ios',
                              };
                              const slotValueMap: Record<string, string> = {
                                '美柚--开屏': '1000',
                                '美柚-首页-插屏': '2101',
                                '爱爱记录-记录完成插屏': '2514',
                                '首页大社区feeds流': '1120',
                                '美柚-她她圈-帖子详情楼间广告': '1601',
                                '美柚-她她圈-帖子详情信息流': '1602',
                              };
                              const dspValueMap: Record<string, string> = {
                                '穿山甲': 'pangolin',
                                '优量汇': 'yqlh',
                                'ToBid': 'tobid',
                                '广点通': 'gdt',
                              };
                              const sceneMap: Record<string, string> = {
                                '开屏': 'splash',
                                'Banner': 'banner',
                                '插屏': 'interstitial',
                                '信息流': 'feed',
                                '原生': 'native',
                              };
                              setNewCodeForm({
                                platform: platformMap[code.platform] || 'android',
                                dspSource: dspValueMap[code.dspSource] || 'pangolin',
                                scene: sceneMap[code.scene] || 'feed',
                                slot: slotValueMap[code.slotName] || '',
                                name: code.name,
                                codeId: code.codeId,
                                priceMode: code.priceMode,
                                enabled: code.status === 'enabled',
                              });
                              setShowAddCodeDialog(true);
                            }}
                            className="text-[#1890FF] hover:text-[#40A9FF] text-sm"
                          >
                            编辑
                          </button>
                          {code.status === 'enabled' ? (
                            <button
                              onClick={() => toggleCodePositionStatus(code.id)}
                              className="text-[#EF4444] hover:text-[#DC2626] text-sm"
                            >
                              停用
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleCodePositionStatus(code.id)}
                              className="text-[#1890FF] hover:text-[#40A9FF] text-sm"
                            >
                              启用
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 底部分页 */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E6EB]">
                <span className="text-sm text-[#86909C]">共{totalCodeCount}条</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPageNum(1)}
                    disabled={currentPageNum === 1}
                    className={`p-1.5 rounded hover:bg-[#F3F4F6] ${currentPageNum === 1 ? 'text-[#D1D5DB] cursor-not-allowed' : 'text-[#4B5563]'}`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPageNum(Math.max(1, currentPageNum - 1))}
                    disabled={currentPageNum === 1}
                    className={`p-1.5 rounded hover:bg-[#F3F4F6] ${currentPageNum === 1 ? 'text-[#D1D5DB] cursor-not-allowed' : 'text-[#4B5563]'}`}
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 bg-[#2563EB] text-white text-sm rounded">{currentPageNum}</span>
                  <button
                    onClick={() => setCurrentPageNum(Math.min(totalPages, currentPageNum + 1))}
                    disabled={currentPageNum === totalPages}
                    className={`p-1.5 rounded hover:bg-[#F3F4F6] ${currentPageNum === totalPages ? 'text-[#D1D5DB] cursor-not-allowed' : 'text-[#4B5563]'}`}
                  >
                    <ChevronRightIcon className="w-4 h-4 rotate-180" />
                  </button>
                  <button
                    onClick={() => setCurrentPageNum(totalPages)}
                    disabled={currentPageNum === totalPages}
                    className={`p-1.5 rounded hover:bg-[#F3F4F6] ${currentPageNum === totalPages ? 'text-[#D1D5DB] cursor-not-allowed' : 'text-[#4B5563]'}`}
                  >
                    <ChevronLast className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-[#86909C] ml-2">
                    <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPageNum(1); }}>
                      <SelectTrigger className="w-20 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 / page</SelectItem>
                        <SelectItem value="20">20 / page</SelectItem>
                        <SelectItem value="50">50 / page</SelectItem>
                      </SelectContent>
                    </Select>
                  </span>
                </div>
              </div>
            </div>
          </React.Fragment>
          )}
        </div>
      </main>

      {/* 悬停详情卡片 */}
      {hoveredSource && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-[#E5E6EB] p-4 w-64"
          style={{ left: hoverPosition.x, top: hoverPosition.y }}
        >
          <h4 className="font-medium text-[#1D2129] mb-3">{hoveredSource.name}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#86909C]">定价方式</span>
              <span className="text-[#1D2129]">{hoveredSource.pricingType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#86909C]">价格</span>
              <span className="text-[#1D2129]">¥{hoveredSource.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#86909C]">eCPM</span>
              <span className="text-[#1D2129]">¥{hoveredSource.ecpm.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#86909C]">请求量</span>
              <span className="text-[#1D2129]">{hoveredSource.requests.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#86909C]">返回量</span>
              <span className="text-[#1D2129]">{hoveredSource.responses.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* 添加/编辑分组弹窗 */}
      <Dialog open={showAddGroupDialog} onOpenChange={(open) => {
        setShowAddGroupDialog(open);
        if (!open) {
          setEditingGroup(null);
          setNewGroupName('');
          setNewGroupRules([]);
        }
      }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingGroup ? '编辑分组' : '添加分组'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* 分组名称 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">分组名称</label>
              <div className="flex-1 relative">
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value.slice(0, 20))}
                  placeholder="请输入分组名称"
                  className="pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#86909C]">
                  {newGroupName.length}/20
                </span>
              </div>
            </div>

            {/* 优先级 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">
                <span className="text-red-500">*</span> 优先级
              </label>
              <Input
                type="number"
                value={newGroupPriority}
                onChange={(e) => setNewGroupPriority(parseInt(e.target.value) || 0)}
                placeholder="数值越小优先级越高"
                className="w-48"
                min={0}
              />
              <span className="ml-2 text-xs text-[#86909C]">数值越小优先级越高</span>
            </div>

            {/* 广告场景 - 只读 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">广告场景</label>
              <span className="text-sm text-[#86909C] bg-[#F5F5F5] px-3 py-1.5 rounded">
                {SCENE_ITEMS.find(s => s.value === activeScene)?.label || '-'}
              </span>
            </div>

            {/* 广告位 - 多选 */}
            <div className="flex items-start">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0 pt-1.5">
                <span className="text-red-500">*</span> 广告位
              </label>
              <div className="flex-1">
                <MultipleSelect
                  value={newGroupSlots}
                  onChange={setNewGroupSlots}
                  options={getSlotOptionsByScene(activeScene)}
                  placeholder="请选择广告位"
                  triggerClassName="w-full"
                />
              </div>
            </div>

            {/* 分组规则 */}
            <div className="border-t border-[#E5E6EB] pt-4">
              <div className="text-sm font-medium text-[#FF4D88] mb-3">分组规则</div>

              {/* 添加规则按钮 */}
              {newGroupRules.length === 0 && (
                <Button
                  variant="outline"
                  className="border-dashed border-[#FF4D88] text-[#FF4D88] hover:bg-[#FFF5F8]"
                  onClick={() => {
                    setNewGroupRules([{ ruleType: 'identity', matchType: 'include', values: [] }]);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加规则
                </Button>
              )}

              {newGroupRules.length > 0 && (
                <div className="space-y-3">
                  {newGroupRules.map((rule, index) => (
                    <div key={rule.ruleType} className="flex items-start gap-2">
                      <Select
                        value={rule.ruleType}
                        onValueChange={(val: RuleType) => {
                          const updated = [...newGroupRules];
                          updated[index].ruleType = val;
                          updated[index].values = [];
                          setNewGroupRules(updated);
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(RULE_VALUES) as RuleType[]).map((ruleType) => (
                            <SelectItem key={ruleType} value={ruleType}>
                              {RULE_VALUES[ruleType].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={rule.matchType}
                        onValueChange={(val: MatchType) => {
                          const updated = [...newGroupRules];
                          updated[index].matchType = val;
                          setNewGroupRules(updated);
                        }}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="include">包含</SelectItem>
                          <SelectItem value="exclude">不包含</SelectItem>
                        </SelectContent>
                      </Select>
                      <MultipleSelect
                        value={rule.values}
                        onChange={(values) => {
                          const updated = [...newGroupRules];
                          updated[index].values = values;
                          setNewGroupRules(updated);
                        }}
                        options={
                          rule.ruleType === 'sub_position'
                            ? (() => {
                                // 根据选择的广告位获取子位
                                const subPositionOptions = newGroupSlots.flatMap(slotId => 
                                  (SLOT_SUB_POSITIONS[slotId] || []).map(sp => ({
                                    label: `${sp.id} - ${sp.name}`,
                                    value: sp.id,
                                  }))
                                );
                                // 如果没有选择广告位或没有子位配置，使用默认值
                                if (subPositionOptions.length === 0) {
                                  return RULE_VALUES[rule.ruleType]?.values?.map((val) => ({ label: val, value: val })) || [];
                                }
                                return subPositionOptions;
                              })()
                            : RULE_VALUES[rule.ruleType]?.values?.map((val) => ({ label: val, value: val })) || []
                        }
                        placeholder={`请选择${RULE_VALUES[rule.ruleType]?.label || ''}`}
                        triggerClassName="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-[#86909C] hover:text-[#FF4D88]"
                        onClick={() => {
                          setNewGroupRules(newGroupRules.filter((_, i) => i !== index));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {/* 继续添加规则按钮 */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-dashed border-[#FF4D88] text-[#FF4D88] hover:bg-[#FFF5F8] w-full"
                    onClick={() => {
                      setNewGroupRules([...newGroupRules, { ruleType: 'identity', matchType: 'include', values: [] }]);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    添加规则
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddGroupDialog(false)}>
              取消
            </Button>
            <Button
              className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white"
              onClick={handleAddGroup}
            >
              提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* A/B测试弹窗 */}
      <Dialog open={showABTestDialog} onOpenChange={setShowABTestDialog}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">{abTestDraftData ? '编辑 A/B 测试' : '创建 A/B 测试'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            {/* 分组名称信息 */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#86909C]">分组名称:</span>
              <span className="text-[#FF4D88] font-medium">{currentGroup?.name || '分组测试1'}</span>
            </div>

            {/* 测试名称 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">
                <span className="text-red-500">*</span> 测试名称
              </label>
              <div className="flex-1 relative">
                <Input
                  value={abTestName}
                  onChange={(e) => setAbTestName(e.target.value)}
                  placeholder="请输入测试名称"
                  className="pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#86909C]">
                  {abTestName.length} / 100
                </span>
              </div>
            </div>

            {/* 流量比例 */}
            <div className="flex items-start">
              <label className="w-24 text-sm font-medium text-[#1D2129] pt-1 shrink-0">
                <span className="text-red-500">*</span> 流量比例
              </label>
              <div className="flex-1 flex items-center gap-6">
                {/* A组 */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#52C41A] flex items-center justify-center text-white text-xs font-bold">A</div>
                  <span className="text-sm text-[#1D2129]">对照组</span>
                  <div className="relative w-20">
                    <Input
                      type="number"
                      value={abTestGroupA}
                      onChange={(e) => setAbTestGroupA(e.target.value)}
                      className="pr-8 text-center"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#86909C]">%</span>
                  </div>
                </div>
                {/* B组 */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#FA8C16] flex items-center justify-center text-white text-xs font-bold">B</div>
                  <span className="text-sm text-[#1D2129]">测试组</span>
                  <div className="relative w-20">
                    <Input
                      type="number"
                      value={abTestGroupB}
                      onChange={(e) => setAbTestGroupB(e.target.value)}
                      className="pr-8 text-center"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#86909C]">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 配置复制选项 */}
            <div className="flex items-center pl-24">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id="copyConfig"
                  checked={abTestCopyConfig}
                  onCheckedChange={(checked) => setAbTestCopyConfig(checked === true)}
                  className="border-[#E5E6EB] data-[state=checked]:bg-[#FF4D88] data-[state=checked]:border-[#FF4D88]"
                />
                <span className="text-sm text-[#1D2129]">将 A 组瀑布流配置复制给 B 组</span>
              </label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowABTestDialog(false)}
              className="border-[#E5E6EB] text-[#1D2129]"
            >
              取消
            </Button>
            <Button
              className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white"
              onClick={() => setAbTestStep(2)}
            >
              下一步
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新增/编辑代码位弹窗 */}
      <Dialog open={showAddCodeDialog} onOpenChange={(open) => {
        setShowAddCodeDialog(open);
        if (!open) {
          setEditingCodePosition(null);
          setNewCodeForm({
            platform: '',
            dspSource: '',
            scene: '',
            slot: '',
            name: '',
            codeId: '',
            priceMode: 'bidding',
            enabled: true,
          });
        }
      }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editingCodePosition ? '编辑代码位' : '新增代码位'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* 代码位ID */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">
                <span className="text-red-500">*</span> 代码位ID
              </label>
              <Input
                value={newCodeForm.codeId}
                onChange={(e) => setNewCodeForm({ ...newCodeForm, codeId: e.target.value })}
                placeholder="请输入代码位ID"
                className="flex-1"
              />
            </div>

            {/* 名称 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">
                <span className="text-red-500">*</span> 名称
              </label>
              <div className="flex-1 relative">
                <Input
                  value={newCodeForm.name}
                  onChange={(e) => setNewCodeForm({ ...newCodeForm, name: e.target.value.slice(0, 30) })}
                  placeholder="请输入名称"
                  className="pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#86909C]">
                  {newCodeForm.name.length} / 30
                </span>
              </div>
            </div>

            {/* 系统平台 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">
                <span className="text-red-500">*</span> 系统平台
              </label>
              <Select
                value={newCodeForm.platform}
                onValueChange={(v) => setNewCodeForm({ ...newCodeForm, platform: v })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="请选择系统平台" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="android">Android</SelectItem>
                  <SelectItem value="ios">iOS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* DSP来源 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">
                <span className="text-red-500">*</span> DSP来源
              </label>
              <Select
                value={newCodeForm.dspSource}
                onValueChange={(v) => setNewCodeForm({ ...newCodeForm, dspSource: v })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="请选择DSP来源" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pangolin">穿山甲</SelectItem>
                  <SelectItem value="yqlh">优量汇</SelectItem>
                  <SelectItem value="tobid">ToBid</SelectItem>
                  <SelectItem value="gdt">广点通</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 广告场景 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">
                <span className="text-red-500">*</span> 广告场景
              </label>
              <Select
                value={newCodeForm.scene}
                onValueChange={(v) => setNewCodeForm({ ...newCodeForm, scene: v })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="请选择广告场景" />
                </SelectTrigger>
                <SelectContent>
                  {SCENE_ITEMS.map((scene) => (
                    <SelectItem key={scene.value} value={scene.value}>
                      {scene.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 广告位 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">
                <span className="text-red-500">*</span> 广告位
              </label>
              <Select
                value={newCodeForm.slot}
                onValueChange={(v) => setNewCodeForm({ ...newCodeForm, slot: v })}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="请选择广告位" />
                </SelectTrigger>
                <SelectContent>
                  {newCodeForm.scene === 'feed' ? (
                    <>
                      <SelectItem value="1120">首页大社区feeds流</SelectItem>
                      <SelectItem value="1601">美柚-她她圈-帖子详情楼间广告</SelectItem>
                      <SelectItem value="1602">美柚-她她圈-帖子详情信息流</SelectItem>
                    </>
                  ) : newCodeForm.scene === 'interstitial' ? (
                    <>
                      <SelectItem value="2101">美柚-首页-插屏</SelectItem>
                      <SelectItem value="2514">爱爱记录-记录完成插屏</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="1000">美柚--开屏</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* 价格模式 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">
                <span className="text-red-500">*</span> 价格模式
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      newCodeForm.priceMode === 'bidding'
                        ? 'border-[#2563EB] bg-[#2563EB]'
                        : 'border-[#86909C]'
                    }`}
                    onClick={() => setNewCodeForm({ ...newCodeForm, priceMode: 'bidding' })}
                  >
                    {newCodeForm.priceMode === 'bidding' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm text-[#1D2129]">竞价</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      newCodeForm.priceMode === 'pricing'
                        ? 'border-[#2563EB] bg-[#2563EB]'
                        : 'border-[#86909C]'
                    }`}
                    onClick={() => setNewCodeForm({ ...newCodeForm, priceMode: 'pricing' })}
                  >
                    {newCodeForm.priceMode === 'pricing' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm text-[#1D2129]">定价</span>
                </label>
              </div>
            </div>

            {/* 状态 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">
                状态
              </label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newCodeForm.enabled}
                  onCheckedChange={(checked) => setNewCodeForm({ ...newCodeForm, enabled: checked })}
                />
                <span className="text-sm text-[#1D2129]">{newCodeForm.enabled ? '启用' : '禁用'}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCodeDialog(false)}>
              取消
            </Button>
            <Button
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              onClick={handleAddCodePosition}
            >
              提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加PID弹窗 */}
      <Dialog open={showAddSourceDialog} onOpenChange={setShowAddSourceDialog}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editingSource ? '编辑DSP来源' : '添加PID'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* DSP来源名称 */}
            <div className="flex items-start">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0 pt-2"><span className="text-red-500">*</span> DSP来源</label>
              <div className="flex-1">
                <Button
                  variant="outline"
                  onClick={() => setShowDSPSelectorDrawer(true)}
                  className="min-h-[36px] h-auto flex-wrap justify-start gap-2"
                >
                  {newSourceName && newSourceName.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {newSourceName.map((name) => (
                        <span key={name} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FEF3F7] text-[#FF4D88] rounded text-xs">
                          {DSP_SOURCE_NAMES[name] || name}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewSourceName(newSourceName.filter((n) => n !== name));
                            }}
                          />
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[#86909C]">请选择DSP来源</span>
                  )}
                </Button>
                <p className="text-xs text-[#86909C] mt-1">点击选择DSP来源，最多支持选择多个</p>
              </div>
            </div>

            {/* 广告场景 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">广告场景</label>
              <span className="text-sm text-[#1D2129]">{activeScene === 'splash' ? '开屏' : activeScene === 'interstitial' ? '插屏' : '信息流'}</span>
            </div>

            {/* 广告位 - 根据分组广告位带入，不可编辑 */}
            <div className="flex items-start">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0 pt-2">广告位</label>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {currentGroup?.adSlots && currentGroup.adSlots.length > 0 ? (
                    currentGroup.adSlots.map((slotId) => {
                      const slotName = SLOT_NAME_MAP[slotId] || slotId;
                      return (
                        <span key={slotId} className="inline-flex items-center px-2.5 py-1 bg-[#F2F3F5] text-[#4E5969] rounded text-sm">
                          {slotId} - {slotName}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-[#86909C] text-sm">当前分组未配置广告位</span>
                  )}
                </div>
                <p className="text-xs text-[#86909C] mt-1">广告位根据分组配置自动带入</p>
              </div>
            </div>

            {/* 广告代码位ID - 必填，手动输入 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0"><span className="text-red-500">*</span> 广告代码位ID</label>
              <Input
                value={newSourceCodeId}
                onChange={(e) => setNewSourceCodeId(e.target.value)}
                placeholder="请输入广告代码位ID"
                className="w-64"
              />
            </div>

            {/* 状态 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">状态</label>
              <Switch checked={newSourceStatus} onCheckedChange={setNewSourceStatus} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddSourceDialog(false); resetSourceForm(); }}>
              取消
            </Button>
            <Button
              className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white"
              onClick={handleAddSource}
            >
              {editingSource ? '保存' : '提交'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DSP来源选择器抽屉 */}
      <Drawer open={showDSPSelectorDrawer} onOpenChange={setShowDSPSelectorDrawer}>
        <DrawerContent className="h-[70vh]">
          <div className="px-6 py-4 border-b border-[#E5E6EB]">
            <span className="text-base font-semibold">选择DSP来源</span>
          </div>
          <div className="flex h-[calc(100%-120px)]">
            {/* 左侧可选DSP来源列表 */}
            <div className="flex-1 border-r border-[#E5E6EB] p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#1D2129]">待选DSP来源</span>
                <Button variant="ghost" size="sm" className="text-[#86909C] hover:text-[#FF4D88]" onClick={() => setTempSelectedDSPSources(DSP_SOURCE_LIST.map((d: { value: string }) => d.value))}>
                  全选
                </Button>
              </div>
              <Input
                placeholder="搜索DSP来源"
                value={dspSearchKeyword}
                onChange={(e) => setDspSearchKeyword(e.target.value)}
                className="mb-3"
              />
              <div className="flex-1 overflow-y-auto space-y-1">
                {filteredAvailableDSPSources.map((dsp: { value: string; label: string }) => (
                  <div
                    key={dsp.value}
                    className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors ${
                      tempSelectedDSPSources.includes(dsp.value)
                        ? 'bg-[#FFF0F3]'
                        : 'hover:bg-[#F7F8FA]'
                    }`}
                    onClick={() => handleToggleDSPSource(dsp.value)}
                  >
                    <Checkbox checked={tempSelectedDSPSources.includes(dsp.value)} />
                    <span className="text-sm">{dsp.label}</span>
                  </div>
                ))}
                {filteredAvailableDSPSources.length === 0 && (
                  <div className="text-center text-[#86909C] text-sm py-8">暂无数据</div>
                )}
              </div>
            </div>

            {/* 中间操作按钮 */}
            <div className="flex flex-col items-center justify-center gap-2 px-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddAllDSPSources}
                disabled={filteredAvailableDSPSources.length === 0}
                className="text-[#86909C] hover:text-[#FF4D88]"
              >
                <ArrowRightIcon className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveAllDSPSources}
                disabled={tempSelectedDSPSources.length === 0}
                className="text-[#86909C] hover:text-[#FF4D88]"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Button>
            </div>

            {/* 右侧已选DSP来源列表 */}
            <div className="flex-1 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#1D2129]">已选DSP来源（{tempSelectedDSPSources.length}项）</span>
                <Button variant="ghost" size="sm" className="text-[#86909C] hover:text-[#FF4D88]" onClick={() => setTempSelectedDSPSources([])}>
                  清空
                </Button>
              </div>
              <Input
                placeholder="搜索已选DSP来源"
                value={selectedDspSearchKeyword}
                onChange={(e) => setSelectedDspSearchKeyword(e.target.value)}
                className="mb-3"
              />
              <div className="flex-1 overflow-y-auto space-y-1">
                {filteredSelectedDSPSources.map((dsp: { value: string; label: string }) => (
                  <div
                    key={dsp.value}
                    className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer bg-[#FFF0F3] hover:bg-[#FFE5EB]"
                    onClick={() => handleToggleDSPSource(dsp.value)}
                  >
                    <Checkbox checked={true} />
                    <span className="text-sm">{dsp.label}</span>
                  </div>
                ))}
                {tempSelectedDSPSources.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-[#86909C]">
                    <Package className="w-10 h-10 mb-2 opacity-50" />
                    <span className="text-sm">暂无数据</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-[#E5E6EB] flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDSPSelectorDrawer(false)}>取消</Button>
            <Button className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white" onClick={handleConfirmDSPSelection}>确定</Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* 配置测试组瀑布流弹窗 */}
      <Dialog open={abTestStep === 2} onOpenChange={(open) => { if (!open) setAbTestStep(0); }}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">配置测试组瀑布流</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4">
            {/* 测试组选择和流量比例 */}
            <div className="flex items-center gap-6 p-3 bg-[#F7F8FA] rounded-lg">
              <div className="flex items-center gap-2">
                <label className="text-sm text-[#86909C]">测试组</label>
                <Select value={abTestConfig.testGroup} onValueChange={(v) => setAbTestConfig(prev => ({ ...prev, testGroup: v as 'A' | 'B' }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A 测试组</SelectItem>
                    <SelectItem value="B">B 测试组</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="text-sm text-[#86909C]">流量比例: {abTestConfig.flowRatio}%</span>
            </div>

            {/* 添加PID按钮 */}
            <Button className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white" onClick={() => { setAddSourceFromABTest(true); setShowAddSourceDialog(true); }}>
              <Plus className="w-4 h-4 mr-1" />
              添加PID
            </Button>

            {/* 已启用的DSP来源 */}
            <div>
              <div className="text-sm font-medium text-[#86909C] mb-2">已启用DSP来源</div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F7F8FA]">
                    <TableHead className="w-16">优先级</TableHead>
                    <TableHead>DSP来源</TableHead>
                    <TableHead className="w-20">状态</TableHead>
                    <TableHead className="w-24">定价方式</TableHead>
                    <TableHead>价格</TableHead>
                    <TableHead className="w-24">千人均收益</TableHead>
                    <TableHead className="w-28">预估收入</TableHead>
                    <TableHead className="w-20">eCPM</TableHead>
                    <TableHead className="w-28">千次请求价值</TableHead>
                    <TableHead className="w-24">请求量</TableHead>
                    <TableHead className="w-20">返回率</TableHead>
                    <TableHead className="w-24">竞价成功数</TableHead>
                    <TableHead className="w-24">竞价成功率</TableHead>
                    <TableHead className="w-24">展示量</TableHead>
                    <TableHead className="w-24">竞胜展示率</TableHead>
                    <TableHead className="w-20">点击数</TableHead>
                    <TableHead className="w-20">点击率</TableHead>
                    <TableHead className="w-20">cpc</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {abTestConfig.enabledSources.map((source, index) => (
                    <TableRow key={source.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <span className="text-[#1D2129]">{source.name}</span>
                        <span className="ml-2 text-xs px-2 py-0.5 bg-[#F2F3F5] text-[#86909C] rounded">原生</span>
                      </TableCell>
                      <TableCell>
                        <Switch checked={source.status === 'enabled'} onCheckedChange={(checked) => {
                          const newSources = [...abTestConfig.enabledSources];
                          newSources[index].status = checked ? 'enabled' : 'disabled';
                          setAbTestConfig(prev => ({ ...prev, enabledSources: newSources }));
                        }} />
                      </TableCell>
                      <TableCell>
                        {source.pricingType === 'bidding' ? (
                          <span className="text-[#86909C]">-</span>
                        ) : (
                          <Input
                            type="number"
                            value={source.price || ''}
                            onChange={(e) => {
                              const newSources = [...abTestConfig.enabledSources];
                              newSources[index].price = parseFloat(e.target.value) || 0;
                              setAbTestConfig(prev => ({ ...prev, enabledSources: newSources }));
                            }}
                            className="w-24 h-8 text-sm"
                            placeholder="输入价格"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {abTestConfig.enabledSources.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-[#86909C] py-4">
                        暂无已启用DSP来源
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* 未启用的DSP来源 */}
            <div>
              <div className="text-sm font-medium text-[#86909C] mb-2">未启用DSP来源</div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F7F8FA]">
                    <TableHead className="w-16">优先级</TableHead>
                    <TableHead>DSP来源</TableHead>
                    <TableHead className="w-20">状态</TableHead>
                    <TableHead className="w-24">定价方式</TableHead>
                    <TableHead>价格</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {abTestConfig.disabledSources.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell className="text-[#86909C]">-</TableCell>
                      <TableCell>
                        <span className="text-[#1D2129]">{source.name}</span>
                        <span className="ml-2 text-xs px-2 py-0.5 bg-[#F2F3F5] text-[#86909C] rounded">原生</span>
                      </TableCell>
                      <TableCell>
                        <Switch checked={source.status === 'enabled'} onCheckedChange={(checked) => {
                          const newSources = [...abTestConfig.disabledSources];
                          const idx = newSources.findIndex(s => s.id === source.id);
                          newSources[idx].status = checked ? 'enabled' : 'disabled';
                          if (checked) {
                            setAbTestConfig(prev => ({
                              ...prev,
                              disabledSources: newSources.filter(s => s.id !== source.id),
                              enabledSources: [...prev.enabledSources, { ...source, enabled: true }]
                            }));
                          } else {
                            setAbTestConfig(prev => ({ ...prev, disabledSources: newSources }));
                          }
                        }} />
                      </TableCell>
                      <TableCell>
                        {source.pricingType === 'bidding' ? (
                          <span className="text-[#86909C]">-</span>
                        ) : (
                          <Input
                            type="number"
                            value={source.price || ''}
                            onChange={(e) => {
                              const newSources = [...abTestConfig.disabledSources];
                              const idx = newSources.findIndex(s => s.id === source.id);
                              newSources[idx].price = parseFloat(e.target.value) || 0;
                              setAbTestConfig(prev => ({ ...prev, disabledSources: newSources }));
                            }}
                            className="w-24 h-8 text-sm"
                            placeholder="输入价格"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {abTestConfig.disabledSources.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-[#86909C] py-4">
                        暂无未启用DSP来源
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setAbTestStep(0)}>
              取消测试
            </Button>
            <Button className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white" onClick={() => {
              // 更新分组状态，标记A/B测试已启动
              setAdGroups(prev => prev.map(g => g.id === selectedGroupId ? { ...g, hasABTest: true, abTestStarted: true } : g));
              // 关闭弹窗并显示成功提示
              setAbTestStep(0);
              setShowABTestDialog(false);
              alert('A/B测试创建成功！');
            }}>
              开启测试
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* A/B测试数据弹窗 */}
      <Dialog open={showABTestDataDialog} onOpenChange={setShowABTestDataDialog}>
        <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">A/B测试数据</DialogTitle>
          </DialogHeader>

          {/* 测试基础信息栏 */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#ECFDF5] rounded-lg">
            <div className="flex items-center gap-6">
              <span className="text-sm text-[#1D2129]">测试名称：<span className="font-medium">{currentGroup?.name}-A/B测试</span></span>
              <span className="text-sm text-[#86909C]">生效时间：{new Date().toLocaleString()}</span>
              <span className="text-sm text-[#86909C]">运行时长：0小时</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-[#10B981] hover:bg-[#059669] text-white">全量A组</Button>
              <Button size="sm" className="bg-[#F59E0B] hover:bg-[#D97706] text-white">全量B组</Button>
            </div>
          </div>

          {/* 数据表格 */}
          <div className="flex-1 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F7F8FA]">
                  <TableHead className="w-24">组别</TableHead>
                  <TableHead className="text-right">千人均收益</TableHead>
                  <TableHead className="text-right">预估收入</TableHead>
                  <TableHead className="text-right">eCPM</TableHead>
                  <TableHead className="text-right">千次请求价值</TableHead>
                  <TableHead className="text-right">请求量</TableHead>
                  <TableHead className="text-right">返回率</TableHead>
                  <TableHead className="text-right">竞价成功数</TableHead>
                  <TableHead className="text-right">竞价成功率</TableHead>
                  <TableHead className="text-right">展示量</TableHead>
                  <TableHead className="text-right">竞胜展示率</TableHead>
                  <TableHead className="text-right">点击数</TableHead>
                  <TableHead className="text-right">点击率</TableHead>
                  <TableHead className="text-right">cpc</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* A组对照组 */}
                <TableRow>
                  <TableCell><span className="inline-block px-2 py-1 bg-[#10B981] text-white text-xs rounded">A(对照组)</span></TableCell>
                  <TableCell className="text-right">0.05</TableCell>
                  <TableCell className="text-right">1,014.97</TableCell>
                  <TableCell className="text-right">23.17</TableCell>
                  <TableCell className="text-right">18.52</TableCell>
                  <TableCell className="text-right">54,720</TableCell>
                  <TableCell className="text-right">96.78%</TableCell>
                  <TableCell className="text-right">26,462</TableCell>
                  <TableCell className="text-right">48.36%</TableCell>
                  <TableCell className="text-right">26,462</TableCell>
                  <TableCell className="text-right">100.00%</TableCell>
                  <TableCell className="text-right">1,058</TableCell>
                  <TableCell className="text-right">4.00%</TableCell>
                  <TableCell className="text-right">0.96</TableCell>
                </TableRow>
                {/* B组实验组 */}
                <TableRow>
                  <TableCell><span className="inline-block px-2 py-1 bg-[#F59E0B] text-white text-xs rounded">B(实验组)</span></TableCell>
                  <TableCell className="text-right">0.01</TableCell>
                  <TableCell className="text-right">23.67</TableCell>
                  <TableCell className="text-right">11.35</TableCell>
                  <TableCell className="text-right">8.21</TableCell>
                  <TableCell className="text-right">4,580</TableCell>
                  <TableCell className="text-right">89.27%</TableCell>
                  <TableCell className="text-right">1,950</TableCell>
                  <TableCell className="text-right">42.58%</TableCell>
                  <TableCell className="text-right">1,950</TableCell>
                  <TableCell className="text-right">100.00%</TableCell>
                  <TableCell className="text-right">68</TableCell>
                  <TableCell className="text-right">3.49%</TableCell>
                  <TableCell className="text-right">0.35</TableCell>
                </TableRow>
                {/* 对比涨幅 */}
                <TableRow className="bg-[#F7F8FA]">
                  <TableCell className="text-[#86909C]">对比涨幅</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-80.00%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-97.67%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-51.01%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-55.67%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-91.63%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-7.76%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-92.63%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-11.95%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-92.63%</TableCell>
                  <TableCell className="text-right text-[#86909C]">0.00%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-93.57%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-12.75%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-63.54%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowABTestDataDialog(false)}>
              取消
            </Button>
            <Button className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white" onClick={() => setShowABTestDataDialog(false)}>
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// DSP来源表格组件
interface SourceTableProps {
  sources: AdSource[];
  summaryData?: {
    revenuePerThousand: number;
    estimatedRevenue: number;
    ecpm: number;
    revenuePerThousandRequests: number;
    requests: number;
    responseRate: number;
    bidWins: number;
    bidWinRate: number;
    impressions: number;
    winImpressionRate: number;
    clicks: number;
    ctr: number;
    cpc: number;
  };
  selectedSources: Set<string>;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onUpdatePrice: (id: string, price: number) => void;
  onMouseEnter: (source: AdSource, e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onEditSource: (source: AdSource) => void;
}

function SourceTable({
  sources,
  summaryData,
  selectedSources,
  isAllSelected,
  isIndeterminate,
  onToggleSelectAll,
  onToggleSelect,
  onToggleStatus,
  onUpdatePrice,
  onMouseEnter,
  onMouseLeave,
  onEditSource,
}: SourceTableProps) {
  const [editingPrice, setEditingPrice] = useState<{ id: string; value: string } | null>(null);

  const handlePriceSave = (sourceId: string) => {
    if (editingPrice && editingPrice.id === sourceId) {
      const newPrice = parseFloat(editingPrice.value);
      if (!isNaN(newPrice) && newPrice >= 0) {
        onUpdatePrice(sourceId, newPrice);
      }
    }
    setEditingPrice(null);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-[#F7F8FA] hover:bg-[#F7F8FA]">
          <TableHead className="w-20">操作</TableHead>
          <TableHead className="w-32">DSP来源</TableHead>
          <TableHead className="w-20">状态</TableHead>
          <TableHead className="w-24">
            <div className="flex items-center gap-1">
              定价方式
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>DSP来源的计费模式</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead className="w-20">价格</TableHead>
          <TableHead className="w-20">
            <div className="flex items-center gap-1">
              千人均收益
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>每千人产生的收益</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead className="w-24">
            <div className="flex items-center gap-1">
              预估收入
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>预计收入金额</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead className="w-20">
            <div className="flex items-center gap-1">
              eCPM
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>千次展示收益</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead className="w-24">
            <div className="flex items-center gap-1">
              千次请求价值
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>每千次请求的价值</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead className="w-20">请求量</TableHead>
          <TableHead className="w-20">
            <div className="flex items-center gap-1">
              返回率
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>返回量/请求量</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead className="w-20">竞价成功数</TableHead>
          <TableHead className="w-20">
            <div className="flex items-center gap-1">
              竞价成功率
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>竞价成功数/请求量</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead className="w-20">
            <div className="flex items-center gap-1">
              展示量
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>广告展示次数</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead className="w-20">
            <div className="flex items-center gap-1">
              竞胜展示率
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>竞胜展示次数/总展示次数</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead className="w-20">
            <div className="flex items-center gap-1">
              点击率
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>点击量/展示量</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead className="w-20">cpc</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* 汇总行 - 仅当有 summaryData 时渲染（仅已启用DSP来源表格显示汇总） */}
        {summaryData && (
        <TableRow className="bg-[#FEF3F7] font-medium">
          <TableCell></TableCell> {/* 操作 */}
          <TableCell className="text-[#1D2129]">{sources.length}个DSP来源已启用</TableCell>
          <TableCell></TableCell> {/* 状态 */}
          <TableCell></TableCell> {/* 定价方式 */}
          <TableCell></TableCell> {/* 价格 */}
          <TableCell className="text-[#1D2129]">¥{summaryData?.revenuePerThousand?.toFixed(2) || '-'}</TableCell> {/* 千人均收益 */}
          <TableCell className="text-[#1D2129]">{summaryData?.estimatedRevenue.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</TableCell> {/* 预估收入 */}
          <TableCell className="text-[#1D2129]">¥{summaryData?.ecpm?.toFixed(2) || '-'}</TableCell> {/* eCPM */}
          <TableCell className="text-[#1D2129]">¥{summaryData?.revenuePerThousandRequests?.toFixed(2) || '-'}</TableCell> {/* 千次请求价值 */}
          <TableCell className="text-[#1D2129]">{formatNumber(summaryData?.requests || 0)}</TableCell> {/* 请求量 */}
          <TableCell className="text-[#1D2129]">{summaryData?.responseRate?.toFixed(1) || '0.0'}%</TableCell> {/* 返回率 */}
          <TableCell className="text-[#1D2129]">{formatNumber(summaryData?.bidWins || 0)}</TableCell> {/* 竞价成功数 */}
          <TableCell className="text-[#1D2129]">{`${summaryData?.bidWinRate?.toFixed(1) || '0.0'}%`}</TableCell> {/* 竞价成功率 */}
          <TableCell className="text-[#1D2129]">{(summaryData?.impressions ?? 0) > 0 ? formatNumber(summaryData?.impressions || 0) : '-'}</TableCell> {/* 展示量 */}
          <TableCell className="text-[#1D2129]">{(summaryData?.winImpressionRate ?? 0) > 0 ? `${summaryData?.winImpressionRate?.toFixed(1)}%` : '-'}</TableCell> {/* 竞胜展示率 */}
          <TableCell className="text-[#1D2129]">{(summaryData?.ctr ?? 0) > 0 ? `${summaryData?.ctr?.toFixed(1)}%` : '-'}</TableCell> {/* 点击率 */}
          <TableCell className="text-[#1D2129]">{(summaryData?.cpc ?? 0) > 0 ? `¥${summaryData?.cpc?.toFixed(2)}` : '-'}</TableCell> {/* cpc */}
        </TableRow>
        )}
        {sources.map((source) => {
          const colors = getSourceColor(source.name);
          return (
            <TableRow
              key={source.id}
              className="hover:bg-[#FFF7FA] cursor-pointer"
              onMouseEnter={(e) => onMouseEnter(source, e)}
              onMouseLeave={onMouseLeave}
            >
              {/* 操作 */}
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[#2563EB] hover:text-[#2563EB] hover:bg-[#2563EB]/10"
                  onClick={() => onEditSource(source)}
                >
                  编辑
                </Button>
              </TableCell>
              {/* DSP来源名称 */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: colors.dot }}
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-[#1D2129] whitespace-nowrap">{source.name}</span>
                  </div>
                </div>
              </TableCell>
              
              {/* 状态开关 */}
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center">
                  <Switch
                    checked={source.status === 'enabled'}
                    onCheckedChange={() => onToggleStatus(source.id)}
                    className="data-[state=checked]:bg-[#2563EB]"
                  />
                </div>
              </TableCell>
              
              {/* 定价方式 */}
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                    source.pricingType === 'bidding'
                      ? 'bg-[#2563EB]/10 text-[#2563EB]'
                      : 'bg-[#00B42A]/10 text-[#00B42A]'
                  }`}>
                    {source.pricingType === 'bidding' ? '竞价' : '定价'}
                  </span>
                </div>
              </TableCell>
              
              {/* 价格 */}
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1 text-[#1D2129]">
                  {editingPrice?.id === source.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingPrice.value}
                        onChange={(e) => setEditingPrice({ id: source.id, value: e.target.value })}
                        className="w-16 h-6 text-xs"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 bg-[#00B42A] hover:bg-[#00B42A]/80 text-white"
                        onClick={() => handlePriceSave(source.id)}
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 bg-[#F2F3F5] hover:bg-[#F2F3F5]/80 text-[#86909C]"
                        onClick={() => setEditingPrice(null)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-sm">
                        ¥{source.price.toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-[#86909C] hover:text-[#2563EB] hover:bg-[#F2F3F5]"
                        onClick={() => setEditingPrice({ id: source.id, value: source.price.toString() })}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </TableCell>
              
              {/* 千人均收益 */}
              <TableCell className="text-[#1D2129]">
                ¥{source.revenuePerThousand?.toFixed(2) || '-'}
              </TableCell>
              
              {/* 预估收入 */}
              <TableCell className="text-[#1D2129]">
                {source.estimatedRevenue.toLocaleString('zh-CN', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </TableCell>
              
              {/* eCPM */}
              <TableCell className="text-[#1D2129]">
                ¥{source.ecpm.toFixed(2)}
              </TableCell>
              
              {/* 千次请求价值 */}
              <TableCell className="text-[#1D2129]">
                ¥{source.thousandRequestValue.toFixed(2)}
              </TableCell>
              
              {/* 请求量 */}
              <TableCell className="text-[#1D2129]">
                {formatNumber(source.requests)}
              </TableCell>
              
              {/* 返回率 */}
              <TableCell className="text-[#1D2129]">
                {source.responseRate.toFixed(1)}%
              </TableCell>
              
              {/* 竞价成功数 */}
              <TableCell className="text-[#1D2129]">
                {formatNumber(source.bidWins)}
              </TableCell>
              
              {/* 竞价成功率 */}
              <TableCell className="text-[#1D2129]">
                {`${source.bidWinRate.toFixed(1)}%`}
              </TableCell>
              
              {/* 展示量 */}
              <TableCell className="text-[#1D2129]">
                {(source.impressions ?? 0) > 0 ? formatNumber(source.impressions!) : '-'}
              </TableCell>
              
              {/* 竞胜展示率 */}
              <TableCell className="text-[#1D2129]">
                {(source.winImpressionRate ?? 0) > 0 ? `${source.winImpressionRate!.toFixed(1)}%` : '-'}
              </TableCell>
              
              
              {/* 点击率 */}
              <TableCell className="text-[#1D2129]">
                {(source.ctr ?? 0) > 0 ? `${source.ctr!.toFixed(1)}%` : '-'}
              </TableCell>
              
              {/* cpc */}
              <TableCell className="text-[#1D2129]">
                {(source.cpc ?? 0) > 0 ? `¥${source.cpc!.toFixed(2)}` : '-'}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
