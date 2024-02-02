import React, { ChangeEvent, Component, MouseEvent } from "react";
import { isRecord } from "./record";
import { Poll, parsePoll } from "./poll";

type NewPollProps = {
  onBackClick: () => void;
  onCreateClick: (poll: Poll) => void;
};
type NewPollState = {
  name: string;
  minutes: string;
  options: string;
  error: string;
};

export class NewPoll extends Component<NewPollProps, NewPollState> {
  constructor(props: NewPollProps) {
    super(props);
    this.state = { name: "", minutes: "5", options: "", error: "" };
  }

  render = (): JSX.Element => {
    return (
      <div>
        <h2> New Poll: </h2>
        <div>
          <label htmlFor="name">Name: </label>
          <input
            id="name"
            type="text"
            value={this.state.name}
            onChange={this.doNameChange}
          ></input>
        </div>
        <div>
          <label htmlFor="minutes">Minutes: </label>
          <input
            id="minutes"
            type="number"
            value={this.state.minutes}
            onChange={this.doMinutesChange}
          ></input>
        </div>
        <div>
          <label htmlFor="options">
            Options (one per line: minimum 2 lines):{" "}
          </label>
          <br />
          <textarea
            id="options"
            rows={4}
            cols={40}
            value={this.state.options}
            onChange={this.doOptionsChange}
          ></textarea>
        </div>
        <button type="button" onClick={this.doCreateClick}>
          Create
        </button>
        <button type="button" onClick={this.doBackClick}>
          Back
        </button>
        {this.renderError()}
      </div>
    );
  };
  renderError = (): JSX.Element => {
    if (this.state.error.length === 0) {
      return <div></div>;
    } else {
      const style = {
        width: "300px",
        backgroundColor: "rgb(246,194,192)",
        border: "1px solid rgb(137,66,61)",
        borderRadius: "5px",
        padding: "5px",
      };
      return (
        <div style={{ marginTop: "15px" }}>
          <span style={style}>
            <b>Error</b>: {this.state.error}
          </span>
        </div>
      );
    }
  };

  doCreateClick = (_: MouseEvent<HTMLButtonElement>): void => {
    // Verify that the user entered all required information.
    if (
      this.state.name.trim().length === 0 ||
      this.state.minutes.trim().length === 0 ||
      this.state.options.trim().length === 0
    ) {
      this.setState({ error: "a required field is missing." });
      return;
    }

    // Verify that minutes is a number.
    const minutes = parseFloat(this.state.minutes);
    if (isNaN(minutes) || minutes < 1 || Math.floor(minutes) !== minutes) {
      this.setState({ error: "minutes is not a positive integer" });
      return;
    }

    // Ignore this request if less than 2 options provided
    const options = this.state.options
      .split("\n")
      .filter((opt) => opt.length > 0);
    if (options.length < 2) {
      this.setState({ error: "need more than 2 options" });
      return;
    }
    const body = { name: this.state.name, minutes: minutes, options: options };
    fetch("/api/add", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })
      .then(this.doCreateResp)
      .catch(() => this.doCreateError("failed to connect to server"));
  };

  doCreateResp = (resp: Response): void => {
    if (resp.status === 200) {
      resp
        .json()
        .then(this.doCreateJson)
        .catch(() => this.doCreateError("200 response is not JSON"));
    } else if (resp.status === 400) {
      resp
        .text()
        .then(this.doCreateError)
        .catch(() => this.doCreateError("400 response is not text"));
    } else {
      this.doCreateError(`bad status code from /api/add: ${resp.status}`);
    }
  };

  doCreateJson = (data: unknown): void => {
    if (!isRecord(data)) {
      console.error("bad data from /api/add: not a record", data);
      return;
    }
    if (typeof data.added !== "boolean") {
      console.error(
        "bad data type for 'added' from /api/add: not a boolean",
        data.added
      );
      return;
    }
    if (!data.added) {
      this.setState({ error: "Poll name already exists!" });
    } else {
      if (!isRecord(data.poll)) {
        console.error("bad poll from /api/add: not a record", data.poll);
        return;
      }
      const poll = parsePoll(data.poll);
      if (poll !== undefined) {
        this.props.onCreateClick(poll);
      }
    }
  };

  doCreateError = (msg: string): void => {
    console.error(`Error fetching /api/add: ${msg}`);
  };

  doNameChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ name: evt.target.value, error: "" });
  };
  doMinutesChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ minutes: evt.target.value, error: "" });
  };
  doOptionsChange = (evt: ChangeEvent<HTMLTextAreaElement>): void => {
    this.setState({ options: evt.target.value, error: "" });
  };
  doBackClick = (_: MouseEvent<HTMLButtonElement>): void => {
    this.props.onBackClick(); // tell the parent this was clicked
  };
}
