// @TODO cleanup file to not require this disable
/* eslint-disable */

import React, {Component} from 'react';
import TreeVisualization from './TreeVisualization'
import * as d3 from "d3";


class RadialTesting extends Component {
    render(){
	let mydata= {label: "something",
		     //		     color: "red",
		     color: "#FF00EE",
		     shapeType: d3.symbolStar,
		     children:[{
			 label:"somethingelse",
			 size:3.0, 
			 children:[]
		     },{
			 label:"somethingelse",
			 opacity: .2,
			 children:[]
		     },{
			 label:"somethingelse",
			 children:[]
		     },{
			 label:"somethingelse",
			 children:[]
		     },{
			 label:"somethingelse",
			 children:[]
		     }]};
    return (
	    <TreeVisualization data={mydata} layoutRadial={true}/>
    );
  }
}

export default RadialTesting;
