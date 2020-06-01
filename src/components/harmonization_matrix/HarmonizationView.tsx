import React, {FunctionComponent} from "react";

import {Matrix} from "./Matrix";
import {getJSONData, postJSONData} from "../../util/util";
import {Button, CircularProgress, createStyles, Paper, TextField, Theme} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {RouteComponentProps} from "react-router";



const useStyles = makeStyles((theme: Theme) =>
    createStyles ( {
        textField: {
            margin: theme.spacing(2),
            width: 400,
        },
        margin: {
            margin: theme.spacing(1),
        },
    }));



interface MatchParams {
    id: string;
}

interface Props extends RouteComponentProps<MatchParams>{
    api_url: string;
}

interface ViewInfo {
    data: HarmonizationData | null;
    ids: string;
    filter: string;
    fetched: boolean;
    init_fetched: boolean;
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
    title?: string;
    bloom?: string;
    type?: string;
}

export interface MappingData {
    mat_id: number;
    mat_index: number;
    tag_id: number;
    tag_index: number;
    weight: number;
    index: number;
}

export interface AxisData {
    title: string;
    id: number;
}

export interface HarmonizationData {
    mapping: MappingData[],
    material_axis: AxisData[],
    tag_axis: AxisData[],
}

const createEmptyInfo = (): ViewInfo => {
    return {
        data: null,
        ids: "",
        filter: "",
        fetched: false,
        init_fetched: false,
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

        let ids = "";
        let filter = "";
        if (!viewInfo.init_fetched) {
            if (location.search.split("ids=")[1])
                ids = location.search.split("ids=")[1].split("&")[0];
            if (location.search.split("filter=")[1])
                filter = location.search.split("filter=")[1].split("&")[0];
        } else {
            ids = viewInfo.ids;
        }

        console.log(ids);
        const url = api_url + "/data/harmonization?ids=" + ids + "&filter=" + filter;
        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        getJSONData(url, auth).then(resp => {
            console.log(resp);
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            } else {
                if (resp['status'] === "OK") {
                    let data: HarmonizationData = resp['data'];

                    // deep clone
                    const init_mapping = data.mapping.map(e => e);

                    //@FIXME this is probably bad form
                    // This will populate the mapping data with the non mapping relationships
                    data.material_axis.forEach((mat, i) => {
                        data.tag_axis.forEach((tag, j) => {
                            let found = false;
                            for (const element of init_mapping) {
                                if (element.mat_id === mat.id && element.tag_id === tag.id) {
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                data.mapping.push({
                                    index: data.mapping.length,
                                    mat_id: mat.id,
                                    mat_index: i,
                                    tag_id: tag.id,
                                    tag_index: j,
                                    weight: 0.0
                                });
                            }

                        });
                    });

                    console.log(data);

                    setViewInfo({...viewInfo, init_fetched: true, fetched: true, data, ids, filter})
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

    const handleBoxToggle = (selected: MappingData) => {
        if (viewInfo.data !== null) {
            let mapping = viewInfo.data.mapping;

            if (mapping[selected.index].weight > 0.0) {
                mapping[selected.index].weight -= 1.0;
            } else {
                mapping[selected.index].weight += 1.0;
            }

            let new_data = {
                ...viewInfo.data,
                mapping: mapping
            };

            setViewInfo({...viewInfo, data: new_data});
        }

    };

    const onSubmit = () => {


        const post_url = api_url + "/data/post/material";
        const fetch_url = api_url + "/data/materials?ids=" + viewInfo.ids;

        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        getJSONData(fetch_url, auth).then(resp => {
            console.log(resp);
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            } else {
                if (resp['status'] === "OK" && viewInfo.data !== null) {
                    let data: MaterialData[] = resp['data']['materials'];

                    let relevant_mapping = viewInfo.data.mapping.filter(element => element.weight > 0.0);

                    //@ts-ignore
                    let post_data = {"data": []};
                    data.forEach((material) => {
                        let tags = relevant_mapping.filter(element => element.mat_id === material.id);

                        material.tags = tags.map(element => {
                            return {"instance_of": "tag", "id": element.tag_id}
                        });

                        // @ts-ignore
                        post_data.data.push(material)
                    });

                    postJSONData(post_url, post_data, auth).then((resp) => {
                        setViewInfo({...viewInfo, fetched: false});
                    });
                }
            }
        });
    };


    return (
        <div>
            {
                <Paper>
                    <TextField
                        label={"Set of IDs"}
                        value={viewInfo.ids}
                        className={classes.textField}
                        onChange={onTextFieldChange("ids")}
                    />

                    <Button
                        className={classes.margin}
                        variant={"contained"}
                        onClick={onSubmit}
                    >
                        Submit Matrix
                    </Button>
                </Paper>
            }
            {
                viewInfo.fetched && viewInfo.data !== null? (
                    <div id={"matrix-container"}>
                        <Matrix data={viewInfo.data} handleClick={handleBoxToggle}/>
                    </div>
                    ):
                    <CircularProgress/>
            }
        </div>
    )
};