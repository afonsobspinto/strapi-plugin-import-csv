import React, {memo, Component} from "react";
import {request} from "strapi-helper-plugin";
import PropTypes from "prop-types";
import pluginId from "../../pluginId";
import UploadFileForm from "../../components/UploadFileForm";
import {
  HeaderNav,
  LoadingIndicator,
  PluginHeader
} from "strapi-helper-plugin";
import Row from "../../components/Row";
import Block from "../../components/Block";
import {Select, Label} from "@buffetjs/core";
import {get, has} from "lodash";
import MappingTable from "../../components/MappingTable";
import {Button} from "@buffetjs/core";
import {IMPORT_STATE, MATCH_ON_KEY} from "../../utils/constants"
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';


class HomePage extends Component {
  state = {
    loading: true,
    modelOptions: [],
    models: [],
    importSource: "upload",
    analyzing: false,
    analysis: null,
    selectedContentType: "",
    fieldMapping: {},
    importState: IMPORT_STATE.content
  };


  componentDidMount() {
    this.getModels().then(res => {
      const {models, modelOptions} = res;
      this.setState({
        models,
        modelOptions,
        selectedContentType: modelOptions ? modelOptions[0].value : ""
      });
    });
  }

  onRequestAnalysis = async analysisConfig => {
    this.analysisConfig = analysisConfig;
    this.setState({analyzing: true}, async () => {
      try {
        strapi.notification.info('Analyze Started');
        const response = await request("/import-csv/preAnalyzeImportFile", {
          method: "POST",
          body: analysisConfig
        });

        this.setState({analysis: response, analyzing: false}, () => {
          strapi.notification.success(`Analyzed Successfully`);
        });
      } catch (e) {
        this.setState({analyzing: false}, () => {
          strapi.notification.error(`Analyze Failed, try again`);
          strapi.notification.error(`${e}`);
        });
      }
    });
  };

  getModels = async () => {
    this.setState({loading: true});
    try {
      const response = await request("/content-type-builder/content-types", {
        method: "GET"
      });

      // Remove non-user content types from models
      const models = get(response, ["data"], []).filter(
        obj => !has(obj, "plugin")
      );
      const modelOptions = models.map(model => {
        return {
          label: get(model, ["schema", "name"], ""), // (name is used for display_name)
          value: model.apiID // (uid is used for table creations)
        };
      });

      this.setState({loading: false});

      return {models, modelOptions};
    } catch (e) {
      this.setState({loading: false}, () => {
        strapi.notification.error(`${e}`);
      });
    }
    return [];
  };

  checksRelationRequirements = (fieldMapping) => {
    const containsMatchingID = Object.keys(fieldMapping).find(key => fieldMapping[key][MATCH_ON_KEY])
    if (!containsMatchingID) {
      strapi.notification.error(`Match on ID is required`);
      this.setState({loading: false});
      return false
    }
    return true
  }

  onSaveImport = async () => {
    const {selectedContentType, fieldMapping, importState} = this.state;
    const {analysisConfig} = this;
    const importConfig = {
      ...analysisConfig,
      contentType: selectedContentType,
      fieldMapping,
      importState
    };

    if (importState === IMPORT_STATE.relations && this.checksRelationRequirements(fieldMapping) || importState === IMPORT_STATE.content) {
      this.setState({loading: true}, async () => {
          try {
            strapi.notification.info('Import Started');
            const res = await request("/import-csv", {method: "POST", body: importConfig});
            this.setState({loading: false}, () => {
              if(res.status === 200){
                strapi.notification.success('Imported Successfully');
              }else{
                strapi.notification.error('Oops! Something went wrong');
              }
            });
          } catch (e) {
            strapi.notification.error(`${e}`);
            this.setState({loading: false});
          }
        }
      )
    }
  };

  selectImportDest = selectedContentType => {
    this.setState({selectedContentType});
  };

  getTargetModel = () => {
    const {models} = this.state;
    if (!models) return null;
    return models.find(model => model.apiID === this.state.selectedContentType);
  };

  setFieldMapping = fieldMapping => {
    this.setState({fieldMapping});
  };

  handleChange = (_, newValue) => {
    this.setState({importState: newValue})
  }

  render() {
    const {loading, importState} = this.state

    return loading ? <LoadingIndicator/> :
      <div className={"container-fluid"} style={{padding: "18px 30px"}}>
        <PluginHeader
          title={"Import CSV"}
          description={"Import CSV"}
        />
        <Tabs value={importState} onChange={this.handleChange} style={{marginTop: "4.4rem"}}>
          <Tab label="Import Content" importState={IMPORT_STATE.content}/>
          <Tab label="Import Relations" importState={IMPORT_STATE.relations}/>
        </Tabs>
        <div className="row">
          <Block
            title="General"
            description="Configure the Import Source & Destination"
            style={{marginBottom: 12}}
          >
            <Row className={"row"}>
              <div className={"col-4"}>
                <Label htmlFor="importDest">Import Destination</Label>
                <Select
                  value={this.state.selectedContentType}
                  name="importDest"
                  options={this.state.modelOptions}
                  onChange={({target: {value}}) =>
                    this.selectImportDest(value)
                  }
                />
              </div>
            </Row>
            <UploadFileForm
              onRequestAnalysis={this.onRequestAnalysis}
              loadingAnalysis={this.state.analyzing}
            />
          </Block>
        </div>
        {this.state.analysis && (
          <Row className="row">
            <MappingTable
              analysis={this.state.analysis}
              targetModel={this.getTargetModel()}
              models={this.state.models}
              onChange={this.setFieldMapping}
              importState={importState}
            />
            <Button
              style={{marginTop: 12}}
              label={"Run the Import"}
              onClick={this.onSaveImport}
            />
          </Row>
        )}
      </div>
  }
  ;
}

export default memo(HomePage);
