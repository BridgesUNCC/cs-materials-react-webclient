import React, {FunctionComponent} from "react";

import {Matrix} from "./Matrix";
import {getJSONData, postJSONData} from "../../util/util";
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

                    /*
                        DO BICLUSTERING
                     */

                    //Function to encode the matrix into bits for comparison to
                    //minimize runtime for biclustering
                    const encodedMatrix = (): number[][] => {
                        let matrix = [];
                        //need length bits divisible by 4 during encoding so find remainder and add to length
                        let encodingRemainder = (data.tag_axis.length) % 4;
                        let encodingLength = (data.tag_axis.length);//the current length of the row to be encoded

                        //iterate over each row in the matrix to perform the encoding
                        for (let i = 0; i < data.material_axis.length; i++){
                            let encodedList = [];
                            //Since we are encoding 4 bits at a time, we start at every 4 columns
                            //and encode the 4 bits inbetween
                            for (let j = 0; j <= encodingLength - 4; j += 4){
                                let currentEncode = "";
                                //get the first encoded bits before remainders added
                                //add the remainder of 0's for make comparisons even
                                //iterate over the 4 bits to be encoded
                                for (let k = 0; k < 4; k++) {
                                    //if we reach the end of the columns in this row their is a remainder left (not divisible by 4)
                                    //add the remainder of 0's to the encoding
                                    if (encodingLength + encodingRemainder == j + k){
                                        for (let k = 4 - encodingRemainder; k < encodingRemainder; k++){
                                            currentEncode += "0";
                                        }
                                        //else just grab current weight for encoding
                                     } else {
                                        currentEncode += JSON.parse(JSON.stringify(data.mapping[j * encodingLength + i + k].weight > 0 ? "1" : "0"));
                                    }
                                }
                                //push current encoded 4 bits to the encoded list for this row/material
                                encodedList.push(parseInt(currentEncode, 2))
                            }
                            matrix.push(encodedList); //push encoded material list to global encoded matrix
                        }

                        return matrix;
                    };


                    //after the encoding of the matrix is done we generate biclusters using BiBit Pattern Algorithm
                    const genereateBiclusters = (matrix: number[][], mnr: number, mnc: number): BiclusterData[] => {
                        let pairs = [];//row pairs from bit comparisons
                        let bic: BiclusterData;//temp bicluster for building final cluster
                        let biclusters: BiclusterData[] = [];
                        //Start bitwise AND comparisons with each row
                        for (let i = 0; i < matrix.length; i++){
                            for (let j = matrix.length - 1; j > i; j--){
                                let currentPair = [];
                                //bitwise AND comparison of two rows
                                for(let m = 0; m < matrix[i].length; m++){
                                    currentPair.push(matrix[i][m] & matrix[j][m]);
                                }
                                //Loop through the list of bitwise encoded pairs to
                                //make sure current pair isnt a duplicate
                                let duplicate = false;
                                for (let n = 0; n < pairs.length; n++){
                                    //only check if list has pairs
                                    if(pairs.length > 1){
                                        if(JSON.stringify(pairs[n].bit)==JSON.stringify(currentPair)){
                                            duplicate = true;
                                        }
                                    }
                                }
                                //if current pair isn't a duplicate used already
                                if (!duplicate) {
                                    //add current pair to the temp bicluster to build
                                    bic = {pair: [i, j], bit: currentPair};
                                    //loop through the rest of the matrix rows and see if bitwise AND
                                    //has same result to match for biclustering
                                    for(let k = 0; k < matrix.length; k++){
                                        //if same row dont compare
                                        if ((k == i || k == j) && k != matrix.length){
                                            k++
                                        } else {
                                            let tempCompare = [];
                                            //bitwise AND compare of the current row
                                            for (let m = 0; m < currentPair.length; m++){
                                                tempCompare.push(currentPair[m] & matrix[k][m]);
                                            }
                                            //see if the result from comparison matches current pairs to cluster
                                            if (JSON.stringify(tempCompare)==JSON.stringify(currentPair)){
                                                //add to temp bicluster
                                                bic.pair.push(k);
                                            }
                                        }
                                    }
                                    //check if the temp bicluster has 2 or more rows and is not all 0's
                                    if (bic.pair.length >= mnc && parseInt(bic.bit.join(''), 2) !== 0) {
                                        biclusters.push(bic);//add to global bicluster list
                                    }
                                }
                                //add the encoded pair to pairs list to not repeat same sequence
                                pairs.push({pair: i.toString() + j.toString(), bit: currentPair})
                            }
                        }
                        return biclusters;
                    };

                    //after all bicluster are created and formed
                    //decode the bicluster matrix and determine clusters to be used
                    const decodeMatrix = (matrix: number[][], biclusters: BiclusterData[]): BiclusterData[] => {
                        let tempLength = 0;
                        let largestBI: BiclusterData = {pair: [], bit: []}; //largest bicluster
                        let usedRows: number[] = []; //list of used rows to avoid collisions
                        let otherClusters = [];

                        for(let i = 0; i < biclusters.length; i++){
                            //sums the int size of the bicluster pair to determine the biggest cluster
                            //to use as the first bicluster
                            if(tempLength < biclusters[i].bit.reduce((a, b) => a + b, 0)){
                                largestBI = biclusters[i];
                                tempLength = biclusters[i].bit.reduce((a, b) => a + b, 0)
                                //checks through all other bicluster pairs and includes biclusters that
                                //have not had their rows used yet to avoid collisions
                            }
                        }
                        usedRows = usedRows.concat(largestBI.pair);
                        otherClusters.push(largestBI);
                        for(let i = 0; i < biclusters.length; i++){
                            if (!usedRows.some(v => biclusters[i].pair.includes(v))) {
                                usedRows = usedRows.concat(biclusters[i].pair);
                                otherClusters.push(biclusters[i]);//non largest biclusters
                            }
                            console.log(otherClusters)
                        }

                        for(let j = 0; j < data.tag_axis.length - 4; j+=4){

                            for(let m = 0; m < otherClusters.length; m++){
                                let pattern: string[] = [];
                                for(let k = 0; k < otherClusters[m].bit.length; k++){
                                    let p = otherClusters[m].bit[k].toString(2).split('');
                                    //after converting from int to binary, add zeros to the end to equal 4 bits
                                    //int 0.toString(2) -> binary 0.unshift -> '0000'
                                    if(p.length < 4){
                                        for(let i = 4 - p.length; i > 0; i--){
                                            p.unshift("0");
                                        }
                                    }
                                    pattern = pattern.concat(p)
                                }
                                otherClusters[m].pattern = pattern;
                            }
                        }
                        return otherClusters;
                    };

                    const highlightBiclusters = (otherClusters: BiclusterData[]): void => {
                        for(let i = 0; i < otherClusters.length; i++){
                            for(let j = 0; j < otherClusters[i].pair.length; j++){
                                for(let k = 0; k < data.mapping.length; k++){
                                    if (data.mapping[k].tag_index == otherClusters[i].pair[j] &&
                                        otherClusters[i].pattern?.[k - data.tag_axis.length * data.mapping[k].mat_index] === "1"){

                                        data.mapping[k].weight = 0.6
                                    }
                                }
                            }
                        }
                    };

                   // let matrix = encodedMatrix();
                    //let biclusters = genereateBiclusters(matrix,2, 4);
                    //let otherClusters = decodeMatrix(matrix, biclusters);
                    //highlightBiclusters(otherClusters);

                    //console.log(data);
                    //console.log(biclusters);
                   // console.log(otherClusters);

                    const fix_matrix = (data: HarmonizationData): void => {
                        let fixed_mapping = Array(data.mapping.length);
                        let row_len = data.tag_axis.length;

                        data.mapping.forEach(value => {
                            let x = value.tag_index;
                            let y = value.mat_index;

                            // insert mapping into proper location for encoding
                            fixed_mapping[(y * row_len) + x] = value;
                        });

                        data.mapping = fixed_mapping;
                    };

                    fix_matrix(data);
                    data = Bicluster(data);

                    setViewInfo({...viewInfo, init_fetched: true, fetched: true, data, ids, filter})
                }
            }
        })


    }

    const onTextFieldChange = (field_id: string) => (e: React.ChangeEvent<HTMLInputElement>): void => {
        let fields = viewInfo;
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