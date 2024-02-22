import React, { FunctionComponent, useEffect, useState } from "react";
import { CircularProgress, Paper, TextField, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { getMaterials, getMaterialLeaves, getMaterialsTags } from "../../common/csmaterialsapiinterface";
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
    mapping: MappingData[],
    material_axis: AxisData[],
    tag_axis: AxisData[],
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

export interface TagData {
    id: number;
    title?: string;
    bloom?: string;
    type?: string;
}

export const NMFView: FunctionComponent<Props> = ({ api_url, location }) => {
  const classes = useStyles();

  useEffect(() => {
    // let DSs = [178, 1210, 703, 177, 805];
    // let collectionIds = [...DSs];
    // let collectionIds = [177, 703];
    // grab query parameters id
    const collectionIds = location.search.split("ids=")[1].split(",").map(Number);
    console.log(collectionIds);
    getMaterials(collectionIds, api_url).then((o) => {
        let promises: Promise<void>[] = [];
        let collections: { [id: number]: { materials: number[], tags: Set<number> } } = {};
        o["materials"].forEach((material: any) => {
            if (material.material_type === "collection") {
                let promise = getMaterialLeaves(material.id, api_url).then((leaves: number[]) => {
                    collections[material.id]= {
                        materials: leaves,
                        tags: new Set(material.tags.map((tag: { bloom: string, id: number }) => tag.id))
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
            let tagPromises: Promise<void>[] = [];
            for (let collectionId in collections) {
                    let promise = getMaterialsTags(collections[collectionId].materials, api_url).then((material: Record<number, number[]>) => {
                        for (let materialId in material) {
                            material[materialId].forEach(tag => collections[collectionId].tags.add(tag));
                        }
                    }).catch((e) => {
                        console.log(`getMaterialTags: ${e}`);
                    });
                    tagPromises.push(promise);
            }
            // Wait for all tags to be fetched
            Promise.all(tagPromises).then(() => {
                //  build collection to acs tag matrix
                // C1 -> 100, 103, 105
                // C2 -> 99, 100, 103
                // build matrix
                // 100 103 105 99
                // __  99  100 103 105
                // C1  1   1   1   0
                // C2  1   1   0   1

                // Find all unique tags and sort them
                const tempAllUniqueTags = new Set<number>();
                for (const collectionId in collections) {
                    collections[collectionId]["tags"].forEach(tag => tempAllUniqueTags.add(tag));
                }
                const allTags: number[] = Array.from(tempAllUniqueTags).sort((a, b) => a - b);

                // Build collection to ACS tag matrix
                const matrix: { [course: number]: number[] } = {};
                for (const collectionId in collections) {
                    const tags = collections[collectionId]["tags"];
                    matrix[collectionId] = allTags.map(tag => tags.has(tag) ? 1 : 0);
                }

                console.log('  ' + [...allTags].join(' '));
                for (const courseName in matrix) {
                    const row = matrix[courseName];
                    console.log(courseName + ' ' + row.join(' '));
                }

                // V (m=4 x n=377)
                const realMatrix = Object.values(matrix)
                const k = 3;
                const maxIterations = 10;
                const tolerance = .0001;
                
                const nmfMatrix = nmf.mu(realMatrix, k, maxIterations, tolerance);
                let W = nmfMatrix.W;
                let NMFDataW: NMFData = {
                    mapping: [],
                    material_axis: [],
                    tag_axis: []
                };
                
                // make w in the NMFData format
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
                
            });
        }).catch((e) => {
            console.log(`Error in Promise.all(): ${e}`);
        });
    }).catch((e) => {
        console.log(`getMaterials: ${e}`);
    });
  }, []);

  return (
    <h1>NMF Matrix</h1>
  );
};
