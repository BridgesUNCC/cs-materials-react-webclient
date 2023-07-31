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
      ontology_data: "",
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

  shouldComponentUpdate(){
      //this is updated from ontologywrapper so it clears all svg draws for a new render
      this.svg.selectAll("*").remove()
      this.drawRadial()
      return true
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
    this.sliderValue = newValue
  };

  handleSlideLetGo = (event) => {
    this.setState({...this.state, treeSlider: this.sliderValue})
  };




  drawRadial(){
    let secondClassificationTree;
    let secondClassificationSet;

    let ontology_data             = JSON.parse(JSON.stringify(this.props.data[0]));
    let ontology_type             = JSON.parse(JSON.stringify(this.props.ontology_type)); 
    //ontology_data                 = JSON.parse(JSON.stringify(ontology_data)) //deep clone the data
    let assignments               = JSON.parse(JSON.stringify(this.props.data[1]));
    let assignmentsArray          = assignments.assignments;
    let view                      = this.props.view || this.props.data.length === 3 ? "compare" : "first";
    let temp1                     = this.props.tags.split(',');
    let maxHits                   = 15;
    // let trimming         = false;

    console.log(this.props.data)

    const vWidth = 2000;
    const vHeight = 1000;

    var trimming = this.state.trimming
    var removeGray = this.state.grayRemoval
    var formatAfter = this.state.formatAfter


    if(temp1[0] != ""){
      trimming = true;
    }

    const handleClick = () => {
      this.state.open = true
      return true
    };

    console.log(ontology_type)
    buildClassificationTree(ontology_data, null, assignmentsArray, ontology_type, this.state.treeSlider)
    trimTree(ontology_data)
    layoutRadialLayer(ontology_data)

    //visualization containter size and initial drag position
     const g = this.container.select('svg').attr('width', vWidth).attr('height', vHeight)
         .select('g').attr('transform', 'translate(' + vWidth / 2 + ',' + vHeight / 2 + ')');


     //tree size
     const vLayout = d3.tree().size([2 * Math.PI, Math.min(vWidth * 2, vHeight * 2)]); // margin!
     console.log(this.props)
     // Layout + Data
     const vRoot = d3.hierarchy(ontology_data);
     const vNodes = vRoot.descendants();
     const vLinks = vLayout(vRoot).links();
     let newNodes = []
     if(trimming == true || removeGray == "1"){
       for(let i = 0; i < vNodes.length; i++){
         if(vNodes[i].data.hide != true){
           newNodes.push(vNodes[i])
         }
       }
     }else{
       newNodes = vNodes
     }


      //straight links
      const link = g.selectAll(".link")
          .data(vLinks)
          .enter().append("line")
          .attr("class", "link")
          .attr("stroke", "#ccc")
          .attr('stroke-width', function(d){
            if(trimming == true || removeGray == "1"){
              if(d.source.data.hide == true || d.target.data.hide == true){
                return '0px'
              }else{
                return '1px'
              }
            }else{
              return '1px'
            }
          })
          .attr("x1", function (d) {
            return d.source.data.locationX;
          })
          .attr("y1", function (d) {
            return d.source.data.locationY;
          })
          .attr("x2", function (d) {
            return d.target.data.locationX;
          })
          .attr("y2", function (d) {
            return d.target.data.locationY;
          });

      //creates divergent scale that interpolates from purple to orange in the range from 0-1 (0.5 = white)
      var colorDivergent = d3.scaleSequential(d3.interpolatePuOr).domain([0,1])

      //styling for the nodes in tree
      g.selectAll('circle').data(newNodes).enter().append('circle')
          .attr('r', function (d) {return d.data.size - 5})
          .attr("transform", function (d) {return "translate(" + d.data.locationX + "," + d.data.locationY + ")"; })
          .style("fill-opacity", function(d){
            if(d.data.hide == true){
              return '0.8'
            }else{
              return '0.8'
            }
          }) // set the fill opacity
          .style("stroke", "black")
          .style("fill", function (d) {
            if(!d.data.firstTreeHits && !d.data.secondTreeHits || view === "first"){
              return d.data.color
            }else if(!d.data.firstTreeHits || !d.data.secondTreeHits){
              return d3.rgb(d.data.color[0], d.data.color[1], d.data.color[2])
            }else{
              let inter = d3.interpolate("purple", "orange")
              return colorDivergent(d.data.color)
            }
          })
          .on("mouseover", function(d){
            console.log(d)
            let currentNode = d.data;
            let breadcrumbs = [currentNode];

            while(currentNode.parent != null){
              console.log(currentNode)
              breadcrumbs.push(currentNode.parent);
              currentNode = currentNode.parent
            }

            let finalLabelString = "";
            console.log(breadcrumbs)
            for(let i = breadcrumbs.length - 1; i >= 0; i--){
              if(i === 0){
                finalLabelString += breadcrumbs[i].title.substring(breadcrumbs[i].title.lastIndexOf(":") + 1);
              }else{
                finalLabelString += breadcrumbs[i].title.substring(breadcrumbs[i].title.lastIndexOf(":") + 1) + " :: "
              }
            }

            d3.select("#tooltip")
                .attr("transform", "translate(" + d.data.locationX + "," + d.data.locationY + ")")
                .select("#value")
                .style("color", "black")
                .text(finalLabelString);

            if(d.data.assignments){
              for (let i = 0; i < d.data.assignments.length; i++){
                let text = "";
                (i === d.data.assignments.length - 1) ? text = d.data.assignments[i].fields.title : text = d.data.assignments[i].fields.title;
                d3.select("#assignmenttooltip")
                    .select("#value")
                    .append('p')
                    .append("tspan")
                    .attr("dy", 25)
                    .attr('x', 0)
                    .style("color", "black")
                    .text(text)

              }
              if(d.data.firstTreeRatio){
                let text = d.data.firstTreeRatio*100 + "% of first tree -----" + d.data.secondTreeRatio*100 + "% of second tree"
                d3.select("#assignmenttooltip")
                    .select("#value")
                    .append('p')
                    .append("tspan")
                    .attr("dy", 25)
                    .attr('x', 0)
                    .style("color", "black")
                    .text(text)
              }
            }


            d3.select("#tooltip").classed("hidden", false);
            d3.select("#assignmenttooltip").classed("hidden", false);

          })
          .on("mouseout", handleMouseOut);

      this.container.select("svg").call(d3.zoom()
          .scaleExtent([-1, 20])
          .on("zoom", zoomed));

      function zoomed() {
        d3.select("g").attr("transform", d3.event.transform.translate(vWidth / 2, vHeight / 2).scale(1));
      }

      function radialPoint(x, y) {
        return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
      }

      function handleMouseOut(d, i) {
        d3.select("#tooltip").classed("hidden", true);
        d3.select("#assignmenttooltip").classed("hidden", true);

        // Select text by id and then remove
        d3.select("text").remove();  // Remove text location
        d3.selectAll("tspan").remove();
      }


   //return ontology_data;

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
        value={this.sliderValue}
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
