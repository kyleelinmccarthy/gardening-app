import type { Plant } from "@/domain/types";
import { VEGETABLES } from "./vegetables";
import { HERBS } from "./herbs";
import { FRUITS } from "./fruits";
import { SUCCULENTS } from "./succulents";
import { FLOWERS } from "./flowers";
import { HOUSEPLANTS } from "./houseplants";

export const BUILTIN_PLANTS: readonly Plant[] = [
  ...VEGETABLES,
  ...HERBS,
  ...FRUITS,
  ...SUCCULENTS,
  ...FLOWERS,
  ...HOUSEPLANTS,
];
