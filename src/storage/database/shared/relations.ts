import { relations } from "drizzle-orm/relations";
import { adGroups, adSources } from "./schema";

export const adSourcesRelations = relations(adSources, ({one}) => ({
	adGroup: one(adGroups, {
		fields: [adSources.groupId],
		references: [adGroups.id]
	}),
}));

export const adGroupsRelations = relations(adGroups, ({many}) => ({
	adSources: many(adSources),
}));