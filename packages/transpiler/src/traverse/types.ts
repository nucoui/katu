import type * as t from "@babel/types";

export type SignalInfo = { name: string; setter: string; init: t.Expression };
export type EventBinding = { selector: string; event: string; handler: string };
