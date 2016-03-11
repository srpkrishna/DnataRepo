define(function (require) {

  var selectBox = React.createClass({

  propTypes: {
    name: React.PropTypes.string.isRequired,
    onSelectBoxClick: React.PropTypes.func.isRequired,
    defaultvalues: React.PropTypes.array
  },

  _onClick:function()
  {
      this.props.onSelectBoxClick(this.props.id,this.props.defaultvalue);
  },
  render: function () {
    var name = this.props.name;
    //var dvalue = this.props.defaultvalues;
    var dvalue = ["First","Sec","Third"];
    var content = [];
    if(dvalue)
    {
      for(var i = 0; i < dvalue.length; i++){
        content.push(
        <li className="dlist">{dvalue[i]}</li>
        );
      }
    }
    return(
      <div className="inputBox">
      <div className="label">{getString(name)}</div>
      <div className="selectBox" onClick={this._onClick}>
      <div className="dlistclass">
        {content}
      </div>
        <div id="line"></div><div id="arrow"></div>
      </div>
      </div>
    );
  }
  });
  return selectBox;
});
