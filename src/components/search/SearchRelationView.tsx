import React, {FunctionComponent} from "react";

import {getJSONData, postJSONData} from "../../common/util";
import {Button, CircularProgress, createStyles, Paper, TextField, Theme} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {RouteComponentProps} from "react-router";
import {SearchRelation} from "./SearchRelation";

const useStyles = makeStyles((theme: Theme) =>
    createStyles ( {
        textField: {
            margin: theme.spacing(2),
            width: 400,
        },
        margin: {
            margin: theme.spacing(1, 0),
        },
        paper: {
          marginTop: '0%',
          marginBottom: '10%'
        },
    }));



interface MatchParams {
    id: string;
}

interface Props extends RouteComponentProps<MatchParams>{
    api_url: string;
    user_id: any;
}

interface ViewInfo {
    data: any;
    fetched: boolean;
    init_fetched: boolean;
    transform: string;
}





const createEmptyInfo = (): ViewInfo => {
    return {
        data: null,
        fetched: false,
        init_fetched: false,
        transform: "translate(150, 150)"
    };
};


export const SearchRelationView: FunctionComponent<Props> = ({
                                                                history,
                                                                location,
                                                                match,
                                                                api_url,
                                                                user_id,

}) => {
    const [viewInfo, setViewInfo] = React.useState(
        createEmptyInfo()
    );

    const classes = useStyles();

    if (!viewInfo.fetched) {
        console.log("pinging");

	//Erik says: there must be a better way to parse GET parameters?
	var k = "20"
	if (location.search.split("k=")[1])
              k = location.search.split("k=")[1].split("&")[0];

	var matchpool = "all"
	if (location.search.split("matchpool=")[1])
              matchpool = location.search.split("matchpool=")[1].split("&")[0];

	var matID = "1"
	if (location.search.split("matID=")[1])
              matID = location.search.split("matID=")[1].split("&")[0];

	

	//	var url = "https://cors-anywhere.herokuapp.com/https://csmaterials-search.herokuapp.com/search/?matID=254&k=20"
	var url = "https://cors-anywhere.herokuapp.com/https://csmaterials-search.herokuapp.com/search?matID="+matID
	  +"&matchpool="+matchpool
	  +"&k="+k;
        getJSONData(url, {}).then(resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            }
            else {
                if (resp['status'] === "OK") {
                    const data = resp['data'];
                    console.log(data)
                    setViewInfo({...viewInfo, init_fetched: true, fetched: true, data})
                }
            }
        })


    }


    console.log(viewInfo.data)

    return (
        <div>
            {
                viewInfo.fetched && viewInfo.data !== null? (
                    <div id={"matrix-container"}>
                        <SearchRelation data={viewInfo.data}/>
                    </div>
                    ):
                    <CircularProgress/>
            }
        </div>
    )
};
