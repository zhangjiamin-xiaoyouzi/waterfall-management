import { db } from './database';
import { adGroups, adSources } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { AdGroup, AdSource, MOCK_AD_GROUPS } from './waterfall-types';
import type { Platform } from './waterfall-types';

// ============ 工具函数 ============

/** 数据库行转 AdGroup */
function rowToGroup(row: typeof adGroups.$inferSelect, sources: AdSource[]): AdGroup {
  return {
    id: row.id,
    name: row.name,
    priority: row.priority,
    platforms: row.platforms as AdGroup['platforms'],
    adSlots: row.adSlots as string[],
    scene: row.scene as AdGroup['scene'],
    platform: row.platform as AdGroup['platform'],
    rules: row.rules as AdGroup['rules'],
    status: row.status as 'enabled' | 'disabled',
    floorPrice: row.floorPrice,
    adSources: sources,
    hasABTest: row.hasAbTest ?? undefined,
    abTestStarted: row.abTestStarted ?? undefined,
    abTestDraftData: row.abTestDraftData as AdGroup['abTestDraftData'] ?? undefined,
  };
}

/** 数据库行转 AdSource */
function rowToSource(row: typeof adSources.$inferSelect): AdSource {
  return {
    id: row.id,
    name: row.name,
    status: row.status as 'enabled' | 'disabled',
    pricingType: row.pricingType as AdSource['pricingType'],
    price: row.price,
    priceA: row.priceA ?? undefined,
    priceB: row.priceB ?? undefined,
    estimatedRevenue: row.estimatedRevenue,
    ecpm: row.ecpm,
    thousandRequestValue: row.thousandRequestValue,
    requests: row.requests,
    responses: row.responses,
    responseRate: row.responseRate,
    bidWins: row.bidWins,
    bidWinRate: row.bidWinRate,
    revenuePerThousand: row.revenuePerThousand ?? undefined,
    impressions: row.impressions ?? undefined,
    winImpressionRate: row.winImpressionRate ?? undefined,
    clicks: row.clicks ?? undefined,
    ctr: row.ctr ?? undefined,
    cpc: row.cpc ?? undefined,
    isFallback: row.isFallback ?? undefined,
    lastUpdated: row.lastUpdated,
    platforms: row.platforms as Platform[] | undefined,
    codeId: row.codeId ?? undefined,
    subPositions: row.subPositions as string[] | undefined,
    dspSources: row.dspSources as string[] | undefined,
    minVersion: row.minVersion ?? undefined,
    maxVersion: row.maxVersion ?? undefined,
    dimension: row.dimension ?? undefined,
    overrideMode: row.overrideMode ?? undefined,
    overridePids: row.overridePids ?? undefined,
  };
}

/** AdSource 转数据库插入行 */
function sourceToInsert(source: AdSource, groupId: string): typeof adSources.$inferInsert {
  return {
    id: source.id,
    groupId,
    name: source.name,
    status: source.status,
    pricingType: source.pricingType,
    price: source.price,
    priceA: source.priceA ?? null,
    priceB: source.priceB ?? null,
    estimatedRevenue: source.estimatedRevenue,
    ecpm: source.ecpm,
    thousandRequestValue: source.thousandRequestValue,
    requests: source.requests,
    responses: source.responses,
    responseRate: source.responseRate,
    bidWins: source.bidWins,
    bidWinRate: source.bidWinRate,
    revenuePerThousand: source.revenuePerThousand ?? null,
    impressions: source.impressions ?? null,
    winImpressionRate: source.winImpressionRate ?? null,
    clicks: source.clicks ?? null,
    ctr: source.ctr ?? null,
    cpc: source.cpc ?? null,
    isFallback: source.isFallback ?? null,
    lastUpdated: source.lastUpdated,
    platforms: source.platforms ?? null,
    codeId: source.codeId ?? null,
    subPositions: source.subPositions ?? null,
    dspSources: source.dspSources ?? null,
    minVersion: source.minVersion ?? null,
    maxVersion: source.maxVersion ?? null,
    dimension: source.dimension ?? null,
    overrideMode: source.overrideMode ?? null,
    overridePids: source.overridePids ?? null,
  };
}

/** AdGroup 转数据库插入行 */
function groupToInsert(group: AdGroup): typeof adGroups.$inferInsert {
  const insert: Record<string, unknown> = {
    id: group.id,
    name: group.name,
    priority: group.priority === Infinity ? 999 : group.priority,
    platforms: group.platforms,
    adSlots: group.adSlots,
    scene: group.scene,
    platform: group.platform,
    rules: group.rules,
    status: group.status,
    floorPrice: group.floorPrice,
  };
  if (group.hasABTest !== undefined) insert.hasAbTest = group.hasABTest;
  if (group.abTestStarted !== undefined) insert.abTestStarted = group.abTestStarted;
  if (group.abTestDraftData !== undefined) insert.abTestDraftData = group.abTestDraftData;
  return insert as typeof adGroups.$inferInsert;
}

