"use client";

import { useEffect } from "react";
import { Tabs, type TabItem } from "@/components/ui";
import { INSECTS } from "@/data/insects";
import { CompanionGuide } from "./CompanionGuide";
import { FertilizerGuide } from "./FertilizerGuide";
import { GUIDE_TABS, resolveHash, type GuideTab } from "./guideLookups";
import { InsectGuide } from "./InsectGuide";
import { SoilGuide } from "./SoilGuide";
import { ToolGuide } from "./ToolGuide";
import { replaceHash, useLocationHash } from "./useLocationHash";
import { ZoneGuide } from "./ZoneGuide";

const TABS: readonly TabItem[] = [
  { id: "pests", label: "🐛 Pests & wildlife", content: <InsectGuide group="pests" /> },
  { id: "beneficials", label: "🐝 Beneficials & pollinators", content: <InsectGuide group="beneficials" /> },
  { id: "soil", label: "🌍 Soil", content: <SoilGuide /> },
  { id: "fertilizers", label: "🧪 Fertilizers", content: <FertilizerGuide /> },
  { id: "tools", label: "🧰 Tools", content: <ToolGuide /> },
  { id: "companions", label: "🤝 Companion planting", content: <CompanionGuide /> },
  { id: "zones", label: "🗺️ Climate zones", content: <ZoneGuide /> },
];

const DEFAULT_TAB: GuideTab = "pests";

/** Knowledge base. The selected tab lives in the URL hash so deep links (`/guides#insect-aphids`) work. */
export function Guides() {
  const hash = useLocationHash();
  const target = resolveHash(hash, INSECTS);
  const tab: GuideTab = target?.tab ?? DEFAULT_TAB;
  const anchor = target?.anchor ?? null;

  // Once the right tab is rendered, bring the deep-linked item into view.
  useEffect(() => {
    if (!anchor) return;
    const el = document.getElementById(anchor);
    if (!el) return;
    el.scrollIntoView({ block: "start" });
    el.focus({ preventScroll: true });
  }, [anchor, tab]);

  return (
    <Tabs
      label="Guides"
      tabs={TABS}
      value={tab}
      onChange={(id) => {
        if ((GUIDE_TABS as readonly string[]).includes(id)) replaceHash(id);
      }}
    />
  );
}
