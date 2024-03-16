// @ts-nocheck
import React, { FunctionComponent, useEffect, useState } from "react";
import * as d3 from 'd3';
import { CircularProgress, Paper, TextField, Button, FormGroup, FormControlLabel, Switch } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { getMaterials, getMaterialLeaves, getMaterialsTags } from "../../common/csmaterialsapiinterface";
import { getJSONData } from "../../common/util";
import {RouteComponentProps} from "react-router";
import {nmf} from "../../common/nmf";

// URLs
// Testing set: "/nmf?ids=177,703,1210,805?k=3?onlyOntology=true"
// CS1: "/nmf?ids=1210,1669,351,1132,1490,1697?k=3?onlyOntology=true"
// DS: "/nmf?ids=1210,703,178,177,805?k=3?onlyOntology=true"
// PDC: "/nmf?ids=1166,1203,179?k=2?onlyOntology=true"

// TODO:
// Sort tags by their 1st level tree node
// preorder DFS order; record the order in which you see the tags, when you order them (INSIDE THE GROUP; e.g algo) you will see all the tags together by their 1st level tree node
// ------------
// look into pruning meaningless tags; post process column of H that have all low values

interface MatchParams {
    id: string;
}

interface Props extends RouteComponentProps<MatchParams>{
    api_url: string;
    user_id: any;
}

interface NMFData {
    courses: string[],
    tags: number[],
    dimensions: number,
    W: number[][],
    H: number[][],
}

const useStyles = makeStyles((theme) => ({
  textField: {
    margin: theme.spacing(2),
    width: 400,
  },
  margin: {
    margin: theme.spacing(1, 0),
  },
  paper: {
    marginTop: "0%",
    marginBottom: "0%",
  },
  matrix: {
    marginLeft: "-30%",
  },
}));


