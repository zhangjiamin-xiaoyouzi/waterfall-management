'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { TimeSlotPicker } from '@/components/time-slot-picker';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const DSP_SOURCE_LIST = [
  { value: 'pangle', label: '穿山甲' },
  { value: 'ylh', label: '优量汇' },
  { value: 'gdt', label: '广点通' },
  { value: 'ks', label: '快手' },
  { value: 'bd', label: '百度' },
  { value: 'sjyt', label: 'Sigmob' },
  { value: 'mintegral', label: 'Mintegral' },
  { value: 'unity', label: 'Unity Ads' },
  { value: 'vungle', label: 'Vungle' },
  { value: 'ironsource', label: 'IronSource' },
  { value: 'applovin', label: 'AppLovin' },
  { value: 'adcolony', label: 'AdColony' },
  { value: 'tapjoy', label: 'Tapjoy' },
  { value: 'chartboost', label: 'Chartboost' },
  { value: 'inmobi', label: 'InMobi' },
  { value: 'mobvista', label: 'Mobvista' },
];
const DSP_SOURCE_NAMES: Record<string, string> = {};
DSP_SOURCE_LIST.forEach((d: { value: string; label: string }) => { DSP_SOURCE_NAMES[d.value] = d.label; });
const SDK_SOURCE_VALUES = new Set(['pangle', 'ylh', 'gdt']);

interface AdSource {
  id: string;
  name: string;
  status: string;
  pricingType: string;
  price: number;
  /** A/B 测试中对照组(A)价格 */
  priceA?: number;
  /** A/B 测试中测试组(B)价格 */
  priceB?: number;
  estimatedRevenue: number;
  ecpm: number;
  thousandRequestValue: number;
  requests: number;
  responses: number;
  responseRate: number;
  bidWins: number;
  bidWinRate: number;
  revenuePerThousand: number;
  impressions: number;
  winImpressionRate: number;
  clicks: number;
  ctr: number;
  cpc: number;
  lastUpdated: string;
  platforms: string[];
  codeId: string;
  dspSources: string[];
}

interface Group {
  id: string;
  name: string;
  priority: number;
  platforms: string[];
  adSlots: string[];
  rules: any[];
  status: string;
  floorPrice: number;
  adSources: AdSource[];
}

