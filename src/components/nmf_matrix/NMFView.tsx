// @ts-nocheck
import React, { FunctionComponent, useEffect, useState } from "react";
import * as d3 from 'd3';
import { CircularProgress, Paper, TextField, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { getMaterials, getMaterialLeaves, getMaterialsTags } from "../../common/csmaterialsapiinterface";
import { getJSONData } from "../../common/util";
import {RouteComponentProps} from "react-router";
import {nmf} from "../../common/nmf";

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

export const NMFView: FunctionComponent<Props> = ({ api_url, location }) => {
    const classes = useStyles();
    useEffect(() => {
        // localhost:3000/testing_matrix?ids=177,703
        // localhost:3000/testing_matrix?ids=177,703,177,1210,805
        // let DSs = [178, 1210, 703, 177, 805];
        const collectionIds = location.search.split("ids=")[1].split(",").map(Number);
        // console.log(collectionIds);
        getMaterials(collectionIds, api_url).then((o) => {
            let promises: Promise<void>[] = [];
            let collections: { [id: number]: { materials: number[], tags: {id: number, title: string, type: string}[], title: string } } = {};
            o["materials"].forEach((material: any) => {
                if (material.material_type === "collection") {
                    let promise = getMaterialLeaves(material.id, api_url).then((leaves: number[]) => {
                        collections[material.id]= {
                            materials: leaves,
                            tags: [],
                            title: material.title
                        };
                    }).catch((e) => {
                        console.log(`getMaterialLeaves: ${e}`);
                    });
                    promises.push(promise); 
                }
            });
            
            // Wait for all leaves (materials) to be fetched
            Promise.all(promises).then(() => {
                // Fetch tags for each material
                const url = `${api_url}/data/materials/full?ids=${Object.values(collections).flatMap(collection => collection.materials).join(',')}`
                const auth = {
                    Authorization: "bearer " + localStorage.getItem("access_token"),
                };
                console.log(url);
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
                    console.log(materials.length);
                    console.log(tags.length);
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
                        collections[Object.keys(collections).find(c => collections[c].materials.includes(material.id))].tags.push(...materialTags);
                    }
                    console.log(collections);

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
                    const allTags: {id: number, title: string, type: string}[] = [];
                    // Track unique tag IDs to avoid duplicates
                    const uniqueTagIds: Set<number> = new Set();

                    // Iterate over each collection
                    for (const collectionId in collections) {
                        const collection = collections[collectionId];
                        
                        // Iterate over tags in the collection
                        for (const tag of collection.tags) {
                            if (!uniqueTagIds.has(tag.id)) {
                                uniqueTagIds.add(tag.id);
                                allTags.push(tag);
                            }
                        }
                    }

                    allTags.sort((a, b) => a.id - b.id);


                    // Build collection to ACS tag matrix
                    const matrix: { [course: number]: number[] } = {};
                    for (const collectionId in collections) {
                        const tags = collections[collectionId]["tags"].map(tag => tag.id);
                        matrix[collectionId] = allTags.map(tag => tags.includes(tag.id) ? 1 : 0);
                    }
                    
                    // console.log('  ' + [...allTags].join(' '));
                    // for (const courseName in matrix) {
                    //     const row = matrix[courseName];
                    //     console.log(courseName + ' ' + row.join(' '));
                    // }

                    // V (m=4 x n=377)
                    const realMatrix = Object.values(matrix)
                    const k = 3;
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
                    
                    // W represents the basis vectors or latent features (m=4 x r=3)
                    // console.log(nmfMatrix.W);
                    // H represents the coefficients for each data point (r=3 x n=377)
                    // console.log(nmfMatrix.H);
                    // course is a linear combination of these latent probabilities 
                    // each latenent feature is a "type" of course
                    // c = w1*l1 + w2*l2 + w3*l3
                    // l1= h1* T1 + h2*T2 + h3*T3
                    // r is the latent features
                    // k are how many latent features theyre are
                    // there is aprobability mapping of these features
                    // H gives mapping of feature to tags
                    // W gives mapping of courses to features
                    // Check paper it has examples of heatmap with these matricies
                    // When loading in d3, there may be issues with event listeners working on multiple d3 objects. Look at previous d3 options
                    // Should be similarity graph
                    // Find multiple factorizaitons that are "good"
                    // Do research to see if anyone has done this before
                    // Talk to Christian Kuemmerle about this
                    
                    // D3 Code
                    let tooltip;
                    //  mouse handlers
                    function mouseOverHandler(evt, d) {
                        tooltip.style("opacity", 1)
                        d3.select(this)
                            .style('opacity', 1)
                        // get tag data
                        document.getElementById('txt_id').innerHTML = `Course Tag ${allTags[d%h_width].id}: (${allTags[d%h_width].type}) ${allTags[d%h_width].title}`;
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
                    var margin = {top: 80, right: 25, bottom: 30, left: 100};

                    // fix rect sizes  and padding for the W and H matrices
                    // rects are square and padding is space between two rectangles
                    const w_rect_size = 15, w_padding = 3;
                    const h_rect_size = 5, h_padding = 1;
                    var svg = d3.select('#my_heat_maps');
                    let w = svg.attr('width');
                    let h = svg.attr('height');
                    let width = w - margin.left - margin.right,
                        height = h - margin.top - margin.bottom;

                    svg.append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                        .append('rect')
                        .attr("width", width)
                        .attr("height", height)
                        .attr("fill", 'none')
                        .attr('stroke', 'green')
                        .attr('stroke-width', 1)
                        .attr('stroke-opacity', 0.1)

                
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

                    let y_loc = ((w_rect_size + w_padding)*w_height + (h_rect_size + h_padding)*h_height + h_offset) + 50;
                    svg.append('text')
                        .attr('x', 100)
                        .attr('y', y_loc)
                        .attr('id', 'txt_id')
                        .attr('font-size', 18)
                        .attr('font-family', 'Verdana')
                        .attr('text-anchor', 'start')
                        .text('Course Tag: ')
                }).catch((e) => {
                    console.log(`getJSONData: ${e}`);
                });
            });
    }).catch((e) => {
        console.log(`getMaterials: ${e}`);
    });
  }, []);

  return (
    <svg id="my_heat_maps" width = "2500" height = "500"/>
  );
};
