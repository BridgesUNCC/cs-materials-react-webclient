import React, {FunctionComponent, useEffect, useRef} from "react";
import {Button, CircularProgress, createStyles, Paper, TextField, Theme} from "@material-ui/core";
import {RouteComponentProps} from "react-router";
import {getJSONData, parse_query_variable} from "../../common/util";
import {makeStyles} from "@material-ui/core/styles";
import { SimilarityWrapper } from './SimilarityWrapper';

import { useLocation } from "react-router-dom";
import { SearchRelation } from "./SearchRelation";
import {getMaterialMeta} from '../../common/csmaterialsapiinterface';
import {getMaterialLeaves} from '../../common/csmaterialsapiinterface';
import {expandCollectionToListLeave} from '../../common/csmaterialsapiinterface';


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
    id: number
}
export const SimilaritySubcollection: FunctionComponent<Props> = ({
    api_url,
    searchapi_url,
    id 
}) => {
    const [renderIds, setRenderIds] = React.useState<Array<Array<number>>>([[]]);
				   

    useEffect(
    () => {
       expandCollectionToListLeave(id, api_url).then((value:any) => {
               setRenderIds(value);
        });
       
    }, []
    );

				
    let content =  (
	<SimilarityWrapper api_url={api_url} searchapi_url={searchapi_url} ids={renderIds}  />
	)

    return content;

};
