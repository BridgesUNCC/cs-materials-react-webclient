import React, {FunctionComponent} from "react";

import {Matrix} from "./Matrix";
import {Analyze} from "../analyze/Analyze";
import {getJSONData, postJSONData} from "../../common/util";
import {Button, CircularProgress, createStyles, Paper, TextField, Theme} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {RouteComponentProps} from "react-router";
import {Bicluster} from "./Bicluster";

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
          marginBottom: '0%'
        },
        matrix: {
            marginLeft: '-30%',
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
    data: HarmonizationData | null;
    ids: string;
    filter: string;
    fetched: boolean;
    init_fetched: boolean;
    transform: string;
}

interface MaterialData {
    id: number | null;
    title: string;
    description: string
    instance_of: string;
    material_type: string;
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
    new_title: string;
}

export interface HarmonizationData {
    mapping: MappingData[],
    material_axis: AxisData[],
    tag_axis: AxisData[],
}

export interface BiclusterData {
    pair: number[];
    bit: number[];
    pattern?: string[];
}

const createEmptyInfo = (): ViewInfo => {
    return {
        data: null,
        ids: "",
        filter: "",
        fetched: false,
        init_fetched: false,
        transform: "translate(150, 150)"
    };
};


export const HarmonizationView: FunctionComponent<Props> = ({
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

        let ids = "";
        let tag_types = "";
        if (!viewInfo.init_fetched) {
            if (location.search.split("ids=")[1])
                ids = location.search.split("ids=")[1].split("&")[0];
            if (location.search.split("tag_types=")[1])
                tag_types = location.search.split("tag_types=")[1].split("&")[0];
        } else {
            ids = viewInfo.ids;
        }

        const url = api_url + "/data/harmonization?ids=" + ids + "&tag_types=" + tag_types;
        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        const material_url = api_url + "/data/list/materials?ids=" + ids
        let updated_material_axis: AxisData[] = [];
        let all_ids = ids.split(",");
        for(let i = 0; i < all_ids.length; i++){
                updated_material_axis.push({id:Number(all_ids[i]), title:"test", new_title: "test"})
        }

        getJSONData(material_url, auth).then(resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            } else {
                if(resp['status'] === "OK"){
                    let material_data = resp['data'];
                    console.log(material_data)

                    for(let i = 0; i < material_data.length; i++){
                        for(let j = 0; j < updated_material_axis.length; j++){
                            if(updated_material_axis[j].id == material_data[i].id){
                                updated_material_axis[j].title = material_data[i].title
                                updated_material_axis[j].new_title = material_data[i].title
                            }
                        }
                    }
                }
            }

        })


        getJSONData(url, auth).then(resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            } else {
                if (resp['status'] === "OK") {
                    let data: HarmonizationData = resp['data'];

                    for(let i = 0; i < updated_material_axis.length; i++){
                        var index = data.material_axis.findIndex(x => x.id==updated_material_axis[i].id); 
                        if(index === -1){
                            data.material_axis.push(updated_material_axis[i])
                        }
                    }
                    
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

                    const fix_matrix = (data: HarmonizationData): void => {
                        let fixed_mapping = Array(data.mapping.length);
                        let row_len = data.tag_axis.length;

                        data.mapping.forEach(value => {
                            let x = value.tag_index;
                            let y = value.mat_index;
                            let index = (y * row_len + x);
                            value.index = index;

                            // insert mapping into proper location for encoding
                            fixed_mapping[index] = value;
                        });

                        //hack to sort matrix in decending order
                        for(let i = 0; i < data.material_axis.length; i++){
                            let count = 0
                            for(let j = 0; j < data.tag_axis.length; j++){
                                fixed_mapping[i * row_len + j].tag_index = data.tag_axis.length-1 - count; 
                               count++;
                            }
                               
                            
                        }
                        data.mapping = fixed_mapping;
                        data.tag_axis.reverse();
                    };

                    fix_matrix(data);

                    //data = Bicluster(data);

                    setViewInfo({...viewInfo, init_fetched: true, fetched: true, data, ids})
                }
            }
        })


    }

    const onTextFieldChange = (field_id: string) => (e: React.ChangeEvent<HTMLInputElement>): void => {
        let fields = viewInfo;
        fields = {...fields, [field_id]: e.currentTarget.value, fetched: false};
        setViewInfo(fields);
    };

    //fucntion to handle how a cell reacts when clicked based on if it was already selected or removed
    //from the materials tag list
    const handleBoxToggle = (selected: MappingData, transform: string) => {
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

            setViewInfo({...viewInfo, data: new_data, transform});
        }

    };

    const onCluster = () => {
        let data: HarmonizationData
        if(viewInfo.data){
           data = Bicluster(viewInfo.data) 
           setViewInfo({...viewInfo, data:data})
        }
    }

    const onSubmit = () => {
        const ids = viewInfo.data?.material_axis.map(e => e.id);
        const post_url = api_url + "/data/post/material";
        const fetch_url = api_url + "/data/materials/full?ids=" + ids;
        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        getJSONData(fetch_url, auth).then(resp => {
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
                    console.log(post_data)
                    postJSONData(post_url, post_data, auth).then((resp) => {
                        setViewInfo({...viewInfo, fetched: false});
                    });
                }
            }
        });
    };

    let listOne:any = viewInfo.ids.split(",").map(Number)

    return (
        <div>
            {
                <Paper className={classes.paper}>
                    <TextField
                        label={"Set of IDs"}
                        value={viewInfo.ids}
                        className={classes.textField}
                        onChange={onTextFieldChange("ids")}
                    />
                    {
                    <Button
                        className={classes.margin}
                        variant={"contained"}
                        onClick={onSubmit}
                    >
                        Submit Matrix
                    </Button>
                  }
                  {
                  // <Button
                  //       className={classes.margin}
                  //       variant={"contained"}
                  //       onClick={onCluster}
                  //   >
                  //       Bicluster Matrix
                  //   </Button>
                }
                </Paper>
            }
            {
                viewInfo.fetched && viewInfo.data !== null? (
                    <div id={"matrix-container"} className={classes.matrix}>
                        <Matrix data={viewInfo.data} handleClick={handleBoxToggle} transform={viewInfo.transform}/>
                    </div>
                    ):
                    <CircularProgress/>
            }
            <div id="tooltips">
              <div id="tooltipMatrix">
                <p><strong>Breadcrumbs: </strong></p>
                <p><span id="value"></span></p>
              </div>
            </div>
        </div>
    )
};
