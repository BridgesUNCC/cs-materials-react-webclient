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


class RadialUpdate extends Component {

  constructor(){
    super()
    this.state = {
      open: false,
      trimming: false,
      grayRemoval: "0",
      formatAfter: "0"
    }
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

  drawRadial(){
    let secondClassificationTree;
    let secondClassificationSet;

    let ontology_data             = this.props.data[0];
    //ontology_data                 = JSON.parse(JSON.stringify(ontology_data)) //deep clone the data
    let assignments               = JSON.parse(JSON.stringify(this.props.data[1]));
    let assignmentsArray          = assignments.assignments;
    let view                      = this.props.view || this.props.data.length === 3 ? "compare" : "first";
    let temp1                     = this.props.tags.split(',');
    let maxHits                   = 15;
    // let trimming         = false;

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

    console.log(ontology_data)
    console.log(assignmentsArray)

    function styleTreeNode(node){
      node.hits += 1;
      node.color = "orange";
      node.size = (node.hits/maxHits) * 10 + 10;
      node.hide = false;
    }

    function styleParentNodePath(parent){
      while(parent !== null && parent !== undefined){
        parent.childhits += 1;
        parent.size = (parent.childhits/50)*5+10
        if(parent.color === "grey"){
          parent.color = "blue"
        }
        parent.hide = false
        for(let i = 0; i < parent.children.length; i++){
          parent.children[i].hide = false
        }
        parent = parent.parent;
      }
    }

    function buildClassificationTree(root, parent){
      //init values of current node to defaults. If we have been to this node be
      if(root == undefined){return;}
      if(!root.hits) root.hits = 0;
      if(!root.color) root.color = "grey"
      if(!root.childhits) root.childhits = 0;
      if(!root.size) root.size = 10;
      if(root.hide === false){
        root.hide = false
      }else{
        root.hide = true
      }
      //if(!root.hide) root.hide = true;

      root.parent = parent;
      for(let j = 0; j < assignmentsArray.length; j++){
        if(assignmentsArray[j].fields.classifications.includes("ACM-CS2013: " + root.title)){
          styleTreeNode(root)
        }
      }
      if(root.hits > 0){
        styleParentNodePath(parent)
      }
      if(!root.children.length){
        return;
      }else{
        for(let i = 0; i < root.children.length; i++){
          buildClassificationTree(root.children[i], root)
        }
      }
    }

    function trimTree(tree){
      if(tree === null || tree === undefined){
        return
      }
      if(tree.children){
        let spliced_children = [];
        for(let i = 0; i < tree.children.length; i++){
          if(tree.children[i].hide === true){
            spliced_children.push(tree.children[i].id)
          }
        }
        for(let i = 0; i < spliced_children.length; i++){
          tree.children.splice(tree.children.filter(x => x.id === spliced_children[i].id), 1);
        }
        if(tree.children){
          for(let i = 0; i < tree.children.length; i++){
            trimTree(tree.children[i])
          }
        }
      }else{
        return
      }
    }


    function layoutRadialLayer(tree){
      let layers = 3;
      let layerDepth = 15;

      let howManyNodes = countVertices(tree);
      let anglePerVertex = 2*Math.PI/howManyNodes;
      let neededLength = howManyNodes * 15;
	     neededLength /= layers;

    	//depthOffset is the radius of the circle where all the nodes at a particular level are going to sit.
    	//in other words, all node at depth D should sit between D*depthOffset and (D+1)*depthOffset
    	let depthOffset = neededLength / Math.PI / 2 / layers;
    	if (depthOffset < 1.01*layers*layerDepth)
    	    depthOffset = 1.01*layers*layerDepth;


      function helper(tree, angleBegin, angleEnd, depth, layer){
        let angleCenter = (angleEnd - angleBegin)/ 2+angleBegin;
        let localRadius = depthOffset*depth + layer*layerDepth;
        let editNode = tree;
        editNode.locationX = localRadius * Math.cos(angleCenter);
        editNode.locationY = localRadius * Math.sin(angleCenter);
        console.log(editNode, editNode.locationX)

        let localCount = countVertices(tree) - 1;

        let neighboors = [];
        for(let i = 0; i < tree.children.length; i++){
          let to = tree.children[i];
          neighboors.push(to);
        }

        neighboors.sort();

        let baseAngle = angleBegin;
        let whichLayer = 0;
        for(let i = 0; i < neighboors.length; i++){
          let subCount = countVertices(neighboors[i]);

          let fraction = subCount/localCount;
          let allocatedAngle = fraction * (angleEnd-angleBegin);

          helper(neighboors[i], baseAngle, baseAngle+allocatedAngle, depth+1, whichLayer);

          baseAngle += allocatedAngle;
          whichLayer = (whichLayer + 1) % layers;
        }
      }
      helper(tree, 0, 2*Math.PI, 0, 0)
    }

    function countVertices(tree){
      let count = 1;
      if(tree.hide === false){
        count = 1;
        if(tree.color === "blue" || tree.color === "orange"){
          for(let i = 0; i < tree.children.length; i++){
            let to = tree.children[i];
            count += countVertices(to)
          }
        }
      }
      return count;
    }

   buildClassificationTree(ontology_data, null)
   trimTree(ontology_data)
   layoutRadialLayer(ontology_data)


   //visualization containter size and initial drag position
   const g = this.container.select('svg').attr('width', vWidth).attr('height', vHeight)
       .select('g').attr('transform', 'translate(' + vWidth / 2 + ',' + vHeight / 2 + ')');

   //tree size
   const vLayout = d3.tree().size([2 * Math.PI, Math.min(vWidth * 2, vHeight * 2)]); // margin!

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
          let currentNode = d.data;
          let breadcrumbs = [d.data.id];

          while(currentNode.parent){
            breadcrumbs.push(currentNode.parent);
            currentNode = findInTree(currentNode.parent)
          }

          let finalLabelString = "";
          for(let i = breadcrumbs.length - 1; i >= 0; i--){
            if(i === 0){
              finalLabelString += breadcrumbs[i].substring(breadcrumbs[i].lastIndexOf(":") + 1);
            }else{
              finalLabelString += breadcrumbs[i].substring(breadcrumbs[i].lastIndexOf(":") + 1) + " :: "
            }
          }

          d3.select("#tooltip")
              .attr("transform", "translate(" + d.data.locationX + "," + d.data.locationY + ")")
              .select("#value")
              .style("color", "black")
              .text(finalLabelString);

          if(d.data.assignmentNames){
            for (let i = 0; i < d.data.assignmentNames.length; i++){
              let text = "";
              (i === d.data.assignmentNames.length - 1) ? text = d.data.assignmentNames[i] : text = d.data.assignmentNames[i];
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

  }

  render(){
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
