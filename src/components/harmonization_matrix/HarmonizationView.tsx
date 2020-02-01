import React, {FunctionComponent} from "react";

import Matrix from "./Matrix";
import {getJSONData} from "../../util/util";
import {CircularProgress, createStyles, Paper, TextField, Theme} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {RouteComponentProps} from "react-router";



const useStyles = makeStyles((theme: Theme) =>
    createStyles ( {
        textField: {
            margin: theme.spacing(2),
            width: 400,
        },
    }));



interface MatchParams {
    id: string;
}

interface Props extends RouteComponentProps<MatchParams>{
    api_url: string;
}

interface ViewInfo {
    data: MaterialData[];
    ids: string;
    fetched: boolean;
}

interface MaterialData {
    id: number | null;
    title: string;
    description: string
    instance_of: string;
    upstream_url: string;
    tags: TagData[];
}

export interface TagData {
    id: number;
    title: string;
    bloom: string;
    type: string;
}

const createEmptyInfo = (): ViewInfo => {
    return {
        data: [],
        ids: "",
        fetched: false,
    };
};


export const HarmonizationView: FunctionComponent<Props> = ({
                                                                history,
                                                                location,
                                                                match,
                                                                api_url,

}) => {
    const [viewInfo, setViewInfo] = React.useState(
        createEmptyInfo()
    );


    const classes = useStyles();

    if (!viewInfo.fetched) {
        console.log("pinging");
        const url = api_url +  "/data/materials" + location.search;

        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        getJSONData(url, auth).then(resp => {
            console.log(resp);
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            } else {
                if (resp['status'] === "OK") {
                    const data = resp['data'];

                    setViewInfo({...viewInfo, fetched: true, data})
                }
            }
        })


    }

    const onTextFieldChange = (field_id: string) => (e: React.ChangeEvent<HTMLInputElement>): void => {
        let fields = viewInfo;
        // @TODO @FIXME bad form
        fields = {...fields, [field_id]: e.currentTarget.value, fetched: false};
        setViewInfo(fields);
    };


    return (
        <div>
            {
                /* Dynamic loading broken
                           <Paper>
                               <TextField
                                   label={"Set of IDs"}
                                   value={viewInfo.ids}
                                   className={classes.textField}
                                   onChange={onTextFieldChange("ids")}
                               />
                </Paper>
                 */
                }
            {
                viewInfo.fetched ?
                    <Matrix data={viewInfo.data}/> :
                    <CircularProgress/>
            }
        </div>
    )
};