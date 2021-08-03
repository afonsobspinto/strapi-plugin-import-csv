import React, {Component} from "react";
import {Select} from "@buffetjs/core";
import {get} from "lodash";
import PropTypes from "prop-types";
import {NONE} from "../../utils/constants";


class TargetFieldSelect extends Component {

  constructor(props) {
    super(props);
    this.state = {selectedTarget: ""};
  }

  componentDidMount() {
    const {defaultLabel} = this.props
    const defaultSelection = defaultLabel ? defaultLabel : this.getDefaultSelectionBasedOnName().value
    this.setDefaultOption(defaultSelection)
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if(prevProps.isRelations !== this.props.isRelations){
      const defaultSelection = this.props.defaultLabel ? this.props.defaultLabel : this.getDefaultSelectionBasedOnName().value
      this.setDefaultOption(defaultSelection)
    }
  }

  getDefaultSelectionBasedOnName() {
    const {fieldName, isRelations, targetModel} = this.props
    const schemaAttributes = get(targetModel, ["schema", "attributes"], {});
    const options = this.fillOptions(schemaAttributes);
    const filteredOptions = options.filter((opt) => {
      if(opt == NONE){
        return false
      }
      if(isRelations){
        return schemaAttributes[opt.label].nature !== undefined
      }
      return schemaAttributes[opt.label].nature === undefined
    })
    let target = filteredOptions.find(opt => opt.label === fieldName)
    return target ? target : options[0]
  }

  setDefaultOption(target) {
    if (target) {
      this.onChange(target)
      this.setState({selectedTarget: target});
    }
  }

  onChange(selectedTarget) {
    this.props.onChange(selectedTarget);
    this.setState({selectedTarget});
  }

  fillOptions(schemaAttributes) {
    const options = Object.keys(schemaAttributes)
      .map(fieldName => {
        return {label: fieldName, value: fieldName};
      })

    return [NONE, ...options];
  }

  render() {
    const {selectedTarget} = this.state
    const {targetModel} = this.props
    const schemaAttributes = get(targetModel, ["schema", "attributes"], {});
    return (
      <Select
        name={"targetField"}
        value={selectedTarget}
        options={this.fillOptions(schemaAttributes)}
        onChange={({target: {value}}) => this.onChange(value)}
      />
    );
  }
}

export default TargetFieldSelect;
