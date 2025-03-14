import { Category } from "apis/type/Category";
import { Tool } from "apis/type/Tool";

export interface Item {
  id: number;
  name: string;
  level: number;
  craftingPrice: number;
  tool: Tool;
  category: Category;
  name1: string;
  base1: number;
  count1: number;
  name2?: string;
  base2?: number;
  count2?: number;
  name3?: string;
  base3?: number;
  count3?: number;
  name4?: string;
  base4?: number;
  count4?: number;
  name5?: string;
  base5?: number;
  count5?: number;
}
