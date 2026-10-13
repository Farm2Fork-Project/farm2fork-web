import type { Article } from "../../types";
import { BUY_DIRECT_UR, STORE_PRODUCE_UR } from "./buying-and-storing";
import { SELL_ONLINE_UR, SEASONAL_UR } from "./farming";
import { MIDDLEMEN_UR, POST_HARVEST_UR } from "./supply-chain";
import { HOW_BLOCKCHAIN_WORKS_UR, WHAT_IS_TRACEABILITY_UR } from "./traceability";

/** Same order as the English GUIDES (newest first); every English guide has one entry here. */
export const GUIDES_UR: Article[] = [
  BUY_DIRECT_UR,
  WHAT_IS_TRACEABILITY_UR,
  HOW_BLOCKCHAIN_WORKS_UR,
  MIDDLEMEN_UR,
  POST_HARVEST_UR,
  SEASONAL_UR,
  SELL_ONLINE_UR,
  STORE_PRODUCE_UR,
];
