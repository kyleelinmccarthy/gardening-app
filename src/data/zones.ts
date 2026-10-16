import type { ZoneInfo } from "@/domain/types";

/**
 * USDA Plant Hardiness Zones 1-13. Each zone spans 10°F of average annual
 * extreme minimum temperature. Frost dates are rough national averages for
 * typical locations in each zone; local microclimates vary by weeks.
 */
export const ZONES: ZoneInfo[] = [
  { zone: 1, minTempF: -60, maxTempF: -50, lastFrost: "06-15", firstFrost: "08-20", description: "Extreme cold with a very short growing season. Interior Alaska and northern Canada." },
  { zone: 2, minTempF: -50, maxTempF: -40, lastFrost: "06-01", firstFrost: "09-01", description: "Very cold winters. Fairbanks AK, northern Minnesota and the Canadian Prairies." },
  { zone: 3, minTempF: -40, maxTempF: -30, lastFrost: "05-20", firstFrost: "09-15", description: "Harsh winters. Northern Minnesota, Montana and northern Maine." },
  { zone: 4, minTempF: -30, maxTempF: -20, lastFrost: "05-15", firstFrost: "09-25", description: "Cold winters. Minneapolis MN, Duluth MN and the Wyoming plains." },
  { zone: 5, minTempF: -20, maxTempF: -10, lastFrost: "05-10", firstFrost: "10-05", description: "Cold winters, warm summers. Chicago IL, Boston MA and Des Moines IA." },
  { zone: 6, minTempF: -10, maxTempF: 0, lastFrost: "04-30", firstFrost: "10-15", description: "Moderate winters. New York NY, St. Louis MO and Denver CO." },
  { zone: 7, minTempF: 0, maxTempF: 10, lastFrost: "04-15", firstFrost: "10-25", description: "Mild winters, long summers. Washington DC, Nashville TN and Oklahoma City OK." },
  { zone: 8, minTempF: 10, maxTempF: 20, lastFrost: "03-25", firstFrost: "11-10", description: "Mild winters. Atlanta GA, Dallas TX and Seattle WA." },
  { zone: 9, minTempF: 20, maxTempF: 30, lastFrost: "02-20", firstFrost: "12-01", description: "Warm with occasional frost. Houston TX, Sacramento CA and Orlando FL (north)." },
  { zone: 10, minTempF: 30, maxTempF: 40, lastFrost: null, firstFrost: null, description: "Frost is rare and light. Phoenix AZ, Los Angeles CA and Tampa FL." },
  { zone: 11, minTempF: 40, maxTempF: 50, lastFrost: null, firstFrost: null, description: "Frost-free. Miami FL, Key West FL and lowland Hawaii." },
  { zone: 12, minTempF: 50, maxTempF: 60, lastFrost: null, firstFrost: null, description: "Tropical, frost-free. Southern tip of Florida, Puerto Rico and Hawaii lowlands." },
  { zone: 13, minTempF: 60, maxTempF: 70, lastFrost: null, firstFrost: null, description: "Hot tropical, frost-free. Puerto Rico coastal areas and Pacific territories." },
];
