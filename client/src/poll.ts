import { isRecord } from "./record";

// Description of an individual poll
// RI: options.length >= 2
export type Poll = {
  readonly name: string;
  readonly endTime: number; // ms since epoch
  readonly options: string[];
};

/**
 * Parses unknown data into a Poll. Will log an error and return undefined
 * if it is not a valid Poll.
 * @param val unknown data to parse into a Poll
 * @return Poll if val is a valid Poll and undefined otherwise
 */
export const parsePoll = (val: unknown): undefined | Poll => {
  if (!isRecord(val)) {
    console.error("not a poll", val);
    return undefined;
  }
  if (typeof val.name !== "string") {
    console.error("not an poll: missing 'name'", val);
    return undefined;
  }
  if (
    typeof val.endTime !== "number" ||
    val.endTime < 0 ||
    isNaN(val.endTime)
  ) {
    console.error("not a poll: missing or invalid 'endTime'", val);
    return undefined;
  }
  if (!Array.isArray(val.options) || val.options.length < 2) {
    console.error("not a poll: missing or invalid 'options'", val);
    return undefined;
  }
  return { name: val.name, endTime: val.endTime, options: val.options };
};
