// @TODO cleanup file to not require this disable
/* eslint-disable */

import React, {Component} from 'react';
import * as d3 from "d3";
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TreeVisualization from './TreeVisualization'


import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

import {buildClassificationTree} from "../../common/visualUtils";
import {trimTree} from "../../common/visualUtils";
import {layoutRadialLayer} from "../../common/visualUtils";


var radialTree;
//var sliderValue = [0,10]


class RadialUpdate extends Component {


  constructor(){
    super()
    this.state = {
      open: false,
      trimming: false,
      grayRemoval: "0",
      formatAfter: "0",
      ontology_data: {},
      isloading: true,
      treeSlider: [0,10],
    }
    this.sliderValue = [0,10]
  }

  componentDidMount() {
    this.container = d3.select("#RadialContainer");
    this.svg       = this.container.append("svg").append("g");
    this.drawRadial();
    
  }

  shouldComponentUpdate(nextProps){
    if(this.props != nextProps){
      //this is updated from ontologywrapper so it clears all svg draws for a new render
      this.props = nextProps;
      this.svg.selectAll("*").remove()
      this.drawRadial()
      return true
    }
    return false 
  }

  handleClickOpen = () => {
    this.setState({...this.state, open: true})
  };

  handleClose = () => {
    this.setState({...this.state, open: false})
  }

  handleChange = (event) => {
    this.setState({...this.state, grayRemoval: event.target.value})
    // setAge(Number(event.target.value) || '');
  };

  handle2Change = (event) => {
    this.setState({...this.state, formatAfter: event.target.value})
    // setAge(Number(event.target.value) || '');
  };


  handleSliderChange = (event, newValue) => {
    console.log(newValue)
    this.state.treeSlider = newValue
    console.log(this.state)
  };

  handleSlideLetGo = (event,newValue) => {

    this.setState({...this.state, treeSlider: newValue})
  };




  drawRadial(){
    let secondClassificationTree;
    let secondClassificationSet;

    let ontology_data             = JSON.parse(JSON.stringify(this.props.data[0]));
    let ontology_type             = JSON.parse(JSON.stringify(this.props.ontology_type)); 
    let assignments               = JSON.parse(JSON.stringify(this.props.data[1]));
    let assignmentsArray          = assignments.assignments;
    let view                      = this.props.view || this.props.data.length === 3 ? "compare" : "first";
    let temp1
    if(this.props.tags){
      temp1                     = this.props.tags.split(',');
      if(temp1[0] != ""){
        trimming = true;
      }
    }
    let maxHits                   = 15;
    // let trimming         = false;

    const vWidth = 2000;
    const vHeight = 1000;

    var trimming = this.state.trimming
    var removeGray = this.state.grayRemoval
    var formatAfter = this.state.formatAfter

    const handleClick = () => {
      this.state.open = true
      return true
    };

    console.log(ontology_type)
    buildClassificationTree(ontology_data, null, assignmentsArray, ontology_type, this.state.treeSlider)
    trimTree(ontology_data)
    layoutRadialLayer(ontology_data)

    
    radialTree = <TreeVisualization data={ontology_data}/>

  }

  valuetext(value) {
    return `${value}`;
  }

  render(){


    const isLoading = this.state.isloading;
    return (
        <div id="parent">

        <Button onClick={this.handleClickOpen}>Open select dialog</Button>
      <div id="RadialSettings">
      <Dialog open={this.state.open} onClose={this.handleClose}>
        <DialogTitle>Choose Radial Settings</DialogTitle>
        <DialogContent>
          <form>
            <FormControl>
              <InputLabel htmlFor="demo-dialog-native" id={"FormControl"}>Remove Gray Nodes</InputLabel>
              <Select
                native
                value={this.state.grayRemoval}//age
                onChange={this.handleChange}
                input={<Input id="demo-dialog-native" />}
                id={"inputselect"}
              >
                <option aria-label="None" value="" />
                <option value={1}>true</option>
                <option value={0}>false</option>
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel id="demo-dialog-select-label" id={"FormControl"}>Layout After Removal</InputLabel>
              <Select
                labelId="demo-dialog-select-label"
                value={this.state.formatAfter}//age
                onChange={this.handle2Change}
                input={<Input />}
                id={"inputselect"}
              >
                <option aria-label="None" value="" />
                <option value={1}>true</option>
                <option value={0}>false</option>
              </Select>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={this.handleClose} color="primary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      <Typography id="range-slider" gutterBottom>
        Node Hit Range
      </Typography>
      <Slider
        min={0}
        max={20}
        value={this.state.treeSlider}
        onChange={this.handleSliderChange}
        onMouseUp={this.handleSlideLetGo}
        valueLabelDisplay="auto"
        aria-labelledby="range-slider"
        getAriaValueText={this.valuetext}
        style={{
          width: '50%',
          height: '35%',
        }}
      />
      {radialTree}
      </div>
          <div id={"App" + this.props.id}>
            <div id="tooltips">
              <div id="tooltip" className="hidden">
                <p><strong>Breadcrumbs: </strong></p>
                <p><span id="value">100</span></p>
              </div>
              <div id="assignmenttooltip" className="hidden">
                <p><b>Materials: </b></p>
                <p id="value"></p>
              </div>
            </div>
          </div>
        </div>
    );
  }
}

export default RadialUpdate;
