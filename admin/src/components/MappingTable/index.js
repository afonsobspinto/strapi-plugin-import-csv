import React, { Component } from "react";
import PropTypes from "prop-types";
import MappingOptions from "./MappingOptions";
import TargetFieldSelect from "./TargetFieldSelect";
import CollectionFieldSelect from "./CollectionFieldSelect";
import {ID_MAPPING, IMPORT_STATE} from "../../utils/constants"
import _, {get, has} from "lodash";
import { Table } from "@buffetjs/core";
import {
  Bool as BoolIcon,
  Json as JsonIcon,
  Text as TextIcon,
  NumberIcon,
  Email as EmailIcon,
  Calendar as DateIcon,
  RichText as XmlIcon
} from "@buffetjs/icons";

const headersMapping = {
  DESTINATION: "destination",
  COLLECTION: "collection",
  COLLECTION_COL: "collectionCol",
}

class MappingTable extends Component {


  state = { mapping: {} };

  getRelatedModel = (fieldName) => {
    const {mapping} = this.state
    const {models} = this.props
    const modelName = get(mapping, [fieldName, headersMapping.COLLECTION], null)
    if (!modelName || !models) return {};
    return models.find(model => model.apiID === modelName);
  };

  CustomRow = ({ row, importState }) => {

    const { fieldName, count, format, minLength, maxLength, meanLength } = row;
    const showExtraCols = importState === IMPORT_STATE.relations
    return (
      <tr style={{ paddingTop: 18 }}>
        <td>{fieldName}</td>
        <td>
          <p>{count}</p>
        </td>
        <td>
          {format === "string" && <TextIcon fill="#fdd835" />}
          {format === "number" && <NumberIcon fill="#fdd835" />}
          {format === "boolean" && <BoolIcon fill="#fdd835" />}
          {format === "object" && <JsonIcon fill="#fdd835" />}
          {format === "email" && <EmailIcon fill="#fdd835" />}
          {format === "date" && <DateIcon fill="#fdd835" />}
          {format === "xml" && <XmlIcon fill="#fdd835" />}
          <p>{format}</p>
        </td>
        <td>
          <span>{minLength}</span>
        </td>
        <td>
          <p>{maxLength}</p>
        </td>
        <td>
          <p>{meanLength}</p>
        </td>
        <td>
          <MappingOptions
            targetModel={this.props.targetModel}
            stat={row}
            onChange={this.changeMappingOptions(row)}
          />
        </td>
        <td>
          {this.props.targetModel && (
            <TargetFieldSelect
              targetModel={this.props.targetModel}
              onChange={targetField => this.setMapping(fieldName, targetField, headersMapping.DESTINATION)}
            />
          )}
        </td>
        <td>
          {showExtraCols && this.props.models && (
            <CollectionFieldSelect
              models={this.props.models}
              onChange={targetCollection => this.setMapping(fieldName, targetCollection, headersMapping.COLLECTION)}
            />
          )}
        </td>
        <td>
          {showExtraCols && this.props.models && (
            <TargetFieldSelect
              targetModel={this.getRelatedModel(fieldName)}
              onChange={targetCollection => this.setMapping(fieldName, targetCollection, headersMapping.COLLECTION_COL)}
              defaultLabel={ID_MAPPING}
            />
          )}
        </td>
      </tr>
    );
  };
  changeMappingOptions = stat => options => {
    let newState = _.cloneDeep(this.state);
    for (let key in options) {
      _.set(newState, `mapping[${stat.fieldName}][${key}]`, options[key]);
    }
    this.setState(newState, () => this.props.onChange(this.state.mapping));
  };

  setMapping = (source, targetField, mapping) => {
    const state = _.set(
      this.state,
      `mapping[${source}][${mapping}]`,
      targetField
    );
    this.setState(state, () => this.props.onChange(this.state.mapping));
  };

  getHeaders = () => {
    const {importState } = this.props;

    return importState === IMPORT_STATE.content ? [
      { name: "Field", value: "fieldName" },
      { name: "Count", value: "count" },
      { name: "Format", value: "format" },
      { name: "Min Length", value: "minLength" },
      { name: "Max Length", value: "maxLength" },
      { name: "Mean Length", value: "meanLength" },
      { name: "Options", value: "options" },
      { name: "Destination", value: "destination" }
    ] : [
      { name: "Field", value: "fieldName" },
      { name: "Count", value: "count" },
      { name: "Format", value: "format" },
      { name: "Min Length", value: "minLength" },
      { name: "Max Length", value: "maxLength" },
      { name: "Mean Length", value: "meanLength" },
      { name: "Options", value: "options" },
      { name: "Destination Column", value: headersMapping.DESTINATION },
      { name: "Related Collection", value: headersMapping.COLLECTION},
      { name: "Related Column", value: headersMapping.COLLECTION_COL }
    ];
  }

  getCustomRow = ({ row }) => {
    const { importState} = this.props;
    return this.CustomRow({ row, importState })
  }

  render() {
    const { analysis} = this.props;
    const props = {
      title: "Field Mapping",
      subtitle:
        "Configure the Relationship between CSV Fields and Content type Fields"
    };
    const headers = this.getHeaders()
    const items = [...analysis.fieldStats];
    return (
      <Table
        {...props}
        headers={headers}
        rows={items}
        customRow={this.getCustomRow}
      />

    );
  }
}

MappingTable.propTypes = {
  analysis: PropTypes.object.isRequired,
  targetModel: PropTypes.object,
  models: PropTypes.array,
  onChange: PropTypes.func
};

export default MappingTable;
