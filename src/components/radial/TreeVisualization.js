// @TODO cleanup file to not require this disable
/* eslint-disable */

import React, {Component, PureComponent} from 'react';
import * as d3 from "d3";
import { makeStyles } from '@material-ui/core/styles';
import {layoutRadialLayer} from "../../common/visualUtils";


class TreeVisualization extends PureComponent{

	constructor(){
		super();
	}

	componentDidMount() {
	    this.container = d3.select("#TreeContainer");
	    this.svg       = this.container.append("svg").append("g");
	    this.draw();
  	}

/*  	shouldComponentUpdate(nextProps){
	    //this is updated from ontologywrapper so it clears all svg draws for a new render
	    if(this.props != nextProps){
	    	this.props = nextProps
	    	this.svg.selectAll("*").remove()
	    	this.draw()
	    	return true
	    }
	}*/

    render(){	console.log("render");
		this.svg.selectAll("*").remove();
		draw();
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
	//    let newNodes = []
	//    if(trimming == true || removeGray == "1"){
	//      for(let i = 0; i < vNodes.length; i++){
	//        if(vNodes[i].data.hide != true){
	//          newNodes.push(vNodes[i])
	//        }
	//      }
	//    }else{
	//      newNodes = vNodes
	//    }

		if(this.props.layoutRadial){
			layoutRadialLayer(this.props.data)
		}

	   	d3.tree(vRoot)
	   // Compute the layout.
		const dx = 10;
		const dy = 640 / (vRoot.height + 1);
		d3.tree().nodeSize([dx, dy])(vRoot);

		// Center the tree.
		let x0 = Infinity;
		let x1 = -x0;
		vRoot.each(d => {
			if (d.x > x1) x1 = d.x;
			if (d.x < x0) x0 = d.x;
		});



	    //straight links
		//if there is a location element populated in the data use that set location. Else use generated tree x and y
	    const link = g.selectAll(".link")
	        .data(vLinks)
	        .enter().append("line")
	        .attr("class", "link")
	        .attr("stroke", "#ccc")
	        .attr('stroke-width', '1px')
	        .attr("x1", function (d) {
	          return (d.source.data.locationX) ? d.source.data.locationX : d.source.x;
	        })
	        .attr("y1", function (d) {
	          return (d.source.data.locationY) ? d.source.data.locationY : d.source.y;
	        })
	        .attr("x2", function (d) {
	          return (d.target.data.locationX) ? d.target.data.locationX : d.target.x;
	        })
	        .attr("y2", function (d) {
	          return (d.target.data.locationY) ? d.target.data.locationY : d.target.y;
	        })
		  .style("stroke-opacity", function(d) { return (d.target.data.opacity) ? d.target.data.opacity  : 0.8; });

	    //creates divergent scale that interpolates from purple to orange in the range from 0-1 (0.5 = white)
	    var colorDivergent = d3.scaleSequential(d3.interpolatePuOr).domain([0,1])

	    //styling for the nodes in tree
		console.log(vNodes)
	    g.selectAll(".node").data(vNodes).enter()
	    	.append("path")
	    	.attr("transform", function (d) {
				let xpos = (d.data.locationX) ? d.data.locationX : d.x;
				let ypos = (d.data.locationY) ? d.data.locationY : d.y;
				return "translate(" + xpos + "," + ypos + ")"; })
	    	.attr("d", d3.symbol()
        		.size(function(d) { return (d.data.size) ? d.data.size * 5.0 : 50.0; })
        		.type(function(d) { return (d.data.shapeType) ? d.data.shapeType : d3.symbolCircle; }))
	        	.style("fill-opacity", function(d) { return (d.data.opacity) ? d.data.opacity  : 0.8; })
	        .style("stroke", "black")
	          	.style("stroke-opacity", function(d) { return (d.data.opacity) ? d.data.opacity  : 0.8; })
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
	          	d3.select("#tooltip")
	              	.attr("transform", "translate(" + d.data.locationX + "," + d.data.locationY + ")")
	              	.select("#value")
	              	.style("color", "black")
	              	.text((d.data.breadCrumbLabel) ? d.data.breadCrumbLabel : "")
					.call(wrap)

				d3.select("#assignmenttooltip")
					.select("#value")
					.append('p')
					.append("tspan")
					.attr("dy", 25)
					.attr('x', 0)
					.style("color", "black")
					.text((d.data.label) ? d.data.label : "")
					.call(wrap)
	            
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

		//function to split the node label by \n because d3 doesnt do that...:(
		function wrap(text, width) {
			text.each(function() {
			  var text = d3.select(this),
				  words = text.text().split(/\n+/).reverse(),
				  word,
				  line = [],
				  lineNumber = 0,
				  lineHeight = 1.1, // ems
				  y = text.attr("y"),
				  dy = parseFloat(text.attr("dy")),
				  tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
				  console.log(words)
			  while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(" "));
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append('p').append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
				
			  }
			});
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
  		return <div>
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
			<div id={"TreeContainer"}></div>
		</div>
  	}

}

export default TreeVisualization;
