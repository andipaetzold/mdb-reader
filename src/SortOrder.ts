import type { SortOrder } from "./types.js";

const GENERAL_SORT_ORDER_VALUE = 1033;

export const GENERAL_97_SORT_ORDER = Object.freeze({ value: GENERAL_SORT_ORDER_VALUE, version: -1 } as SortOrder);
export const GENERAL_LEGACY_SORT_ORDER = Object.freeze({ value: GENERAL_SORT_ORDER_VALUE, version: 0 } as SortOrder);
export const GENERAL_SORT_ORDER = Object.freeze({ value: GENERAL_SORT_ORDER_VALUE, version: 1 } as SortOrder);
