import React, {FunctionComponent, useEffect, useRef} from "react";
import {Button, CircularProgress, createStyles, Paper, TextField, Theme} from "@material-ui/core";
import {RouteComponentProps} from "react-router";
import {getJSONData, parse_query_variable} from "../../common/util";
import {makeStyles} from "@material-ui/core/styles";

import { useLocation } from "react-router-dom";
import { SearchRelation } from "./SearchRelation";
import { getSimilarityData} from "../../common/csmaterialsapiinterface";

interface SearchParams {
    data: any;
    loading: Boolean;
    materialInfo: any;
}
const createEmptyParams = () : SearchParams => {
    return {
        data: [],
        loading: true,
        materialInfo : {}
    }
}
interface Props {
    api_url: string;
    searchapi_url: string;
    ids: Array<Array<number>>
}

/*
Provides a component to see a graph of similarity between a set of materials. The component provides support to organize the materiasl in different sets that  are rendered with different visual attributes.

TODO: Currently you can not have two similarityWrapper on the same page visible at once. They will "eat" each other because of how SearchRelation is written
			
params:
			
ids:  a Array<Array<number> which indicates the set of materials IDs that need to be analyzed. If you want to see the similarity of three materials you would pass [[1,2,3]], but if you want to see the difference between different sets, you would pass [[1,2,3],[4,5,6],[7,8],[10]]
						
*/			
export const SimilarityWrapper: FunctionComponent<Props> = ({
    api_url,
    searchapi_url,
    ids 
}) => {
    const [renderIds, setRenderIds] = React.useState<Array<Array<number>>>(ids);
    const [similarityData, setSimilarityData] = React.useState<string|null>(null);
    const [materialInfo, setMaterialInfo] = React.useState<Object>({});

    useEffect(() => {
//	console.log("useEffect in SimilarityWrapper. renderIds are :"+renderIds.toString());
	if (renderIds[0].length > 0)
            updateGraph();
    }, [renderIds]);

    /* if ids happen to be an upstream state, update view on update of that upstream state. */
    useEffect(() => {
	setRenderIds(ids);
    }, [ids]);
							      
    function updateGraph(){
        let newData = createEmptyParams();

        //Getting the data from the similarity API so that the graph can actually get drawn
	getSimilarityData(renderIds.flat(), searchapi_url)
	    .then((simData) =>{
                    newData.data = simData;
                           //Getting the data regarding the materials selected so that the graph can use that and display it
                const url = api_url + "/data/list/materials?ids=" + renderIds.toString();
                    getJSONData(url, {}).then(resp2 => {
                        if (resp2 === undefined) {
                            console.log("API SERVER FAIL")
                        }
                        else {
                            if (resp2['status'] === "OK") {
                                //Setting the state and creating an object (nameObject) that holds the name of the inputted ID's
                                let materialList = resp2['data'];
                                let nameObject = {};
                                if(Array.isArray(materialList)){
                                    materialList.map(i => nameObject = {...nameObject, [i.id]: i.title});
                                }
                                setMaterialInfo(nameObject);
                                setSimilarityData(simData);
                            }
                        }
                    })
            })
    }

    return (
      <div>
	  <SearchRelation  names={materialInfo} similarityData={similarityData} ids={ids} />
      </div>
      
    )
};
