import React, { Component } from "react";
import { Poll } from "./poll";
import { PollList } from "./PollList";
import { NewPoll } from "./NewPoll";
import { PollDetails } from "./PollDetails";
import { PollResults } from "./PollResults";

// Indicates which page to show. If it is the details page, the argument
// includes the specific poll to show the details of.
type Page =
  | "list"
  | "new"
  | { kind: "details"; poll: Poll }
  | { kind: "results"; poll: Poll };

type AppState = { page: Page };

const DEBUG: boolean = true;

// Top-level component that displays the appropriate page.
export class App extends Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = { page: "list" };
  }

  render = (): JSX.Element => {
    if (this.state.page === "list") {
      return (
        <PollList
          onNewPollClick={this.doNewPollClick}
          onPollDetailsClick={this.doPollDetailsClick}
          onPollResultsClick={this.doPollResultsClick}
        />
      );
    } else if (this.state.page === "new") {
      return (
        <NewPoll
          onBackClick={this.doBackClick}
          onCreateClick={this.doPollDetailsClick}
        />
      );
    } else if (this.state.page.kind === "details") {
      return (
        <PollDetails
          onResultClick={this.doPollResultsClick}
          onBackClick={this.doBackClick}
          poll={this.state.page.poll}
        />
      );
    } else {
      return (
        <PollResults
          onBackClick={this.doBackClick}
          poll={this.state.page.poll}
        />
      );
    }
  };

  doNewPollClick = (): void => {
    this.setState({ page: "new" });
  };

  doPollDetailsClick = (poll: Poll): void => {
    this.setState({ page: { kind: "details", poll: poll } });
  };

  doPollResultsClick = (poll: Poll): void => {
    this.setState({ page: { kind: "results", poll: poll } });
  };

  doBackClick = (): void => {
    if (DEBUG) console.debug("set state to list");
    this.setState({ page: "list" });
  };
}
