// @TODO cleanup file to not require this disable
/* eslint-disable */

import React, {Component, useEffect} from 'react';
import TreeVisualization from './TreeVisualization'
import * as d3 from "d3";


interface Props {
    api_url: string;
}

class AcmCoreRadial extends Component<Props> {
      

constructor(props: Props) {
super(props)
}



 render() {
	let tree= {label: "something",
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
	    <TreeVisualization data={tree} layoutRadial={true}/>
    );
    }  
}

export default AcmCoreRadial;
