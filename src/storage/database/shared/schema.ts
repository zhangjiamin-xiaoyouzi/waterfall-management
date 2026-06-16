import { pgTable, serial, timestamp, text, integer, jsonb, varchar, real, boolean, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const adGroups = pgTable("ad_groups", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	priority: integer().default(0).notNull(),
	platforms: jsonb().default([]).notNull(),
	adSlots: jsonb().default([]).notNull(),
	scene: varchar({ length: 32 }).notNull(),
	platform: varchar({ length: 32 }).notNull(),
	rules: jsonb().default([]).notNull(),
	status: varchar({ length: 16 }).default('enabled').notNull(),
	floorPrice: real().default(0).notNull(),
	hasAbTest: boolean("has_ab_test").default(false),
	abTestStarted: boolean("ab_test_started").default(false),
	abTestDraftData: jsonb("ab_test_draft_data"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const adSources = pgTable("ad_sources", {
	id: text().primaryKey().notNull(),
	groupId: text("group_id").notNull(),
	name: text().notNull(),
	status: varchar({ length: 16 }).default('enabled').notNull(),
	pricingType: varchar("pricing_type", { length: 16 }).default('CPM').notNull(),
	price: real().default(0).notNull(),
	priceA: real("price_a"),
	priceB: real("price_b"),
	estimatedRevenue: real("estimated_revenue").default(0).notNull(),
	ecpm: real().default(0).notNull(),
	thousandRequestValue: real("thousand_request_value").default(0).notNull(),
	requests: integer().default(0).notNull(),
	responses: integer().default(0).notNull(),
	responseRate: real("response_rate").default(0).notNull(),
	bidWins: integer("bid_wins").default(0).notNull(),
	bidWinRate: real("bid_win_rate").default(0).notNull(),
	revenuePerThousand: real("revenue_per_thousand"),
	impressions: integer().default(0),
	winImpressionRate: real("win_impression_rate"),
	clicks: integer().default(0),
	ctr: real().default(0),
	cpc: real().default(0),
	isFallback: boolean("is_fallback").default(false),
	lastUpdated: text("last_updated").default('').notNull(),
	platforms: jsonb(),
	codeId: text("code_id"),
	subPositions: jsonb("sub_positions"),
	dspSources: jsonb("dsp_sources"),
	minVersion: text("min_version"),
	maxVersion: text("max_version"),
	dimension: text(),
	overrideMode: boolean("override_mode").default(false),
	overridePids: text("override_pids"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [adGroups.id],
			name: "ad_sources_group_id_ad_groups_id_fk"
		}).onDelete("cascade"),
]);
