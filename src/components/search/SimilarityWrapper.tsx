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
}

export const SimilarityWrapper: FunctionComponent<Props> = ({
    api_url
}) => {
    const [idListState, setIdListState] = React.useState<string|null>(null);
    const [data, setData] = React.useState<string|null>(null);
    const [materialInfo, setMaterialInfo] = React.useState<Object>({});
    let { search } = useLocation();
    let idList : string|null = null, id1 : string|null = null, id2 : string|null = null; 
        if (search.split("id=")[1]) 
            id1 = search.split("id=")[1].split("&")[0];
        if (search.split("id2=")[1]) 
            id2 = search.split("id2=")[1].split("&")[0];
    id2 === null ? idList = id1 : idList = id1! + "," + id2!;
    if(idListState !== idList) setIdListState(idList);


    useEffect(() => {
        updateGraph();
    }, [idListState]);


    function updateGraph(){
        let newData = createEmptyParams();
        //Getting the data from the similarity API so that the graph can actually get drawn
        var url = 'https://csmaterials-search.herokuapp.com/similarity?'+
        `matID=${idList}`;
        getJSONData(url, {}).then(resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            }
            else {
                if (resp['status'] === "OK") {
                    newData.data = resp['data'];
                           //Getting the data regarding hte materials selected so that the graph can use that and display it
                    url = api_url + "/data/list/materials?ids=" + idList;
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
                                setData(resp['data']);
                            }
                        }
                    })
                }
            }
        })
    }

    return (
      <div>
            <SearchRelation  names={materialInfo} data={data}/>
      </div>
      
    )
};
