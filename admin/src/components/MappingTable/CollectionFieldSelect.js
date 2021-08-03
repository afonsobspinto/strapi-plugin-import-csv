import React, { Component } from "react";
import { Select } from "@buffetjs/core";
import {NONE} from "../../utils/constants";

class CollectionFieldSelect extends Component {

  state = {
    selectedTarget: ""
  };

  componentDidMount() {
    this.setDefaultOption(this.getDefaultSelectionBasedOnName())
  }

  onChange(selectedTarget) {
    this.props.onChange(selectedTarget);
    this.setState({ selectedTarget });
  }

  getDefaultSelectionBasedOnName() {
    const {fieldName, model, mapping} = this.props
    if(mapping[fieldName].destination !== 'none'){
      let target = model.schema.attributes[fieldName]
      return target ? target.target: null
    }
    return null
  }

  fillOptions() {
    const { models } = this.props;
    const options = models
      .map(element => {
        const collectionName = element.apiID
        return { label: collectionName, value: collectionName };
      })
    return [NONE, ...options];
  }

  setDefaultOption(target) {
    if (target) {
      const targetId = target.split('.')[1]
      this.onChange(targetId)
      this.setState({selectedTarget: targetId});
    }
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
