import React, {Component} from "react";
import {Select} from "@buffetjs/core";
import {get} from "lodash";
import PropTypes from "prop-types";

const NONE = {label: "None", value: "none"}

class TargetFieldSelect extends Component {

  constructor(props) {
    super(props);
    this.state = {selectedTarget: ""};
  }

  componentDidMount() {
    this.setDefaultOption(this.matchOptionName())
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if(prevProps.isRelations !== this.props.isRelations){
      this.setDefaultOption(this.matchOptionName())
    }
  }

  matchOptionName() {
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
      this.onChange(target.value)
    }
    this.setState({selectedTarget: target.value});
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

TargetFieldSelect.defaultProps = {
  defaultLabel: 'None'
};

TargetFieldSelect.propTypes = {
  defaultLabel: PropTypes.string
};

export default TargetFieldSelect;
