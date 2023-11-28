import { GENERAL_SORT_ORDER } from "../SortOrder.js";
import { jet12Format } from "./Jet12Format.js";
import type { JetFormat } from "./types.js";

export const jet14Format: JetFormat = {
    ...jet12Format,
    defaultSortOrder: GENERAL_SORT_ORDER,
};
