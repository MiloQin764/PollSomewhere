import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";

// Require type checking of request body.
type SafeRequest = Request<ParamsDictionary, {}, Record<string, unknown>>;
type SafeResponse = Response; // only writing, so no need to check

// Description of an individual poll
// RI: options.length >= 2
export type Poll = {
  readonly name: string;
  readonly endTime: number; // ms since epoch
  readonly options: string[];
};
/** A map that stores poll details with their names */
const pollDetails: Map<string, Poll> = new Map();
/** A map that stores who votes for which option with poll names */
const pollResults: Map<string, Map<string, string>> = new Map();

/**
 * Create a new poll with the given list of options and closing in the given
 * number of minutes. Returns a unique ID for the poll.
 * @param req The request object
 * @param res The response object
 */
export const dummy = (req: SafeRequest, res: SafeResponse): void => {
  const name = req.query.name;
  if (typeof name !== "string" || name.length === 0) {
    res.status(400).send('missing or invalid "name" parameter');
    return;
  }

  res.send({ msg: `Hi, ${name}!` });
};

/**
 * Create a new poll with the given list of options and closing in the given
 * number of minutes. Returns a unique ID for the poll.
 * @param req The request object
 * @param res The response object
 */
export const addPoll = (req: SafeRequest, res: SafeResponse): void => {
  const name = req.body.name;
  if (typeof name !== "string" || name.length === 0) {
    res.status(400).send('missing or invalid "name" parameter');
    return;
  } else if (pollDetails.has(name) || pollResults.has(name)) {
    res.send({ added: false });
    return;
  }
  const minutes = req.body.minutes;
  if (typeof minutes !== "number") {
    res.status(400).send(`'minutes' is not a number: ${minutes}`);
    return;
  } else if (isNaN(minutes) || minutes < 1 || Math.round(minutes) !== minutes) {
    res.status(400).send(`'minutes' is not a positive integer: ${minutes}`);
    return;
  }
  const options = req.body.options;
  if (!Array.isArray(options)) {
    res.status(400).send('"options" is not an array');
    return;
  } else if (options.length < 2) {
    res
      .status(400)
      .send(`'options' has length < 2, options.length: ${options.length}`);
    return;
  }
  const poll: Poll = {
    name: name,
    endTime: Date.now() + minutes * 60 * 1000,
    options: options,
  };
  pollDetails.set(name, poll);

  const result: Map<string, string> = new Map();
  pollResults.set(name, result);

  res.send({ added: true, poll: poll });
};

// Sort polls with the ones finishing soonest first, but with all those that
// are completed after those that are not and in reverse order by end time.
const comparePolls = (a: Poll, b: Poll): number => {
  const now: number = Date.now();
  const endA = now <= a.endTime ? a.endTime : 1e15 - a.endTime;
  const endB = now <= b.endTime ? b.endTime : 1e15 - b.endTime;
  return endA - endB;
};

/**
 * Returns a list of all the auctions, sorted so that the ongoing auctions come
 * first, with the ones about to end listed first, and the completed ones after,
 * with the ones completed more recently
 * @param _req the request
 * @param res the response
 */
export const list = (_req: SafeRequest, res: SafeResponse): void => {
  const vals = Array.from(pollDetails.values());
  vals.sort(comparePolls);
  res.send({ polls: vals });
};

/** Returns the current poll array for testing list */
export const getPollDetails = (): Poll[] => {
  const vals = Array.from(pollDetails.values());
  vals.sort(comparePolls);
  return vals;
};

/** Record voter name and their selected option in pollResults */
export const vote = (req: SafeRequest, res: SafeResponse): void => {
  const name = req.body.name;
  if (typeof name !== "string" || name.length === 0) {
    res.status(400).send('missing or invalid "name" parameter');
    return;
  } else if (pollResults.get(name) === undefined) {
    res.status(400).send(`poll does not exist ${name}`);
    return;
  }
  const voterName = req.body.voterName;
  if (typeof voterName !== "string" || voterName.length === 0) {
    res.status(400).send('missing or invalid "voterName" parameter');
    return;
  }
  const option = req.body.option;
  if (
    typeof option !== "string" ||
    !pollDetails.get(name)?.options.includes(option)
  ) {
    res.status(400).send('missing or invalid "option" parameter');
    return;
  }
  const map = pollResults.get(name);
  if (map !== undefined) {
    if (map.has(voterName)) {
      res.send({ replaced: true });
    } else {
      res.send({ replaced: false });
    }
    map.set(voterName, option);
    pollResults.set(name, map);
  }
};

/** Calculate result of a poll and send back a map in which keys are options and values are times selected of an option */
export const getResult = (req: SafeRequest, res: SafeResponse): void => {
  const name = first(req.query.name);
  if (name === undefined) {
    res.status(400).send('missing "name" parameter');
    return;
  }
  const mapVoterOpt = pollResults.get(name);
  if (mapVoterOpt === undefined) {
    res.status(400).send(`poll does not exist with name: ${name}`);
    return;
  }
  const mapOptCount: Map<string, number> = new Map();
  mapOptCount.set("total", 0);
  const poll = pollDetails.get(name);
  if (poll !== undefined) {
    for (const opt of poll.options) {
      mapOptCount.set(opt, 0);
    }
  }
  for (const opt of mapVoterOpt.values()) {
    const oldTotal = mapOptCount.get("total");
    if (oldTotal !== undefined) {
      mapOptCount.set("total", oldTotal + 1);
    }
    const oldCount = mapOptCount.get(opt);
    if (oldCount !== undefined) {
      mapOptCount.set(opt, oldCount + 1);
    }
  }
  res.send({ result: Object.fromEntries(mapOptCount) });
};

/** Clear all polls*/
export const clear = (_req: SafeRequest, res: SafeResponse): void => {
  pollDetails.clear();
  pollResults.clear();
  res.send({ clear: true });
};
// Helper to return the (first) value of the parameter if any was given.
// (This is mildly annoying because the client can also give mutiple values,
// in which case, express puts them into an array.)
const first = (param: unknown): string | undefined => {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === "string") {
    return param;
  } else {
    return undefined;
  }
};
