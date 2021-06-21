import React, { Component } from "react";
import { Select } from "@buffetjs/core";

class CollectionFieldSelect extends Component {

  state = {
    selectedTarget: ""
  };

  componentDidMount() {
    const options = this.fillOptions();
    this.setState({ selectedTarget: options && options[0] });
  }

  onChange(selectedTarget) {
    this.props.onChange(selectedTarget);
    this.setState({ selectedTarget });
  }


  fillOptions() {
    const { models } = this.props;

    const options = models
      .map(element => {
        const collectionName = element.apiID
        return { label: collectionName, value: collectionName };
      })


    return [{ label: "None", value: "none" }, ...options];
  }
  render() {

    return (
      <Select
        name={"targetCollectionField"}
        value={this.state.selectedTarget}
        options={this.fillOptions()}
        onChange={({ target: { value } }) => this.onChange(value)}
      />
    );
  }
}

export default CollectionFieldSelect;
