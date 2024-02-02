import React, { ChangeEvent, Component, MouseEvent } from "react";
import { Poll } from "./poll";
import { isRecord } from "./record";

type PollDetailsProps = {
  poll: Poll;
  onBackClick: () => void;
  onResultClick: (poll: Poll) => void;
};
type PollDetailsState = {
  now: number;
  selectedOpt: string;
  voterName: string;
  msg: string;
  error: string;
};

export class PollDetails extends Component<PollDetailsProps, PollDetailsState> {
  constructor(props: PollDetailsProps) {
    super(props);
    this.state = {
      now: Date.now(),
      voterName: "",
      msg: "",
      selectedOpt: "",
      error: "",
    };
  }

  render = (): JSX.Element => {
    const min =
      Math.round((this.state.now - this.props.poll.endTime) / 60 / 100) / 10;
    return (
      <div>
        <h2>{this.props.poll.name}</h2>
        <div>Closes in {-min} minutes ...</div>
        {this.renderOptionsToRadio()}
        <div>
          <label htmlFor="voterName">Voter Name: </label>
          <input
            id="voterName"
            type="text"
            value={this.state.voterName}
            onChange={this.doVoterNameChange}
          ></input>
        </div>
        <button type="button" onClick={this.doBackClick}>
          Back
        </button>
        <button type="button" onClick={this.doRefreshClick}>
          Refresh
        </button>
        <button type="button" onClick={this.doVoteClick}>
          Vote
        </button>
        <div>{this.state.msg}</div>
        {this.renderError()}
      </div>
    );
  };

  renderOptionsToRadio = (): JSX.Element => {
    const radioOptions: JSX.Element[] = [];
    // Inv: radioOptions = array of selectable radio HTML element for each of this.props.poll.options[0 .. i-1]
    for (let i = 0; i < this.props.poll.options.length; i++) {
      const option = this.props.poll.options[i];
      radioOptions.push(
        <div key={i}>
          <input
            type="radio"
            id={option}
            name="options"
            checked={this.state.selectedOpt === option}
            value={option}
            onChange={this.doOptionChange}
          />
          <label htmlFor={option}>{option}</label>
        </div>
      );
    }
    return <ul>{radioOptions}</ul>;
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

  doVoteClick = (_: MouseEvent<HTMLButtonElement>): void => {
    // Verify that the user entered required information.
    if (this.state.voterName.trim().length === 0) {
      this.setState({ now: Date.now(), error: "Voter name required", msg: "" });
      return;
    }
    if (this.state.selectedOpt.trim().length === 0) {
      this.setState({
        now: Date.now(),
        error: "Please select an option",
        msg: "",
      });
      return;
    }
    const body = {
      name: this.props.poll.name,
      voterName: this.state.voterName,
      option: this.state.selectedOpt,
    };
    fetch("/api/vote", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })
      .then(this.doVoteResp)
      .catch(() => this.doVoteError("failed to connect to server"));
  };

  doVoteResp = (resp: Response): void => {
    if (resp.status === 200) {
      resp
        .json()
        .then(this.doVoteJson)
        .catch(() => this.doVoteError("200 response is not JSON"));
    } else if (resp.status === 400) {
      resp
        .text()
        .then(this.doVoteError)
        .catch(() => this.doVoteError("400 response is not text"));
    } else {
      this.doVoteError(`bad status code from /api/vote: ${resp.status}`);
    }
  };

  doVoteJson = (data: unknown): void => {
    if (!isRecord(data)) {
      console.error("bad data from /api/vote: not a record", data);
      return;
    }
    if (typeof data.replaced !== "boolean") {
      console.error(
        "bad data type for 'replaced' from /api/replaced: not a boolean",
        data.added
      );
      return;
    }
    if (data.replaced) {
      this.setState({
        now: Date.now(),
        msg: `Replaced vote of "${this.state.voterName}" with "${this.state.selectedOpt}" `,
        error: "",
      });
    } else {
      this.setState({
        now: Date.now(),
        msg: `Recorded vote of "${this.state.voterName}" as "${this.state.selectedOpt}" `,
        error: "",
      });
    }
  };

  doVoteError = (msg: string): void => {
    console.error(`Error fetching /api/vote: ${msg}`);
  };

  doRefreshClick = (_: MouseEvent<HTMLButtonElement>): void => {
    if (this.props.poll.endTime - Date.now() <= 0) {
      this.props.onResultClick(this.props.poll);
    }
    this.setState({
      now: Date.now(),
      voterName: "",
      msg: "",
      selectedOpt: "",
      error: "",
    });
  };

  doVoterNameChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ now: Date.now(), voterName: evt.target.value });
  };

  doOptionChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ now: Date.now(), selectedOpt: evt.target.value });
  };

  doBackClick = (_: MouseEvent<HTMLButtonElement>): void => {
    this.props.onBackClick(); // tell the parent this was clicked
  };
}