const getSourceColor = (name: string) => {
  const colors = [
    { bg: '#E8F5E9', dot: '#4CAF50' },
    { bg: '#FFF3E0', dot: '#FF9800' },
    { bg: '#F3E5F5', dot: '#9C27B0' },
    { bg: '#E1F5FE', dot: '#03A9F4' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const formatNum = (num: number): string => {
  if (num >= 10000) {
    const wan = num / 10000;
    return `${wan.toFixed(1)}万`;
  }
  return num.toLocaleString('zh-CN');
};

export default function CreateABTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId');

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState(groupId || '');
  const [step, setStep] = useState(1); // 1: basic info, 2: waterfall config
  const [testName, setTestName] = useState('');
  const [groupA, setGroupA] = useState('50');
  const [groupB, setGroupB] = useState('50');
  const [copyConfig, setCopyConfig] = useState(true);
  const [testGroup, setTestGroup] = useState<'A' | 'B'>('B');
  const [editingSource, setEditingSource] = useState<{ source: AdSource; group: 'A' | 'B'; type: 'enabled' | 'disabled' } | null>(null);

  const [showAddPidDialog, setShowAddPidDialog] = useState(false);
  const [selectedDspSource, setSelectedDspSource] = useState('');
  const [pidCodeId, setPidCodeId] = useState('');
  const [pidMinVersion, setPidMinVersion] = useState('');
  const [pidMaxVersion, setPidMaxVersion] = useState('');
  const [pidStatus, setPidStatus] = useState('active');
  const [pidPriceA, setPidPriceA] = useState('0');
  const [pidPriceB, setPidPriceB] = useState('0');
  const [isSdkSource, setIsSdkSource] = useState(false);
  const [abTestConfig, setAbTestConfig] = useState<{ enabledSources: AdSource[] }>({ enabledSources: [] });

  // Fetch groups on mount
  useEffect(() => {
    fetch('/api/groups')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGroups(data.data);
          if (!groupId && data.data.length > 0) {
            setSelectedGroupId(data.data[0].id);
          }
        }
      })
      .catch(console.error);
  }, [groupId]);

  const currentGroup = groups.find(g => g.id === selectedGroupId);

  const enabledSources = currentGroup?.adSources?.filter(s => s.status === 'enabled') || [];
  const disabledSources = currentGroup?.adSources?.filter(s => s.status !== 'enabled') || [];

  const handleAddPidSource = () => {
    const selectedSource = DSP_SOURCE_LIST.find(s => s.value === selectedDspSource);
    if (!selectedSource || !pidCodeId || !selectedGroupId) return;

    const newSource: AdSource = {
      id: `pid-${Date.now()}`,
      name: pidCodeId,
      status: pidStatus === 'active' ? 'enabled' : 'disabled',
      pricingType: 'bidding',
      price: parseFloat(pidPriceA) || 0,
      priceA: parseFloat(pidPriceA) || 0,
      priceB: parseFloat(pidPriceB) || 0,
      estimatedRevenue: 0,
      ecpm: 0,
      thousandRequestValue: 0,
      requests: 0,
      responses: 0,
      responseRate: 0,
      bidWins: 0,
      bidWinRate: 0,
      revenuePerThousand: 0,
      impressions: 0,
      winImpressionRate: 0,
      clicks: 0,
      ctr: 0,
      cpc: 0,
      lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
      platforms: [],
      codeId: pidCodeId,
      dspSources: [selectedSource.value],
      ...(SDK_SOURCE_VALUES.has(selectedSource.value) ? {
        minVersion: pidMinVersion,
        maxVersion: pidMaxVersion,
      } : {})
    };

    setAbTestConfig(prev => ({
      ...prev,
      enabledSources: [...prev.enabledSources, newSource]
    }));
    setShowAddPidDialog(false);
    setSelectedDspSource('');
    setPidCodeId('');
    setPidMinVersion('');
    setPidMaxVersion('');
    setPidStatus('active');
    setPidPriceA('0');
    setPidPriceB('0');
  };

  const handleLaunch = () => {
    fetch('/api/groups', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedGroupId, hasABTest: true, abTestStarted: true }),
    }).catch(console.error);
    router.push(`/?groupId=${selectedGroupId}`);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E6EB] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="text-[#86909C] hover:text-[#1D2129] text-sm">← 返回</button>
          <h1 className="text-lg font-semibold text-[#1D2129]">创建 A/B 测试</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {step === 1 && (
          <div className="bg-white rounded-lg border border-[#E5E6EB] p-6">
            <h2 className="text-base font-semibold text-[#1D2129] mb-6">基本信息</h2>
            <div className="space-y-5 max-w-2xl">
              {/* 分组名称 */}
              <div className="flex items-center">
                <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">分组名称</label>
                <span className="text-[#FF4D88] font-medium text-sm">{currentGroup?.name || '-'}</span>
              </div>

              {/* 测试名称 */}
              <div className="flex items-center">
                <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">
                  <span className="text-red-500">*</span> 测试名称
                </label>
                <div className="flex-1 relative">
                  <Input
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="请输入测试名称"
                    className="pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#86909C]">
                    {testName.length} / 100
                  </span>
                </div>
              </div>

              {/* 流量比例 */}
              <div className="flex items-start">
                <label className="w-24 text-sm font-medium text-[#1D2129] pt-1 shrink-0">
                  <span className="text-red-500">*</span> 流量比例
                </label>
                <div className="flex-1 flex items-center gap-6">
                  <div className="border-t border-[#E5E6EB] pt-4">
              <label className="block text-sm font-medium mb-3">
                <span className="text-red-500">*</span> 价格(元)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F6FFED] border border-[#B7EB8F] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-[#52C41A] flex items-center justify-center text-white text-[10px] font-bold">A</div>
                    <span className="text-xs font-medium text-[#1D2129]">对照组</span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      value={pidPriceA}
                      onChange={(e) => setPidPriceA(e.target.value)}
                      className="pl-6 pr-2 h-8 text-sm"
                      step="0.01"
                      min="0"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-[#86909C]">¥</span>
                  </div>
                </div>
                <div className="bg-[#FFF7E6] border border-[#FFE58F] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-[#FA8C16] flex items-center justify-center text-white text-[10px] font-bold">B</div>
                    <span className="text-xs font-medium text-[#1D2129]">测试组</span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      value={pidPriceB}
                      onChange={(e) => setPidPriceB(e.target.value)}
                      className="pl-6 pr-2 h-8 text-sm"
                      step="0.01"
                      min="0"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-[#86909C]">¥</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#52C41A] flex items-center justify-center text-white text-xs font-bold">A</div>
                    <span className="text-sm text-[#1D2129]">对照组</span>
                    <div className="relative w-20">
                      <Input type="number" value={groupA} onChange={(e) => setGroupA(e.target.value)} className="pr-8 text-center" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#86909C]">%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#FA8C16] flex items-center justify-center text-white text-xs font-bold">B</div>
                    <span className="text-sm text-[#1D2129]">测试组</span>
                    <div className="relative w-20">
                      <Input type="number" value={groupB} onChange={(e) => setGroupB(e.target.value)} className="pr-8 text-center" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#86909C]">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 配置复制 */}
              <div className="flex items-center pl-24">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={copyConfig} onCheckedChange={(c) => setCopyConfig(c === true)} className="border-[#E5E6EB] data-[state=checked]:bg-[#FF4D88] data-[state=checked]:border-[#FF4D88]" />
                  <span className="text-sm text-[#1D2129]">将 A 组瀑布流配置复制给 B 组</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-8 pt-4 border-t border-[#E5E6EB]">
              <Button variant="outline" onClick={() => router.back()} className="border-[#E5E6EB] text-[#1D2129]">取消</Button>
              <Button className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white" onClick={() => setStep(2)} disabled={!testName.trim() || !selectedGroupId}>
                下一步
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {/* 顶部操作栏 */}
            <div className="bg-white rounded-lg border border-[#E5E6EB] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-[#1D2129]">配置测试组瀑布流</span>
                  <Select value={testGroup} onValueChange={(v) => setTestGroup(v as 'A' | 'B')}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="选择组别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#52C41A]" />对照组(A)</div></SelectItem>
                      <SelectItem value="B"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#FA8C16]" />测试组(B)</div></SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-[#86909C]">流量比例: {groupA}%</span>
                </div>
                <Button className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white" size="sm" onClick={() => setShowAddPidDialog(true)}>
                  <Plus className="w-4 h-4 mr-1" />添加PID
                </Button>
              </div>
            </div>

            {/* 已启用来源表格 */}
            <div className="bg-white rounded-lg border border-[#E5E6EB]">
              <div className="p-4 pb-0">
                <div className="text-sm font-medium text-[#86909C] mb-2">已启用DSP来源</div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F7F8FA]">
                      <TableHead className="w-12 text-xs text-[#86909C] font-medium">操作</TableHead>
                      <TableHead className="text-xs text-[#86909C] font-medium">DSP来源名称</TableHead>
                      <TableHead className="text-xs text-[#86909C] font-medium">状态</TableHead>
                      <TableHead className="text-xs text-[#86909C] font-medium">定价方式</TableHead>
                      <TableHead className="text-xs text-[#86909C] font-medium">价格(元)</TableHead>
                      <TableHead className="text-xs text-[#86909C] font-medium">预估收入(元)</TableHead>
                      <TableHead className="text-xs text-[#86909C] font-medium">eCPM(元)</TableHead>
                      <TableHead className="text-xs text-[#86909C] font-medium">千次请求价值</TableHead>
                      <TableHead className="text-xs text-[#86909C] font-medium">请求量</TableHead>
                      <TableHead className="text-xs text-[#86909C] font-medium">返回量</TableHead>
                      <TableHead className="text-xs text-[#86909C] font-medium">返回率</TableHead>
                      <TableHead className="text-xs text-[#86909C] font-medium">竞价成功数</TableHead>
                      <TableHead className="text-xs text-[#86909C] font-medium">竞胜率</TableHead>
                      <TableHead className="text-xs text-[#86909C] font-medium">千人均收益</TableHead>
                      <TableHead className="text-xs text-[#86909C] font-medium">展示量</TableHead>
                      <TableHead className="text-xs text-[#86909C] font-medium">竞胜展示率</TableHead>
                      <TableHead className="text-xs text-[#86909C] font-medium">点击率</TableHead>
                      <TableHead className="text-xs text-[#86909C] font-medium">CPC(元)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enabledSources.map((source) => {
                      const colors = getSourceColor(source.name);
                      return (
                        <TableRow key={source.id} className="hover:bg-[#FFF7FA] cursor-pointer">
                          <TableCell className="w-12">
                            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setEditingSource({ source, group: testGroup, type: 'enabled' })}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#86909C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.dot }} />
                              <span className="text-xs text-[#1D2129]">{source.name}</span>
                            </div>
                          </TableCell>
                          <TableCell><Switch checked={source.status === 'enabled'} className="data-[state=checked]:bg-[#FF4D88]" /></TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${source.pricingType === 'bidding' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                              {source.pricingType === 'bidding' ? '竞价' : '定价'}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs">¥{(testGroup === 'A' ? (source.priceA ?? source.price) : (source.priceB ?? source.price)).toFixed(2)}</TableCell>
                          <TableCell className="text-xs">¥{source.estimatedRevenue.toFixed(2)}</TableCell>
                          <TableCell className="text-xs">{source.ecpm.toFixed(2)}</TableCell>
                          <TableCell className="text-xs">¥{source.thousandRequestValue.toFixed(2)}</TableCell>
                          <TableCell className="text-xs">{formatNum(source.requests)}</TableCell>
                          <TableCell className="text-xs">{formatNum(source.responses)}</TableCell>
                          <TableCell className="text-xs">{source.responseRate}%</TableCell>
                          <TableCell className="text-xs">{formatNum(source.bidWins)}</TableCell>
                          <TableCell className="text-xs">{source.bidWinRate}%</TableCell>
                          <TableCell className="text-xs">¥{source.revenuePerThousand.toFixed(2)}</TableCell>
                          <TableCell className="text-xs">{formatNum(source.impressions)}</TableCell>
                          <TableCell className="text-xs">{source.winImpressionRate}%</TableCell>
                          <TableCell className="text-xs">{source.ctr}%</TableCell>
                          <TableCell className="text-xs">¥{source.cpc.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                    {enabledSources.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={18} className="text-center text-[#86909C] py-4 text-xs">暂无已启用DSP来源</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* 底部操作按钮 */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="border-[#E5E6EB] text-[#1D2129]">上一步</Button>
              <Button variant="outline" onClick={() => router.back()} className="border-[#E5E6EB] text-[#1D2129]">取消</Button>
              <Button className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white" onClick={handleLaunch}>开始测试</Button>
            </div>
          </div>
        )}

      {/* 添加PID弹窗 */}
      <Dialog open={showAddPidDialog} onOpenChange={setShowAddPidDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">添加PID</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">
                <span className="text-red-500">*</span> 选择DSP来源
              </label>
              <Select value={selectedDspSource || ''} onValueChange={(v) => {
                setSelectedDspSource(v);
                setIsSdkSource(SDK_SOURCE_VALUES.has(v));
              }}>
                <SelectTrigger><SelectValue placeholder="请选择DSP来源" /></SelectTrigger>
                <SelectContent>
                  {DSP_SOURCE_LIST.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}{SDK_SOURCE_VALUES.has(item.value) ? ' (SDK)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                <span className="text-red-500">*</span> PID
              </label>
              <Input value={pidCodeId} onChange={(e) => setPidCodeId(e.target.value)} placeholder="请输入PID" />
            </div>

            {isSdkSource && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <span className="text-red-500">*</span> 最小版本
                  </label>
                  <Input value={pidMinVersion} onChange={(e) => setPidMinVersion(e.target.value)} placeholder="如 9.01.0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <span className="text-red-500">*</span> 最大版本
                  </label>
                  <Input value={pidMaxVersion} onChange={(e) => setPidMaxVersion(e.target.value)} placeholder="如 9.01.0" />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">状态</span>
              <Switch checked={pidStatus === 'enabled'} onCheckedChange={(v) => setPidStatus(v ? 'enabled' : 'disabled')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPidDialog(false)}>取消</Button>
            <Button className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white" onClick={handleAddPidSource}>提交</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}