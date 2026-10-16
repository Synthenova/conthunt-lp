"use client";

/** Stand-ins for the tracking island's client components (see components/layout/island-code.tsx). */
import { islandPart } from "@/components/layout/island-code";

export const TrackingBoard = islandPart("tracking", "TrackingBoard");
export const GrowthCharts = islandPart("tracking", "GrowthCharts");
export const FeatureList = islandPart("tracking", "FeatureList");
export const TrackingHighlightProvider = islandPart("tracking", "TrackingHighlightProvider");
