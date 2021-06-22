import MappingOptions from "./MappingOptions";
import TargetFieldSelect from "./TargetFieldSelect";
import CollectionFieldSelect from "./CollectionFieldSelect";
import {ID_MAPPING} from "../../utils/constants";
import React from "react";

export const ContentCustomRow = ({ row }) => {

  const { fieldName, count, format, minLength, maxLength, meanLength } = row;

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
        {this.props.models && (
          <CollectionFieldSelect
            models={this.props.models}
            onChange={targetCollection => this.setMapping(fieldName, targetCollection, headersMapping.COLLECTION)}
          />
        )}
      </td>
      <td>
        {this.props.models && (
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