// ============ 禁用源 ============

const DISABLED_MOCK_SOURCES: AdSource[] = [
  { id: '', name: '女人通', dspSources: ['nvrentong'], price: 0, pricingType: 'CPM', status: 'disabled', codeId: '', requests: 0, responses: 0, responseRate: 0, bidWins: 0, bidWinRate: 0, impressions: 0, winImpressionRate: 0, clicks: 0, ctr: 0, cpc: 0, estimatedRevenue: 0, revenuePerThousand: 0, ecpm: 0, thousandRequestValue: 0, lastUpdated: '' },
  { id: '', name: '柚+', dspSources: ['youplus'], price: 0, pricingType: 'CPM', status: 'disabled', codeId: '', requests: 0, responses: 0, responseRate: 0, bidWins: 0, bidWinRate: 0, impressions: 0, winImpressionRate: 0, clicks: 0, ctr: 0, cpc: 0, estimatedRevenue: 0, revenuePerThousand: 0, ecpm: 0, thousandRequestValue: 0, lastUpdated: '' },
];

let _initialized = false;
let _ensureDisabledDone = false;

// ============ 数据库初始化 ============

/** 初始化种子数据 */
async function initDb(): Promise<void> {
  if (_initialized) return;

  const existing = await db.select({ id: adGroups.id }).from(adGroups).limit(1);
  if (existing.length > 0) {
    _initialized = true;
    return;
  }

  // 插入所有分组
  for (const group of MOCK_AD_GROUPS) {
    await db.insert(adGroups).values(groupToInsert(group)).onConflictDoNothing();
    if (group.adSources.length > 0) {
      await db.insert(adSources).values(
        group.adSources.map(s => sourceToInsert(s, group.id))
      ).onConflictDoNothing();
    }
  }

  _initialized = true;
}

async function ensureDisabledSources(): Promise<void> {
  if (_ensureDisabledDone) return;
  _ensureDisabledDone = true;

  const groups = await db.select({ id: adGroups.id }).from(adGroups);
  let counter = 0;
  for (const g of groups) {
    for (const ds of DISABLED_MOCK_SOURCES) {
      const dsId = `${g.id}-disabled-${counter++}`;
      await db.insert(adSources).values(sourceToInsert({ ...ds, id: dsId }, g.id)).onConflictDoNothing();
    }
  }
}

// ============ 分组 CRUD ============

export async function getAllGroups(): Promise<AdGroup[]> {
  await initDb();
  await ensureDisabledSources();

  let rows = await db.select().from(adGroups);

  // Safety: retry init if data is missing (handles case where init was previously interrupted)
  if (rows.length === 0) {
    _initialized = false;
    _ensureDisabledDone = false;
    await initDb();
    await ensureDisabledSources();
    rows = await db.select().from(adGroups);
  }

  const allSources = await db.select().from(adSources);
  const sourceMap = new Map<string, AdSource[]>();
  for (const s of allSources) {
    const list = sourceMap.get(s.groupId) || [];
    list.push(rowToSource(s));
    sourceMap.set(s.groupId, list);
  }

  // restore priority sentinel: Infinity -> we use 999 to represent it in DB
  return rows.map(r => {
    const group = rowToGroup(r, sourceMap.get(r.id) || []);
    // priority 999 in DB means Infinity (default group)
    if (group.priority === 999) group.priority = Infinity;
    return group;
  });
}

export async function getGroupById(id: string): Promise<AdGroup | undefined> {
  await initDb();
  await ensureDisabledSources();

  const rows = await db.select().from(adGroups).where(eq(adGroups.id, id));
  if (rows.length === 0) return undefined;
  const sources = await db.select().from(adSources).where(eq(adSources.groupId, id));
  const group = rowToGroup(rows[0], sources.map(rowToSource));
  if (group.priority === 999) group.priority = Infinity;
  return group;
}

export async function createGroup(group: AdGroup): Promise<AdGroup> {
  await initDb();

  await db.insert(adGroups).values(groupToInsert(group));

  if (group.adSources.length > 0) {
    await db.insert(adSources).values(
      group.adSources.map(s => sourceToInsert(s, group.id))
    );
  }

  return group;
}

