define(function (require) {
  var MenuButton = require("views/menuButton");
  var Header = require("views/header");
  var NavigationStore = require("stores/navigationStore");
  var NavigationActions = require ("actions/navigationActions");
  var constants = require ("constants/navigationConstants");

  function getState () {
      return {
          controller: NavigationStore.getController(),
          presentationLayer: NavigationStore.getPresentationLayer()
      };
  }

  var navigator = React.createClass({
    getInitialState: function () {
        return {};
    },
    componentDidMount: function () {
        NavigationStore.addChangeListener (constants.Change_Event,this._onChange);
        NavigationActions.pushController(this.props.controller);
    },
    componentWillUnmount: function () {
        NavigationStore.removeChangeListener (constants.Change_Event,this._onChange);
    },
    componentWillReceiveProps: function(nextProps) {
      NavigationActions.changeRootController(nextProps.controller);
    },
    _onChange: function () {
        this.setState (getState());
    },
    _onBackButtonClick:function(event)
    {
        NavigationStore.emitChange(constants.Back_Click_Event);
        NavigationActions.popController();
    },
    _onRightButtonClick:function(event)
    {
        NavigationStore.emitChange(constants.Right_Click_Event);
    },
    render:function()
    {

      var controller;
      var presentationLayer;

      if(this.state.controller)
      {
          var leftButton;
          var rightButton;
          if(this.state.controller.leftButton)
          {
              leftButton = this.state.controller.leftButton;

          }else if(this.state.controller.leftButtonName)
          {
              leftButton = <MenuButton name={this.state.controller.leftButtonName} onClick={this._onBackButtonClick}/>;
          }

          if(this.state.controller.rightButton)
          {
              rightButton = this.state.controller.rightButton;

          }else if(this.state.controller.rightButtonName)
          {
              rightButton = <MenuButton align="right" id="rightMenuButton" name={this.state.controller.rightButtonName} onClick={this._onRightButtonClick}/>;
          }

          var title = this.state.controller.title ? this.state.controller.title:"";
          controller = <div className="gclass">
                        <div className="navigationBar">
                          {leftButton}
                          <Header name={title}/>
                          {rightButton}
                        </div>
                        <div className="controller">
                          {this.state.controller.content}
                        </div>
                    </div>;
      }

      if(this.state.presentationLayer)
      {
            presentationLayer = <div className="presentationLayer">
                                    <div className="filler"/>
                                    {this.state.presentationLayer}
                                </div>
      }

      return(
        <div className="container">
          {controller}
          {presentationLayer}
        </div>
      );

    }

  });

  return navigator;
});
