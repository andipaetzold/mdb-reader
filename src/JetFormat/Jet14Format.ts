import { GENERAL_SORT_ORDER } from "../SortOrder";
import { jet12Format } from "./Jet12Format";
import { JetFormat } from "./types";

export const jet14Format: JetFormat = {
    ...jet12Format,
    defaultSortOrder: GENERAL_SORT_ORDER,
};