export async function updateGroup(id: string, updates: Partial<AdGroup>): Promise<AdGroup | null> {
  const existing = await getGroupById(id);
  if (!existing) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { adSources: _, ...groupUpdates } = updates;

  const dbUpdates: Record<string, unknown> = {};
  if (groupUpdates.name !== undefined) dbUpdates.name = groupUpdates.name;
  if (groupUpdates.priority !== undefined) dbUpdates.priority = groupUpdates.priority === Infinity ? 999 : groupUpdates.priority;
  if (groupUpdates.platforms !== undefined) dbUpdates.platforms = groupUpdates.platforms;
  if (groupUpdates.adSlots !== undefined) dbUpdates.adSlots = groupUpdates.adSlots;
  if (groupUpdates.scene !== undefined) dbUpdates.scene = groupUpdates.scene;
  if (groupUpdates.platform !== undefined) dbUpdates.platform = groupUpdates.platform;
  if (groupUpdates.rules !== undefined) dbUpdates.rules = groupUpdates.rules;
  if (groupUpdates.status !== undefined) dbUpdates.status = groupUpdates.status;
  if (groupUpdates.floorPrice !== undefined) dbUpdates.floorPrice = groupUpdates.floorPrice;
  if (groupUpdates.hasABTest !== undefined) dbUpdates.hasAbTest = groupUpdates.hasABTest;
  if (groupUpdates.abTestStarted !== undefined) dbUpdates.abTestStarted = groupUpdates.abTestStarted;
  if (groupUpdates.abTestDraftData !== undefined) dbUpdates.abTestDraftData = groupUpdates.abTestDraftData;

  await db.update(adGroups).set(dbUpdates).where(eq(adGroups.id, id));

  const result = await getGroupById(id);
  return result ?? null;
}

export async function deleteGroup(id: string): Promise<boolean> {
  await db.delete(adSources).where(eq(adSources.groupId, id));
  await db.delete(adGroups).where(eq(adGroups.id, id));
  return true;
}

// ============ 广告源 CRUD ============

export async function getSourceById(sourceId: string): Promise<AdSource | undefined> {
  await initDb();
  const rows = await db.select().from(adSources).where(eq(adSources.id, sourceId)).limit(1);
  return rows.length > 0 ? rowToSource(rows[0]) : undefined;
}

export async function addSourceToGroup(groupId: string, source: AdSource): Promise<AdSource | null> {
  const group = await getGroupById(groupId);
  if (!group) return null;

  await db.insert(adSources).values(sourceToInsert(source, groupId));
  return source;
}

export async function updateSource(sourceId: string, updates: Partial<AdSource>): Promise<AdSource | null> {
  const existing = await db.select().from(adSources).where(eq(adSources.id, sourceId)).limit(1);
  if (existing.length === 0) return null;

  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.pricingType !== undefined) dbUpdates.pricingType = updates.pricingType;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.priceA !== undefined) dbUpdates.priceA = updates.priceA;
  if (updates.priceB !== undefined) dbUpdates.priceB = updates.priceB;
  if (updates.estimatedRevenue !== undefined) dbUpdates.estimatedRevenue = updates.estimatedRevenue;
  if (updates.ecpm !== undefined) dbUpdates.ecpm = updates.ecpm;
  if (updates.thousandRequestValue !== undefined) dbUpdates.thousandRequestValue = updates.thousandRequestValue;
  if (updates.requests !== undefined) dbUpdates.requests = updates.requests;
  if (updates.responses !== undefined) dbUpdates.responses = updates.responses;
  if (updates.responseRate !== undefined) dbUpdates.responseRate = updates.responseRate;
  if (updates.bidWins !== undefined) dbUpdates.bidWins = updates.bidWins;
  if (updates.bidWinRate !== undefined) dbUpdates.bidWinRate = updates.bidWinRate;
  if (updates.lastUpdated !== undefined) dbUpdates.lastUpdated = updates.lastUpdated;
  if (updates.codeId !== undefined) dbUpdates.codeId = updates.codeId;
  if (updates.subPositions !== undefined) dbUpdates.subPositions = updates.subPositions;
  if (updates.dspSources !== undefined) dbUpdates.dspSources = updates.dspSources;
  if (updates.minVersion !== undefined) dbUpdates.minVersion = updates.minVersion;
  if (updates.maxVersion !== undefined) dbUpdates.maxVersion = updates.maxVersion;
  if (updates.dimension !== undefined) dbUpdates.dimension = updates.dimension;
  if (updates.overrideMode !== undefined) dbUpdates.overrideMode = updates.overrideMode;
  if (updates.overridePids !== undefined) dbUpdates.overridePids = updates.overridePids;
  if (updates.platforms !== undefined) dbUpdates.platforms = updates.platforms;

  await db.update(adSources).set(dbUpdates).where(eq(adSources.id, sourceId));
  const updated = await db.select().from(adSources).where(eq(adSources.id, sourceId)).limit(1);
  return updated.length > 0 ? rowToSource(updated[0]) : null;
}

export async function deleteSource(sourceId: string): Promise<boolean> {
  await db.delete(adSources).where(eq(adSources.id, sourceId));
  return true;
}

export async function batchUpdateSources(sourceIds: string[], updates: Partial<AdSource>): Promise<number> {
  let count = 0;
  for (const sid of sourceIds) {
    const result = await updateSource(sid, updates);
    if (result) count++;
  }
  return count;
}

export async function resetDatabase(): Promise<void> {
  await db.delete(adSources);
  await db.delete(adGroups);
  _initialized = false;
  _ensureDisabledDone = false;
  await initDb();
  await ensureDisabledSources();
}