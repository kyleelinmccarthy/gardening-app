"use client";

import { useEffect, type ReactNode } from "react";
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

interface GuideTabDef {
  id: GuideTab;
  label: string;
  /** Visually hidden `<h2>` that names the panel, so the cards inside (`<h3>`) never skip a level under the page `<h1>`. */
  heading: string;
  content: ReactNode;
}

const TAB_DEFS: readonly GuideTabDef[] = [
  { id: "pests", label: "🐛 Pests & wildlife", heading: "Pests & wildlife", content: <InsectGuide group="pests" /> },
  {
    id: "beneficials",
    label: "🐝 Beneficials & pollinators",
    heading: "Beneficials & pollinators",
    content: <InsectGuide group="beneficials" />,
  },
  { id: "soil", label: "🌍 Soil", heading: "Soil", content: <SoilGuide /> },
  { id: "fertilizers", label: "🧪 Fertilizers", heading: "Fertilizers", content: <FertilizerGuide /> },
  { id: "tools", label: "🧰 Tools", heading: "Tools", content: <ToolGuide /> },
  { id: "companions", label: "🤝 Companion planting", heading: "Companion planting", content: <CompanionGuide /> },
  { id: "zones", label: "🗺️ Climate zones", heading: "Climate zones", content: <ZoneGuide /> },
];

const TABS: readonly TabItem[] = TAB_DEFS.map(({ id, label, heading, content }) => ({
  id,
  label,
  content: (
    <>
      <h2 className="sr-only">{heading}</h2>
      {content}
    </>
  ),
}));

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
