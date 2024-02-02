import React, { Component, MouseEvent } from "react";
import { Poll } from "./poll";
import { isRecord } from "./record";

type PollResultsProps = { poll: Poll; onBackClick: () => void };
type PollResultsState = {
  now: number;
  result: Map<string, number> | undefined;
};

export class PollResults extends Component<PollResultsProps, PollResultsState> {
  constructor(props: PollResultsProps) {
    super(props);
    this.state = {
      now: Date.now(),
      result: undefined,
    };
  }

  render = (): JSX.Element => {
    if (this.state.result === undefined) {
      return <div>Loading results...</div>;
    }
    const min =
      Math.round((this.state.now - this.props.poll.endTime) / 60 / 100) / 10;
    return (
      <div>
        <h2>{this.props.poll.name}</h2>
        <div>Closed {min} minutes ago...</div>
        {this.renderResult()}
        <button type="button" onClick={this.doBackClick}>
          Back
        </button>
        <button type="button" onClick={this.doRefreshAllClick}>
          Refresh
        </button>
      </div>
    );
  };

  renderResult = (): JSX.Element => {
    const list: JSX.Element[] = [];
    if (this.state.result !== undefined) {
      const total = this.state.result.get("total");
      for (const opt of this.state.result.keys()) {
        if (opt !== "total") {
          const count = this.state.result.get(opt);
          if (count !== undefined && total !== undefined) {
            if (total === 0) {
              list.push(<li key={opt}>0% --- {opt}</li>);
            } else {
              list.push(
                <li key={opt}>
                  {Math.round((count / total) * 1000) / 10}% --- {opt}
                </li>
              );
            }
          }
        }
      }
    }
    return <ul>{list}</ul>;
  };

  componentDidMount = (): void => {
    this.doRefreshAllClick();
  };

  doBackClick = (_: MouseEvent<HTMLButtonElement>): void => {
    this.props.onBackClick(); // tell the parent this was clicked
  };

  doRefreshAllClick = (): void => {
    const url =
      "/api/result" + "?name=" + encodeURIComponent(this.props.poll.name);
    fetch(url)
      .then(this.doResultResp)
      .catch(() => this.doResultError("failed to connect to server"));
  };

  doResultResp = (resp: Response): void => {
    if (resp.status === 200) {
      resp
        .json()
        .then(this.doResultJson)
        .catch(() => this.doResultError("200 response is not JSON"));
    } else if (resp.status === 400) {
      resp
        .text()
        .then(this.doResultError)
        .catch(() => this.doResultError("400 response is not text"));
    } else {
      this.doResultError(`bad status code from /api/result: ${resp.status}`);
    }
  };

  doResultJson = (data: unknown): void => {
    if (!isRecord(data)) {
      console.error("bad data from /api/result: not a record", data);
      return;
    }

    if (!(data.result instanceof Object)) {
      console.error("bad data from /api/result: result is not a map", data);
      return;
    } else {
      const map: Map<string, number> = new Map(Object.entries(data.result));
      this.setState({ result: map, now: Date.now() });
    }
  };

  doResultError = (msg: string): void => {
    console.error(`Error fetching /api/result: ${msg}`);
  };
}
