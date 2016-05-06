define(function (require) {
  var actions = require ("actions/formActions");
  var Store = require ("stores/formStore");
  var constants = require ("constants/formConstants");
  var TextBox =  require ("views/textBox");
  var ToggleButton =  require ("views/toggleButton");
  var RadioGroup = require ("views/radioGroup");
  var CheckGroup = require ("views/checkGroup");
  var SelectBox = require ("views/selectBox");
  var Calendar = require("views/calendar");
  var Attach = require("views/attach");
  var Select = require ("controllers/select");
  var NavigationActions = require ("actions/navigationActions");
  var NavigationStore = require ("stores/navigationStore");
  var NavigationConstants = require ("constants/navigationConstants");
  var appActions = require ("actions/appActions");
  var Feedback = require("controllers/feedback");
  var TextArea = require("views/textareaBox");
  var Confirm = require("views/confirmBox");
  var Msg = require("views/msgBox");
  var Loader = require("views/loader");
  var msgButtonsArray = [{"title":"ok"}];

  var Form = React.createClass ({
      getInitialState: function () {

          return this.getContent(this.props.id,this.props.childId,this.props.rowId);
      },
      componentDidMount: function () {
          Store.addChangeListener (constants.Change_Data_Event,this._onChange);
          Store.addChangeListener (constants.On_Error,this.showError);
          NavigationStore.addChangeListener (NavigationConstants.Right_Click_Event,this._onRightButtonClick);
          NavigationStore.addChangeListener (NavigationConstants.Back_Click_Event,this._onBackButtonClick);

          var state = NavigationStore.getControllerState();

          if(state && state.scrollTop)
          {
              var node = this.getDOMNode();
              node.scrollTop = state.scrollTop;
          }

      },
      componentWillUnmount: function () {
          Store.removeChangeListener (constants.Change_Data_Event,this._onChange);
          Store.removeChangeListener (constants.On_Error,this.showError);
          NavigationStore.removeChangeListener (NavigationConstants.Right_Click_Event,this._onRightButtonClick);
          NavigationStore.removeChangeListener (NavigationConstants.Back_Click_Event,this._onBackButtonClick);
      },
      componentWillReceiveProps: function(nextProps) {
          this.setState(this.getContent(nextProps.id,nextProps.childId,nextProps.rowId));
      },
      getResources:{},
      render: function () {
          var content = this.state.content;

          var id = "form";
          if(this.props.childId)
          {
              id=this.props.id;
          }

          return (
              <div className="gclass form" id={id}>
                {content}
              </div>
          );
      },

      showError:function()
      {
          var error = Store.getError();
          if(error)
          {
              var msg;
              if(error == "network_failed")
              {
                  msg = error;
              }else {
                  msg = JSON.parse(error).message;
              }
              NavigationActions.presentPopup(<Msg msgLabel={msg} buttons={msgButtonsArray} onMsgClick={this._onCancel}/>);
          }
      },
      _onChange:function()
      {
          return this.setState(this.getContent(this.props.id,this.props.childId,this.props.rowId));
      },
      _onActionClick:function(title)
      {

          var formsData = Store.getData();
          var content = formsData[this.props.id].data.content;

          var actionKey = Store.getActionParam(this.props.id);
          var obj = content[actionKey];
          obj.value = "1";

          var currentStageKey = Store.getCurrentStageKey(this.props.id);
          var obj = content[currentStageKey];
          obj.value = "1";

          var obj = content["PREVIOUS_STAGE"];
          obj.value = "0";

          var processCode = Store.getProcessCode(this.props.id);
          var obj = content["DD_PROCESS_CODE"];
          obj.value = processCode;


          var meta = formsData[this.props.id].data.meta;
          var pid = meta.pid;
          var obj = content["FORM_PID"];
          obj.value = pid.toString();

          var attachments;
          if(this.props.id === "MS_INC_POTENTIAL_INJ_FORM")
          {

              var array = [
                "INC_LOCATION_LKP",
                "INC_SUB_LOCATION_LKP",
                "INC_SUB_LOCATION_LOCALIZED_LKP",
                "INC_EXACT_LOCATION"
              ]

              var value = getAppendedValuesFromContent(array,content);
              content["INC_DUMMY_CHAR4"] = {"value":value};
              content["INC_DUMMY_CHAR14"] = {"value":Moment().format("DD-MM-YYYY HH:mm")};
              content["INC_DUMMY_CHAR15"] = {"value":Moment().format("YYYY")};
               var obj = content["INC_DATE_AND_TIME"];
               var modified = Moment(obj.value,"M/DD/YYYY HH:mm:ss").format("M/DD/YYYY HH:mm")
               content["MS_INC_ATTRIBUTE1"] = {"value":modified};

               var titleArray = [
                 "INC_POTENTIAL_INJURY_COUNTRY",
                 "REPORTERS_DEPARTMENT",
                 "EVENT_TYPE",
                 "MS_INC_ATTRIBUTE1"
               ]
               var titleValue = getAppendedValuesFromContent(titleArray,content);
               content["POTENTIAL_INJURY_NAME"] = {"value":titleValue};
               content["EVENT_TYPE"]= {"value":getString(this.props.id)};

               content["INCIDENT_DESCRIPTION_LKP"] = [{"value":this.props.potentialLov}];
               attachments = content["INC_ATTACHMENT"];
          }else {
              content["DUMMY_CHAR2"] = {"value":this.props.childId};
              var location = content["INC_LOCATION"];
              content["DUMMY_CHAR3"] = {"value":location.value};
              content["DUMMY_CHAR4"] = {"value":"Actual Injury or Damage Reporting"};

              var array = [
                "INC_LOCATION",
                "INC_SUB_LOCATION",
                "EXACT_SUB_LOCATION",
                "INC_EXACT_LOCATION"
              ]
              var value = getAppendedValuesFromContent(array,content);
              content["DUMMY_CHAR5"] = {"value":value};

              var titleArray = [
                "COUNTRY",
                "REPORTERS_DEPT"
              ]
              var titleValue = getAppendedValuesFromContent(titleArray,content);
              titleValue = titleValue + "-" + getString(this.props.childId);
              var obj = content["INCIDENT_DATE"];
              var modified = Moment(obj.value,"M/DD/YYYY HH:mm:ss").format("DD/MM/YYYY HH:mm")
              titleValue = titleValue + "-" + modified;

              obj.value = Moment(obj.value,"M/DD/YYYY HH:mm:ss").format("MM/DD/YYYY HH:mm:ss")

              content["INCIDENT_NAME"] = {"value":titleValue};

              var selectValue = "0";
              if(this.props.childId === "PSD")
              {
                  selectValue = "1";

              }else if(this.props.childId === "FLY"){

                  selectValue = "2";

              }else if(this.props.childId === "EQD"){

                  selectValue = "6";

              }
              content["SELECTED_TABS_ID"] = {value:selectValue}
              content["REPORTED_TIME"] = {"value":Moment().format("M/DD/YYYY HH:mm:ss")}
              content["INC_STATUS"] = {value:"Reporting"}
              attachments = content["ADN_SUPPORTING_DOC"];
          }



          var formAction = "submit";
          if(title==="save_as_draft")
          {
              formAction = "save";
          }

          this._onCancel();

          //attachments
          if(attachments && attachments.length ==1)
          {
              var that = this;
              var onAttachmentSuccess = function(array,error)
              {
                  var attachIds = "";
                  for(var i=0;i<array.length;i++)
                  {
                      if(i!=0)
                      {
                         attachIds = attachIds+";"
                      }
                      attachIds = attachIds+array[i].id;
                  }
                  attachments[0].value = attachIds;
                  that._submitFormData(formAction,title);
              }
              var attachObj = attachments[0];
              var files = attachObj.value.split(";");

              if(files && attachments.length > 0)
              {
                  Store.submitAttachments(files,onAttachmentSuccess);
              }

          }else {
              this._submitFormData(formAction,title);
          }

      },
      _submitFormData: function(formAction,title)
      {
          var that = this;
          var onSubmit = function(data)
          {
              if(title === "submit_incident")
              {
                NavigationActions.presentPopup(<Msg msgLabel={"submission_success"} buttons={msgButtonsArray} onMsgClick={that._onSubmitSuccess}/>);
              }
              else if(title === "save_as_draft")
              {
                NavigationActions.presentPopup(<Msg msgLabel={"save_draft_success"} buttons={msgButtonsArray} onMsgClick={that._onSubmitSuccess}/>);
              }
          }

          Store.submitFormData(this.props.id,onSubmit,formAction);
      },
      _onSubmitSuccess: function()
      {
        NavigationActions.removePopup();
        actions.clearFormData(this.props.id);
        appActions.reInitiateApp();
      },
      _onCancel:function()
      {
        NavigationActions.removePopup();
      },
      _onBackButtonClick:function()
      {
        NavigationActions.popController();
      },
      _onRightButtonClick:function()
      {
          /*do validations */

          var formsData = Store.getData();
          var content = formsData[this.props.id].data.content;
          var array = Store.getKeysToMandate(this.props.id);
          var isEmpty = false;
          for(var i=0;i<array.length;i++)
          {
            var key = array[i];
            var object = content[key];
            if (object instanceof Array)
            {
              if(object.length<1 || !object[0].value)
              {
                    isEmpty = true;
                    break;
              }
            }
            else {
              if(!object.value)
              {
                    isEmpty = true;
                    break;
              }
            }
          }
          if(this.props.childId && isEmpty === false)
          {
            var array = Store.getKeysToMandate(this.props.childId);
            content = content[this.props.childId][this.props.rowId];
            for(var i=0;i<array.length;i++)
            {
              var key = array[i];
              var object = content[key];
              if (object instanceof Array)
              {
                if(object.length<1 || !object[0].value)
                {
                      isEmpty = true;
                      break;
                }
              }
              else {
                if(!object.value)
                {
                      isEmpty = true;
                      break;
                }
              }
            }
          }
          if(isEmpty)
          {

            NavigationActions.presentPopup(<Msg msgLabel={"mandatory_field"} buttons={msgButtonsArray} onMsgClick={this._onCancel}/>);
            return;
          }
          if(this.props.onRightButtonClick)
          {
            this.props.onRightButtonClick();
            return;
          }
          if(this.props.id === "MS_INC_POTENTIAL_INJ_FORM")
          {
            this._onActionClick("submit_incident");
          }
          else
          {
            var buttonArray = [
                                {"title":"save_as_draft"},
                                {"title":"submit_incident"}
                              ]
            NavigationActions.presentPopup(<Confirm buttons={buttonArray} onAction={this._onActionClick} onCancel={this._onCancel} />);
        }
      },
      _onComponentSave:function(id,value)
      {
          if(value !== undefined)
          {
              var formsData = Store.getData();
              var content = formsData[this.props.id].data.content;

              if(this.props.childId)
              {
                  content = content[this.props.childId][this.props.rowId];
              }

              if(!content[id])
              {
                  NavigationActions.presentPopup(<Msg msgLabel={"internal_error"} buttons={msgButtonsArray} onMsgClick={this._onCancel}/>);
                  return;
              }
              RemoveDependentLovs(id,this.props.id,this.props.childId,this.props.rowId,this.getResources);
              if(value instanceof Array)
              {
                  var arrayObj = [];
                  var valStr = "";
                  for (var i=0;i<value.length;i++)
                  {
                      if(value[i])
                      {
                          if(i!=0)
                            valStr = valStr+";";

                          valStr = valStr+value[i].key
                      }
                  }

                  var obj = {value:valStr};
                  arrayObj.push(obj);
                  content[id] = arrayObj;

              }else if(value instanceof Object){

                  var obj = {value:value.key};
                  content[id] = obj;

              }else if(value !== "")
              {
                  var obj = {value:value};
                  content[id] = obj;
              }

            }

      },
      _onSelectBoxClick:function(key,options)
      {
          var content;
          var isSingleSelect = true;
          var formsData = Store.getData();
          var structure = formsData[this.props.id].data.structure;
          var resources = formsData[this.props.id].data.resources;
          var content = formsData[this.props.id].data.content;

          if(this.props.childId)
          {
              content = content[this.props.childId][this.props.rowId];
              structure = structure[this.props.childId];
          }

          var element = structure[key];


          if(!element || !content[key])
          {
            NavigationActions.presentPopup(<Msg msgLabel={"field_not_found"} buttons={msgButtonsArray} onMsgClick={this._onCancel}/>);
            return;
          }

          if("multiple" === element.select )
          {
              isSingleSelect =false;
          }

          var obj = content[key];
          var defaultArray= [];
          if(obj instanceof Array)
          {
              if(obj.length>0)
              {
                var splitKeys = obj[0].value.split(";")
                for(var index=0;index<splitKeys.length;index++)
                {
                    if(splitKeys[index] && splitKeys[index]!=="")
                      defaultArray.push(splitKeys[index]);
                }
              }

          }else if(obj.value){

                defaultArray.push( obj.value);
          }

          //fix to retain scroll position from previous state
          var node = this.getDOMNode();
          var state  = {
              "scrollTop": node.scrollTop
          }

          if(this.props.childId)
          {
              state["activeTab"]=this.props.rowId
          }

          if(element.resource.source==="form")
          {
              var options = getValuesOfResource(resources[element.resource.ref]);
              defaultArray  = getSelectedLOVS(options,defaultArray);
              content= <Select options={options} isSingleSelect={isSingleSelect} onSave={this._onComponentSave} defaultvalues={defaultArray} id={key} key={key}/>
              var controllerData = {
                title:getString("select"),
                content:content,
                leftButtonName:"Back",
                rightButtonName:"Submit"
              };
              NavigationActions.pushController(controllerData,state);

          }else {

              var parameters = element.resource.parameters;
              var queryParams;
              var refValue;

              for(var i=0;i<parameters.length;i++)
              {
                  var obj = parameters[i];
                  var valueObj = content[obj.ref];
                  var structLabel = structure[obj.ref].label;
                  refValue = obj.value;
                  if(valueObj)
                  {
                      if(valueObj instanceof Array)
                      {
                          if(valueObj.length>0)
                            refValue = valueObj[0].value;

                      }else if(valueObj.value && valueObj.value!==""){

                          refValue = valueObj.value;

                      }else if(refValue === "stored_value")
                      {
                        var message = getString("select_prev_lov")
                        message = String.format(message,structLabel);
                        NavigationActions.presentPopup(<Msg msgLabel={message} buttons={msgButtonsArray} onMsgClick={this._onCancel}/>);
                        return;
                      }

                  }else if(refValue === "stored_value")
                  {
                      var message = getString("select_prev_lov")
                      message = String.format(message,structLabel);
                      NavigationActions.presentPopup(<Msg msgLabel={message} buttons={msgButtonsArray} onMsgClick={this._onCancel}/>);
                      return;
                  }

                  if(i==0)
                  {
                      queryParams=obj.ref+"="+refValue;
                  }
                  else {
                      queryParams = queryParams +"&"+obj.ref+"="+refValue
                  }


              }
              var url  = "tasks/"+formsData[this.props.id].assignmentId+"/form/resources/"+element.resource.ref+"?"+queryParams;

              var that = this;
              var gotResourceData=function(data,error)
              {

                  var options = getValuesOfResource(data);
                  that.getResources[key] = options;
                  if(options.length == 1 )
                  {
                      if(isSingleSelect)
                      {
                          that._onComponentSave(key,options[0]);
                      }else {
                          that._onComponentSave(key,options);
                      }

                      return that.setState(that.getContent(that.props.id,that.props.childId,that.props.rowId));
                  }

                  defaultArray  = getSelectedLOVS(options,defaultArray);
                  content= <Select options={options} isSingleSelect={isSingleSelect} onSave={that._onComponentSave} defaultvalues={defaultArray} id={key} key={key}/>
                  var controllerData = {
                    title:getString("Select"),
                    content:content,
                    leftButtonName:"Back",
                    rightButtonName:"Submit"
                  };
                  NavigationActions.pushController(controllerData,state);
              }

              Store.getResorceData(url,gotResourceData);
          }
      },
      getContent:function (id,childId,rowId)
      {
          var formsData = Store.getData();
          if(formsData && formsData[id])
          {

            var contentUI;

            if(childId)
            {
                contentUI = this.renderUI(formsData[id].data,Store.getKeysToShow(childId),id,childId,rowId);
            }else {
                contentUI = this.renderUI(formsData[id].data,Store.getKeysToShow(id),id);
            }

            return contentUI;
          }

          actions.getFormData(id);
          return {content:<Loader />};
      },
      renderUI:function(data,keys,id,childId,rowId)
      {
          var structure = data.structure;
          var content = data.content;

          if(childId)
          {
              structure = data.structure[childId];
              content = data.content[childId][rowId];
          }
          var contentUI = [];
          for(var i=0;i<keys.length;i++)
          {
              var key = keys[i];
              var element = structure[key];
              var obj = content[key];
              var value;
              if(obj instanceof Array)
              {
                  value = [];
                  if(obj.length>0)
                  {
                    var splitKeys = obj[0].value.split(";")
                    for(var index=0;index<splitKeys.length;index++)
                    {
                        if(splitKeys[index] && splitKeys[index]!=="")
                          value.push(splitKeys[index]);
                    }
                  }

              }else {
                  if(obj.value)
                    value = obj.value;
                  else {
                    value = "";
                  }
              }
              var requiredId = id;
              if(childId)
              {
                requiredId = childId;
              }
              var isRequired = Store.isFieldRequired(requiredId,key);


              switch (element.fieldtype) {
                case constants.Popup:
                case constants.Dropdown:
                {
                    var isSingleSelect = true;
                    if("multiple" === element.select )
                    {
                        isSingleSelect = false;
                    }

                    var options;
                    if(element.resource.source==="form")
                    {
                        options = getValuesOfResource(data.resources[element.resource.ref]);
                    }else {
                        options = this.getResources[key];
                    }

                    if(options && options instanceof Array && options.length>0)
                    {
                        if(element.resource.source==="form" && isSingleSelect && options.length < 5)
                        {
                            if(options.length==2)
                            {
                                contentUI.push(<ToggleButton name={element.label} isRequired={isRequired} options={options} onSave={this._onComponentSave} defaultvalue={value} id={key} key={key}/>)

                            }else if (options.length < 5) {

                                contentUI.push(<RadioGroup name={element.label} isRequired={isRequired} options={options} onSave={this._onComponentSave} defaultchecked={value} id={key} key={key}/>)
                            }

                        }else {

                            var defaultArray;
                            if(value instanceof Array)
                            {
                                defaultArray = value;
                            }else {
                                defaultArray = [];
                                if(value!=="")
                                  defaultArray.push(value);
                            }

                            defaultArray  = getSelectedLOVS(options,defaultArray);

                            if (element.resource.source === "form" && options.length < 5)
                            {
                                contentUI.push(<CheckGroup name={element.label} isRequired={isRequired} options={options} onSave={this._onComponentSave} defaultchecked={defaultArray} id={key} key={key}/>)

                            }else {

                              contentUI.push(<SelectBox name={element.label} isRequired={isRequired} onSelectBoxClick={this._onSelectBoxClick} defaultvalues={defaultArray} id={key} key={key}/>);
                            }
                        }

                    }else {
                        var defaultArray=[];
                        contentUI.push(<SelectBox name={element.label} isRequired={isRequired} onSelectBoxClick={this._onSelectBoxClick} defaultvalues={defaultArray} id={key} key={key}/>);
                    }
                    break;
                }
                case constants.Calendar:
                {
                  var valArray = value.split(" ");
                  var date = Moment().format('YYYY-MM-DD');
                  if(valArray[0] !== ""){
                    var date = valArray[0];
                    date = Moment(date,'M/DD/YYYY').format('YYYY-MM-DD');
                  }
                  var time = Moment().format('HH:mm');
                  if(valArray.length === 2){
                    time = valArray[1];
                    time = Moment(time, 'HH:mm:ss').format('HH:mm');
                  }
                  contentUI.push(<Calendar name={element.label} isRequired={isRequired} onSave={this._onComponentSave} defaultdate={date} defaulttime={time} id={key} key={key}/>);
                  break;
                }

                case constants.Attachment:
                {
                    contentUI.push(<Attach name={element.label} isRequired={isRequired} onSave={this._onComponentSave} id={key} key={key}/>);
                    break;
                }
                default:
                {
                   if(childId)
                  {
                    contentUI.push(<TextBox name={element.label} isRequired={isRequired} onSave={this._onComponentSave} defaultvalue={value} id={key}  key={key}/>);
                  }
                   else {
                    contentUI.push(<TextArea name={element.label} isRequired={isRequired} onSave={this._onComponentSave} defaultvalue={value} id={key}  key={key}/>);
                   }
                }
              }
          }

          return {content:contentUI};
      }
  });
  return Form;

  function RemoveDependentLovs(keyToCheck,id,childId,rowId,resources)
  {
      var formsData = Store.getData();
      var structure = formsData[id].data.structure;
      var content = formsData[id].data.content;
      if(childId)
      {
          content = content[childId][rowId];
          structure = structure[childId];
      }
      var fieldsToCheck = Object.keys(resources);

      for(var index=0;index<fieldsToCheck.length;index++)
      {
          var key = fieldsToCheck[index];
          var element = structure[key];
          var obj = content[key];

          if(element && element.resource && element.resource.parameters)
          {
              var parameters = element.resource.parameters;
              for(var i=0;i<parameters.length;i++)
              {
                  if(parameters[i].ref && parameters[i].value === "stored_value" && parameters[i].ref === keyToCheck)
                  {
                      if(obj instanceof Array )
                      {
                          content[key] = [];

                      }else if(obj && obj.value ){
                          obj.value = "";
                      }
                      delete resources[key];
                      RemoveDependentLovs(key,id,childId,rowId,resources);
                      break;
                  }
              }
          }
      }


  }
  function getValuesOfResource(resourceData) {
      var values= [];
      for (var key in resourceData) {
        var value = resourceData[key].value;
        values.push({key,value});
      }

      return values;
  }

  function getSelectedLOVS(source,filter)
  {
      var array=[];
      for (var i = 0; i < filter.length; i++) {

          for(var j=0;j<source.length;j++)
          {
              if(filter[i] == source[j].key)
              {
                  array.push(source[j]);
                  break;
              }
          }

      }

      return array;
  }

  function getAppendedValuesFromContent(array,content)
  {
      var value = "";
      for(var index = 0; index < array.length;index++)
      {
          var contentKey =  array[index];
          var valObj = content[contentKey];

          var currentValue;
          if(valObj instanceof Array && valObj.length===1)
          {
              currentValue = valObj[0].value;
          }else if(valObj)
          {
              currentValue = valObj.value;
          }

          if(currentValue)
          {
              if(index===0)
                value = value+currentValue;
              else {
                value = value+"-"+currentValue;
              }
          }
      }

      return value;
  }
});
