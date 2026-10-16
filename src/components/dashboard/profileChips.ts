import { formatMonthDay } from "@/components/setup/format";
import { formatTemperature } from "@/domain/climate";
import type { Garden, TemperatureUnit } from "@/domain/types";
import { ALLERGEN_LABELS, INDOOR_LIGHT_LABELS, PET_EMOJI, PET_LABELS, SETTING_LABELS, SUN_LABELS } from "@/lib/labels";

export interface ProfileChip {
  key: string;
  label: string;
  tone: "neutral" | "info" | "warning";
}

/** Short badges summarising a garden profile for the dashboard header. */
export function profileChips(garden: Garden, unit: TemperatureUnit): ProfileChip[] {
  const { profile } = garden;
  const { climate } = profile;
  const chips: ProfileChip[] = [
    { key: "setting", label: SETTING_LABELS[profile.setting], tone: "info" },
    { key: "zone", label: `Zone ${climate.hardinessZone}`, tone: "neutral" },
    {
      key: "frost",
      label:
        climate.lastFrost === null && climate.firstFrost === null
          ? "Frost-free"
          : `Frost ${formatMonthDay(climate.lastFrost)} to ${formatMonthDay(climate.firstFrost)}`,
      tone: "neutral",
    },
    { key: "low", label: `Winter low ${formatTemperature(climate.winterLowF, unit)}`, tone: "neutral" },
    profile.setting === "indoor"
      ? { key: "light", label: INDOOR_LIGHT_LABELS[profile.indoor.light], tone: "neutral" }
      : { key: "sun", label: SUN_LABELS[profile.sunExposure], tone: "neutral" },
  ];
  if (profile.containersOnly) chips.push({ key: "containers", label: "Containers only", tone: "neutral" });
  for (const pet of profile.pets) {
    chips.push({ key: `pet-${pet}`, label: `${PET_EMOJI[pet]} ${PET_LABELS[pet]}`, tone: "warning" });
  }
  for (const allergen of profile.allergies) {
    chips.push({ key: `allergy-${allergen}`, label: `Allergy: ${ALLERGEN_LABELS[allergen]}`, tone: "warning" });
  }
  if (profile.hasChildren) chips.push({ key: "children", label: "Children at home", tone: "warning" });
  return chips;
}
