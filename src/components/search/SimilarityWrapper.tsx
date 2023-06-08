import React, {FunctionComponent, useEffect, useRef} from "react";
import {Button, CircularProgress, createStyles, Paper, TextField, Theme} from "@material-ui/core";
import {RouteComponentProps} from "react-router";
import {getJSONData, parse_query_variable} from "../../common/util";
import {makeStyles} from "@material-ui/core/styles";

import { useLocation } from "react-router-dom";
import { SearchRelation } from "./SearchRelation";

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

export const SimilarityWrapper: FunctionComponent<Props> = ({
    api_url,
    searchapi_url,
    ids
}) => {
    const [renderIds, setRenderIds] = React.useState<Array<Array<number>>>(ids);
    const [similarityData, setSimilarityData] = React.useState<string|null>(null);
    const [materialInfo, setMaterialInfo] = React.useState<Object>({});

    useEffect(() => {
        updateGraph();
    }, [renderIds]);


    function updateGraph(){
        let newData = createEmptyParams();
        //Getting the data from the similarity API so that the graph can actually get drawn
        var url = searchapi_url+'/similarity?'+
        `matID=${ids.toString()}`;
        getJSONData(url, {}).then(resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            }
            else {
                if (resp['status'] === "OK") {
                    newData.data = resp['data'];
                           //Getting the data regarding the materials selected so that the graph can use that and display it
                    url = api_url + "/data/list/materials?ids=" + ids.toString();
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
                                setSimilarityData(resp['data']);
                            }
                        }
                    })
                }
            }
        })
    }

    return (
      <div>
	  <SearchRelation  names={materialInfo} similarityData={similarityData} ids={ids} />
      </div>
      
    )
};
