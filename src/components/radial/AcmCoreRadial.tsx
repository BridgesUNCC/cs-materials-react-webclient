// @TODO cleanup file to not require this disable
/* eslint-disable */

import React, {FunctionComponent, Component, useEffect} from 'react';
import TreeVisualization from './TreeVisualization'
import {getOntologyTree, acmCS13Core1, acmCS13Core2} from '../../common/csmaterialsapiinterface';
import {OntologyData} from '../../common/types';
import {applyTree} from '../../common/treeprocessing';
import * as d3 from "d3";


interface Props {
    api_url: string;
}

export const AcmCoreRadial : FunctionComponent<Props>  = ({
api_url
}) => {
 let [tree, setTree] = React.useState<OntologyData>({id:0,title:"",instance_of:"root",children:[]});
 
useEffect(()=>{
	console.log("init");
	getOntologyTree("acm", api_url)
	.then(tr => {
		 let core1 = acmCS13Core1();
		 let core2 = acmCS13Core2();
		 console.log("got tree");
		 applyTree(tr, (o:OntologyData) => {
		   let x: any = o
		   x["label"] = o.title;
		   if (core1.includes(o.id)) {
		     x.color = "red";
		     x.shapeType= d3.symbolStar;
		     } else
		   if (core2.includes(o.id)) {
		     x.color = "blue";
		     x.shapeType= d3.symbolSquare;
		     }
		 });
		 console.log(tr);
		 setTree(tr);
	});
	},[]);

return (
	    <TreeVisualization data={tree} layoutRadial={true}/>
    );
};

export default AcmCoreRadial;
