// @TODO cleanup file to not require this disable
/* eslint-disable */

import React, {FunctionComponent, Component, useEffect} from 'react';
import TreeVisualization from './TreeVisualization'
import {getOntologyTree} from '../../common/csmaterialsapiinterface';
import {OntologyData} from '../../common/types';
import * as d3 from "d3";


interface Props {
    api_url: string;
}

export const AcmCoreRadial : FunctionComponent<Props>  = ({
api_url
}) => {
 let [tree, setTree] = React.useState<OntologyData>({id:0,title:"",instance_of:"root",children:[]});
 
useEffect(()=>{
	getOntologyTree("acm", api_url)
	.then(tr => {console.log(tr);setTree(tr);});
	},[]);

return (
	    <TreeVisualization data={tree} layoutRadial={true}/>
    );
};

export default AcmCoreRadial;
