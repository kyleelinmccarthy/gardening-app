"use client";

import { Badge, Card } from "@/components/ui";
import { ZONES } from "@/data/zones";
import { formatTemperature } from "@/domain/climate";
import { formatDisplayDate, monthDayToIso } from "@/domain/dates";
import { cn } from "@/lib/cn";
import { useAppData } from "@/state/AppDataProvider";

/** "04-15" → "Apr 15" (null = frost-free). */
function frostDate(monthDay: string | null): string {
  return monthDay === null ? "Frost-free" : formatDisplayDate(monthDayToIso(monthDay, 2001));
}

export function ZoneGuide() {
  const { activeGarden, data } = useAppData();
  const unit = data.settings.temperatureUnit;
  const myZone = activeGarden?.profile.climate.hardinessZone;
  return (
    <div className="flex flex-col gap-4">
      <Card title="USDA hardiness zones" headingLevel="h3" description="Each zone spans 10°F of average annual extreme minimum temperature. Frost dates are typical averages; your local microclimate can shift them by weeks.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <caption className="sr-only">Hardiness zones with minimum temperatures and typical frost dates</caption>
            <thead>
              <tr className="border-b border-border text-muted">
                <th scope="col" className="py-2 pr-3 font-medium">Zone</th>
                <th scope="col" className="py-2 pr-3 font-medium">Average minimum</th>
                <th scope="col" className="py-2 pr-3 font-medium">Last spring frost</th>
                <th scope="col" className="py-2 pr-3 font-medium">First fall frost</th>
                <th scope="col" className="py-2 font-medium">Typical places</th>
              </tr>
            </thead>
            <tbody>
              {ZONES.map((z) => (
                <tr
                  key={z.zone}
                  aria-current={myZone === z.zone ? "true" : undefined}
                  className={cn("border-b border-border align-top last:border-0", myZone === z.zone && "bg-accent-soft")}
                >
                  <th scope="row" className="whitespace-nowrap py-2 pr-3 font-semibold">
                    {z.zone}
                    {myZone === z.zone && (
                      <Badge tone="info" className="ml-2">
                        Your zone
                      </Badge>
                    )}
                  </th>
                  <td className="whitespace-nowrap py-2 pr-3">
                    {formatTemperature(z.minTempF, unit)} to {formatTemperature(z.maxTempF, unit)}
                  </td>
                  <td className="whitespace-nowrap py-2 pr-3">{frostDate(z.lastFrost)}</td>
                  <td className="whitespace-nowrap py-2 pr-3">{frostDate(z.firstFrost)}</td>
                  <td className="py-2 text-muted">{z.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