export const NMFView: FunctionComponent<Props> = ({ api_url, location, history }) => {
    const classes = useStyles();
    const urlSearchParams = new URLSearchParams(location.search);
    const collectionIds = urlSearchParams.get("ids")?.split(",").map(Number) || [];
    const initialK = urlSearchParams.get("k") ? parseInt(urlSearchParams.get("k")!) : Math.round(collectionIds.length / 2);
    const initialOnlyOntology = urlSearchParams.get("onlyOntology") ? urlSearchParams.get("onlyOntology") === "true" : true;
    const [k, setK] = useState(initialK);
    const [onlyOntology, setOnlyOntology] = useState(initialOnlyOntology);

    const [isLoading, setIsLoading] = useState(true);
    const [matrix, setMatrix] = useState({});
    const [collections, setCollections] = useState({});
    const [allTags, setAllTags] = useState([]);
    const[error, setError] = useState("");
    
    
    useEffect(() => {
        // Update query parameters whenever k or onlyOntology changes
        history.push(`?ids=${collectionIds.join(",")}&k=${k}&onlyOntology=${onlyOntology}`);
    }, [k, onlyOntology]);

    function createMatrix() {
        // clear the svg
        d3.select("#my_heat_maps").selectAll("*").remove();
        // filter out tags that are not in the ontology
        const filteredMatrix = {};
        if (onlyOntology) {
            for (const course in matrix) {
                const row = matrix[course];
                const newRow = [];
                for (let i = 0; i < row.length; i++) {
                    if (allTags[i].type === "ontology") {
                        newRow.push(row[i]);
                    }
                }
                filteredMatrix[course] = newRow;
            }
        } else {
            for (const course in matrix) {
                filteredMatrix[course] = matrix[course];
            }
        }

        const realMatrix = Object.values(filteredMatrix);
        const maxIterations = 10;
        const tolerance = .0001;
        const nmfMatrix = nmf.mu(realMatrix, k, maxIterations, tolerance);
        
        let course_model: NMFData = {
            courses: Object.keys(matrix).map((courseID) => {
                return collections[courseID].title;
            }),
            tags: allTags,
            dimensions: k,
            W: nmfMatrix.W,
            H: nmfMatrix.H
        };
        
        // D3 Code
        let tooltip;
        //  mouse handlers
        function mouseOverHandler(evt, d) {
            tooltip.style("opacity", 1)
            d3.select(this)
                .style('opacity', 1)
            // get tag data
            document.getElementById('txt_id').innerHTML = `Tag: (${allTags[d%h_width].type}) ${allTags[d%h_width].title}`;
        }
        

        function mouseMoveHandler(evt, d) {
            tooltip.html('Cell Value: ' + d[0])
                .style('left', evt.x + 70 + 'px')
                .style('top', evt.y + 10 + 'px')
            d3.select(this)
                .attr('stroke-width', 1)
        }

        function mouseLeaveHandler(evt, d) {
            tooltip.style('opacity', 0)
            d3.select(this)
                .attr('stroke-width', 0.2)
                .attr('opacity', 0.8)
        }
        const margin = {top: 0, right: 0, bottom: 0, left: 0};

        // fix rect sizes  and padding for the W and H matrices
        // rects are square and padding is space between two rectangles
        const w_rect_size = 15, w_padding = 3;
        const h_rect_size = 5, h_padding = 1;
        const svg = d3.select('#my_heat_maps');
        // let w = svg.attr('width');
        // let h = svg.attr('height');
        // let width = w - margin.left - margin.right,
        //     height = h - margin.top - margin.bottom;

        // svg.append("g")
        //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        //     .append('rect')
        //     .attr("width", width)
        //     .attr("height", height)
        //     .attr("fill", 'none')
        //     .attr('stroke', 'green')
        //     .attr('stroke-width', 1)
        //     .attr('stroke-opacity', 0.1)


        let h_width = course_model.H[0].length, h_height = course_model.H.length;
        let w_width = course_model.W[0].length, w_height = course_model.W.length;

        // flatten the matrix values and put them in with an index for d3 processing
        // compute range for opacity mapping
        let w_matrix_vals = course_model.W.flat();
        let w_vals = d3.range(w_width*w_height).map (j => [j, w_matrix_vals[j]]);

        let course_vals = d3.range(w_height).map (j => [j, course_model.courses]);

        // now the H matrix
        let h_matrix_vals = course_model.H.flat();
        let h_vals = d3.range(h_width*h_height).map (j => [j, h_matrix_vals[j]]);

        // create a tooltip and mouse handlers
        tooltip = d3.select("#my_heat_maps")
            .append('div')
            .attr('opacity', 0)
            .attr('class', 'tooltip')
            .style('background-color', 'white')
            .style("border", 'solid')
            .style('border-width', '2px')
            .style("border-radius", "5px")
            .style("padding", "5px")

        // add the heat map rects for the W matrix
        svg.selectAll('w_rects')
            .data(w_vals)
            .enter()
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .append("rect")
            .attr('transform', function(d) { return 'translate(' + 
                        (d[0]%w_width)*(w_rect_size+w_padding) + ',' + 
                        Math.floor(d[0]/w_width)*(w_rect_size+w_padding) + ')';})
            .attr("width", w_rect_size)
            .attr("height", w_rect_size)
            .attr("fill", d => d3.interpolateYlOrRd(d[1]))
            .attr('stroke', 'black')
            .attr('stroke-width', 0.2)

        // put in the course labels
        svg.selectAll ('course_labels')
            .data (course_vals)
            .enter()
            .append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .append('text')
            .attr('fill', 'white')
            .attr('font-size', 18)
            .attr('font-family', 'Verdana')
            .attr('text-anchor', 'start')
            .attr("dominant-baseline", "middle")
            .attr('x', w_width*(w_rect_size+w_padding*3))
            .attr('y', d => (d[0]+0.5)*(w_rect_size+w_padding))
            .text((d,i) => d[1][i])

        let h_offset = w_height*(w_rect_size+w_padding) + 50;
        svg.selectAll('h_rects')
            .data(h_vals)
            .enter()
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .append("rect")
            .attr('transform', function(d) { return 'translate(' + 
                    (d[0]%h_width)*(h_rect_size + h_padding) + ',' + 
                        (h_offset + Math.floor(d[0]/h_width)*(h_rect_size+h_padding)) + ')';})
            .attr("width", h_rect_size)
            .attr("height", h_rect_size)
            .attr("fill", d => d3.interpolateYlOrRd(d[1]))
            .attr('stroke', 'black')
            .attr('stroke-width', 0.1)
            .on('mouseover', mouseOverHandler)
            .on('mouseleave', mouseLeaveHandler)
            .on('mousemove', mouseMoveHandler)

        let y_loc = ((w_rect_size + w_padding)*w_height + (h_rect_size + h_padding)*h_height + h_offset);
        svg.append('text')
            .attr('x', 0)
            .attr('y', y_loc)
            .attr('id', 'txt_id')
            .attr('fill', 'white')
            .attr('font-size', 18)
            .attr('font-family', 'Verdana')
            .attr('text-anchor', 'start')
            .text('Tag: ')
    }


    useEffect(() => {
        if (collectionIds.length === 0) {
            setIsLoading(false);
            setError("No collections to display");
            return;
        }
        getMaterials(collectionIds, api_url).then((o) => {
            let promises: Promise<void>[] = [];
            let tempCollections: { [id: number]: { materials: number[], tags: {id: number, title: string, type: string}[], title: string } } = {};
            o["materials"].forEach((material: any) => {
                if (material.material_type === "collection") {
                    let promise = getMaterialLeaves(material.id, api_url).then((leaves: number[]) => {
                        tempCollections[material.id]= {
                            materials: leaves,
                            tags: [],
                            title: material.title
                        };
                    }).catch((e) => {
                        console.log(`getMaterialLeaves: ${e}`);
                        setIsLoading(false);
                        setError(`getMaterialLeaves: ${e}`);
                    });
                    promises.push(promise); 
                }
            });
            
            // Wait for all leaves (materials) to be fetched
            Promise.all(promises).then(() => {
                // Fetch tags for each material
                const url = `${api_url}/data/materials/full?ids=${Object.values(tempCollections).flatMap(collection => collection.materials).join(',')}`
                const auth = {
                    Authorization: "bearer " + localStorage.getItem("access_token"),
                };
                getJSONData(url, auth).then((resp: {
                    data: {
                        materials: {
                            created_at: string,
                            description: string,
                            id: number,
                            instance_of: string,
                            material_type: string,
                            owner_id: number,
                            tags: {
                                bloom: string,
                                id: number,
                            }[],
                        }[],
                        tags: {
                            id: number,
                            title: string,
                            type: string,
                        }[],
                        users?: {
                            confirmed: boolean
                            id: number,
                            name: string,
                            registered_on: string,
                        }[],
                    }
                    status?: string,
                }) => {
                    if (resp === undefined) {
                        console.log("API SERVER FAIL");
                        return;
                    }
                    const materials = resp.data.materials;
                    const tags = resp.data.tags;
                    for (const material of materials) {
                        let materialTags = [];
                        if (material.tags !== undefined) {
                            material.tags.forEach((tag) => {
                                const detailedTag = tags.find((t) => t.id === tag.id);
                                if (detailedTag.type !== "author" && detailedTag.type !== "course" && detailedTag.type !== "language") {
                                    materialTags.push(detailedTag);
                                }
                            });
                        }
                        tempCollections[Object.keys(tempCollections).find(c => tempCollections[c].materials.includes(material.id))].tags.push(...materialTags);
                    }
                    // console.log(tempCollections);

                    // Wait for all tags to be fetched
                    //  build collection to acs tag matrix
                    // C1 -> 100, 103, 105
                    // C2 -> 99, 100, 103
                    // build matrix
                    // 100 103 105 99
                    // __  99  100 103 105
                    // C1  1   1   1   0
                    // C2  1   1   0   1

                    // Find all unique tags and sort them
                    const tempAllTags: {id: number, title: string, type: string}[] = [];
                    // Track unique tag IDs to avoid duplicates
                    const uniqueTagIds: Set<number> = new Set();

                    // Iterate over each collection
                    for (const collectionId in tempCollections) {
                        const collection = tempCollections[collectionId];
                        
                        // Iterate over tags in the collection
                        for (const tag of collection.tags) {
                            if (!uniqueTagIds.has(tag.id)) {
                                uniqueTagIds.add(tag.id);
                                tempAllTags.push(tag);
                            }
                        }
                    }

                    tempAllTags.sort((a, b) => a.id - b.id);


                    // Build collection to ACS tag matrix
                    const tempMatrix: { [course: number]: number[] } = {};
                    for (const collectionId in tempCollections) {
                        const tags = tempCollections[collectionId]["tags"].map(tag => tag.id);
                        tempMatrix[collectionId] = tempAllTags.map(tag => tags.includes(tag.id) ? 1 : 0);
                    }
                    setMatrix(tempMatrix);
                    setCollections(tempCollections);
                    setAllTags(tempAllTags);
                    
                    // console.log('  ' + [...allTags].join(' '));
                    // for (const courseName in matrix) {
                    //     const row = matrix[courseName];
                    //     console.log(courseName + ' ' + row.join(' '));
                    // }
                    setIsLoading(false);
                    setError("");
                }).catch((e) => {
                    console.log(`getJSONData: ${e}`);
                    setError(`getJSONData: ${e}`);
                    setIsLoading(false);
                });
            });
        }).catch((e) => {
            console.log(`getMaterials: ${e}`);
            setError(`getMaterials: ${e}`);
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        if (isLoading || error) {
            return;
        }
        createMatrix();
    }, [k, onlyOntology, isLoading]);

    function handleKChange(event) {
        if (event.target.value < 1) {
            return;
        }
        // check if k is a number
        if (isNaN(event.target.value)) {
            setError("K must be a number")
            return;
        }
        setError("");
        setK(parseInt(event.target.value));
        // add k to query param
    }

    function handleOnlyOntologyChange() {
        setOnlyOntology(!onlyOntology);
    }

    return (
        <div>
            {error ? <h1 style={{
                color: "red",
            }}>{error}</h1> : isLoading ? (
                <CircularProgress />
            ) : (
                <div>
                    <div
                        style={{
                            textAlign: "#991b1b",
                        }}
                    >
                        <h1
                            style={{
                                margin: "2rem 0 1rem 0",
                            }}
                        >
                            Collections Matrices:
                        </h1>
                        <svg id="my_heat_maps" width="2500" height="300" />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "flex-start",
                            margin: "0 0 2rem 0",
                        }}
                    >
                        <h2
                            style={{
                                margin: "2rem 0 0 0",
                            }}
                        >
                            Options:
                        </h2>
                        <TextField
                            id="outlined-number"
                            label="K"
                            type="number"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={k}
                            onChange={handleKChange}
                        />
                        <FormGroup
                            style={{
                                display: "block",
                            }}
                        >
                            <FormControlLabel
                                control={<Switch checked={onlyOntology} onChange={handleOnlyOntologyChange} />}
                                label="Only Ontology Tags"
                            />
                        </FormGroup>
                    </div>
                </div>
            )}
        </div>
    );    
};
