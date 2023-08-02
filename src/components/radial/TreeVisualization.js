// @TODO cleanup file to not require this disable
/* eslint-disable */

import React, {Component} from 'react';
import * as d3 from "d3";
import { makeStyles } from '@material-ui/core/styles';


class TreeVisualization extends Component{

	constructor(){
		super();
	}

	componentDidMount() {
	    this.container = d3.select("#RadialContainer");
	    this.svg       = this.container.append("svg").append("g");
	    this.draw();
  	}

  	shouldComponentUpdate(nextProps){
	    //this is updated from ontologywrapper so it clears all svg draws for a new render
	    if(this.props != nextProps){
	    	this.props = nextProps
	    	this.svg.selectAll("*").remove()
	    	this.draw()
	    	return true
	    }
	    return false;
	  }


  	draw(){
  		const vWidth = 2000;
    	const vHeight = 1000;

    	let trimming = false;
    	let removeGray = false;
    	let treeData = this.props.data;

  		//visualization containter size and initial drag position
	   const g = this.container.select('svg').attr('width', vWidth).attr('height', vHeight)
	       .select('g').attr('transform', 'translate(' + vWidth / 2 + ',' + vHeight / 2 + ')');

	   //tree size
	   const vLayout = d3.tree().size([2 * Math.PI, Math.min(vWidth * 2, vHeight * 2)]); // margin!
	   console.log(this.props)
	   // Layout + Data
	   const vRoot = d3.hierarchy(treeData);
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
	    g.selectAll(".node").data(newNodes).enter()
	    	.append("path")
	    	.attr("transform", function (d) {return "translate(" + d.data.locationX + "," + d.data.locationY + ")"; })
	    	.attr("d", d3.symbol()
        		.size(function(d) { console.log(d.data.size) 
        			return d.data.size * 5.0; })
        		.type(function(d) { return d.data.shapeType; }))
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
  		return <div></div>
  	}

}

export default TreeVisualization;