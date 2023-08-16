// @TODO cleanup file to not require this disable
/* eslint-disable */

import React, {FunctionComponent, Component, useEffect} from 'react';
import TreeVisualization from './TreeVisualization'
import {getOntologyTree, getMaterialLeaves, getMaterialsTags} from '../../common/csmaterialsapiinterface';
import {OntologyData} from '../../common/types';
import {applyTree, uniqueTags, filterTree, countTags} from '../../common/treeprocessing';
import * as d3 from "d3";


interface Props {
    api_url: string;
    courseIds: Array<number>;
    threshold: number;
}

export const RadialModel : FunctionComponent<Props>  = ({
api_url,
courseIds,
threshold
}) => {
 let [tree, setTree] = React.useState<OntologyData>({id:0,title:"",instance_of:"root",children:[]});
 
useEffect(()=>{
	console.log("init");
	//populate ltree
	let ltree: OntologyData = {id:0,title:"",instance_of:"root",children:[]};
	let treepromise:Promise<void> = getOntologyTree("acm", api_url)
	  .then (t=>{ltree=t;});//no need to return, but need something in the promise
	
	let pr: Record<number,Array<number>> = {};
	let all_pr: Array<Promise<void>> = [];

	//retrieves the set tags for each course
	courseIds.forEach(id => {
	  all_pr.push(getMaterialLeaves(id, api_url)
	  .then(matids => getMaterialsTags(matids, api_url))
	  .then(tagmapping => {
	    pr[id] = Array.from(uniqueTags(tagmapping));
	    })
	  );
	});

	Promise.all([treepromise, ...all_pr])
	  .then((values) =>{
	    let alltags:Array<number> = [];
	    for (let id in pr) {
	      alltags = alltags.concat(pr[id]);
	    }
	    let tagcount:Record<number, number> = countTags(pr);

	    //restrict the tree to tags that are included in one of the courses
	    let ft = filterTree(ltree,
	      (a:OntologyData) => (alltags.includes(a.id) && tagcount[a.id]>= threshold*courseIds.length));
	    if (ft != undefined) {
              ltree = ft;

	      //styling root
	      {
	        let x:any = ltree;
		x.color= "red";
	      }
	      //add formating
      	      applyTree(ltree, (a:OntologyData) => {
	        let x:any = a;
	        x.label = a.title;
	      });
	      //scale nodes based on number of hits;
	      applyTree(ltree, (a:OntologyData)=> {
	        if (alltags.includes(a.id)) { //all leaves are in all tags, but intermedia nodes may not be
		  let x:any = a;
		  x.size = tagcount[a.id] * 5.;
		  x.color = "blue";
		}
	      });
	      setTree(ltree);
	    }
	  });
	
},[]);

return (
	    <TreeVisualization data={tree} layoutRadial={true}/>
    );
};

export default RadialModel;
