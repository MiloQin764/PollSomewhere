import React, { Component, MouseEvent } from "react";
import { Poll } from "./poll";
import { isRecord } from "./record";

type PollListProps = {
  onNewPollClick: () => void;
  onPollResultsClick: (poll: Poll) => void;
  onPollDetailsClick: (poll: Poll) => void;
};
type PollListState = {
  polls: Poll[] | undefined;
  now: number;
};

export class PollList extends Component<PollListProps, PollListState> {
  constructor(props: PollListProps) {
    super(props);
    this.state = { polls: undefined, now: Date.now() };
  }

  render = (): JSX.Element => {
    return (
      <div>
        <h1>Current Polls:</h1>
        {this.renderPolls()}
        <button type="button" onClick={this.doRefreshAllClick}>
          Refresh
        </button>
        <button type="button" onClick={this.props.onNewPollClick}>
          New Poll
        </button>
        <button type="button" onClick={this.doClearClick}>
          Clear All Polls
        </button>
      </div>
    );
  };
  renderPolls = (): JSX.Element => {
    const pollsOngoing: JSX.Element[] = [];
    const pollsCompleted: JSX.Element[] = [];
    if (this.state.polls === undefined) {
      return <p>Loading To-Do list...</p>;
    } else {
      for (const poll of this.state.polls) {
        if (poll !== undefined) {
          const min =
            Math.round((this.state.now - poll.endTime) / 60 / 100) / 10;
          if (this.state.now - poll.endTime > 0) {
            const desc = <span> – closed {min} minutes ago</span>;
            pollsCompleted.push(
              <li key={poll.name}>
                <a
                  href="#"
                  onClick={(evt) => this.doPollResultsClick(evt, poll)}
                >
                  {poll.name}
                </a>
                {desc}
              </li>
            );
          } else {
            const desc = <span> – {-min} minutes remaining</span>;
            pollsOngoing.push(
              <li key={poll.name}>
                <a
                  href="#"
                  onClick={(evt) => this.doPollDetailsClick(evt, poll)}
                >
                  {poll.name}
                </a>
                {desc}
              </li>
            );
          }
        }
      }
    }
    if (pollsOngoing.length === 0) {
      pollsOngoing.push(<li key={0}>There are no polls open for now...</li>);
    }
    if (pollsCompleted.length === 0) {
      pollsCompleted.push(
        <li key={0}>There are no polls closed for now...</li>
      );
    }
    return (
      <div>
        <h2>Still open:</h2>
        <ul>{pollsOngoing}</ul>
        <h2>Already closed:</h2>
        <ul>{pollsCompleted}</ul>
      </div>
    );
  };

  componentDidMount = (): void => {
    this.doRefreshAllClick();
  };

  doRefreshAllClick = (): void => {
    fetch("/api/list")
      .then(this.doListResp)
      .catch(() => this.doListError("failed to connect to server"));
  };

  doListResp = (resp: Response): void => {
    if (resp.status === 200) {
      resp
        .json()
        .then(this.doListJson)
        .catch(() => this.doListError("200 response is not JSON"));
    } else if (resp.status === 400) {
      resp
        .text()
        .then(this.doListError)
        .catch(() => this.doListError("400 response is not text"));
    } else {
      this.doListError(`bad status code from /api/list: ${resp.status}`);
    }
  };

  doListJson = (data: unknown): void => {
    if (!isRecord(data)) {
      console.error("bad data from /api/list: not a record", data);
      return;
    }

    if (!Array.isArray(data.polls)) {
      console.error("bad data from /api/list: polls is not an array", data);
      return;
    } else {
      this.setState({ polls: data.polls, now: Date.now() });
    }
  };

  doListError = (msg: string): void => {
    console.error(`Error fetching /api/list: ${msg}`);
  };

  doClearClick = (): void => {
    fetch("/api/clear")
      .then(this.doClearResp)
      .catch(() => this.doClearError);
  };

  doClearResp = (res: Response): void => {
    if (res.status === 200) {
      res
        .json()
        .then(this.doClearJson)
        .catch(() => this.doClearError("200 response is not valid JSON"));
    } else if (res.status === 400) {
      res
        .text()
        .then(this.doClearError)
        .catch(() => this.doClearError("400 respose is not text"));
    } else {
      this.doClearError(`bad status code ${res.status}`);
    }
  };

  doClearJson = (val: unknown): void => {
    if (!isRecord(val)) {
      this.doClearError(`bad type for val ${typeof val}`);
    } else {
      this.doRefreshAllClick();
    }
  };

  doClearError = (msg: string): void => {
    console.log(`fetch of /api/clear failed: ${msg}`);
  };

  doPollResultsClick = (
    evt: MouseEvent<HTMLAnchorElement>,
    poll: Poll
  ): void => {
    evt.preventDefault();
    this.props.onPollResultsClick(poll);
  };

  doPollDetailsClick = (
    evt: MouseEvent<HTMLAnchorElement>,
    poll: Poll
  ): void => {
    evt.preventDefault();
    this.props.onPollDetailsClick(poll);
  };
}
