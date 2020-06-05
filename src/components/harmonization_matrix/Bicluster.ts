import {AxisData, MappingData, HarmonizationData} from "./HarmonizationView";
import {number} from "prop-types";
import {jsxMemberExpression} from "@babel/types";


export interface BiclusterInfo {
    // seed rows
    i: number;
    j: number;

    p_ij: number[];
    // rows and cols in bicluster
    materials: number[];
    tags: number[];
}


export const Bicluster = (data: HarmonizationData): HarmonizationData => {
    const WORD_SIZE = 8;
    let enc_remainder = data.tag_axis.length % WORD_SIZE;
    let enc_len = data.tag_axis.length / WORD_SIZE;
    let row_len = data.tag_axis.length;
    let col_len = data.material_axis.length;
    let min_mats = 3;
    let min_tags = 3;

    // https://stackoverflow.com/questions/109023/how-to-count-the-number-of-set-bits-in-a-32-bit-integer
    const hamming_weight = (i: number): number => {
        i = (i|0) - ((i >> 1) & 0x55555555);
        i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
        return (((i + (i >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
    };


    /**
       Outputs an integer encoded matrix, with each integer representing WORD_SIZE bits
     */
    const encode_matrix = (data: HarmonizationData): number[][] => {
        let matrix = [];

        for (let row_num = 0; row_num < col_len; ++row_num) {
            let enc_row = [];
            for (let i = 0; i < enc_len - 1; ++i) {
                let val = 0;

                for (let j = 0; j < WORD_SIZE; ++j) {
                    val = val << 1;

                    // weight is either 0 or 0.5 at this point, for UI reasons
                    let index = (row_num * row_len) + (i*WORD_SIZE) + j;
                    val += data.mapping[(row_num * row_len) + (i * WORD_SIZE) + j].weight > 0 ? 1 : 0;
                }
                enc_row.push(val);
            }
            if (enc_remainder) {
                let val = 0;
                for (let i = row_len - enc_remainder; i < row_len; ++i) {
                    val = val << 1;
                    val += data.mapping[(row_num * row_len) + i].weight > 0 ? 1 : 0;
                }
                enc_row.push(val);
            }
            matrix.push(enc_row);
        }

        return matrix;
    };

    // https://academic.oup.com/bioinformatics/article/27/19/2738/231788
    const BiBit_cluster_search = (data: HarmonizationData,
                                  matrix: number[][],
                                  min_tags: number, min_mats: number): BiclusterInfo[] => {
        let out: BiclusterInfo[] = [];

        // get seed rows
        for (let i = 0; i < col_len; ++i) {
            for (let j = i + 1; j < col_len; ++j) {
                let p_ij = matrix[i].map((value, index) => {
                    return value & matrix[j][index];
                });

                let cols = p_ij.reduce((prev, val) => {
                    return prev + hamming_weight(val);
                }, 0);

                // @TODO check if p_ij is not part of another maximal bicluster
                if (cols >= min_tags) {
                    let rows = [i, j];

                    for (let k = 0; k !== i && k !== j && k < col_len; ++k) {
                        let fail = p_ij.find((element, index) => (element & matrix[k][index]) !== element);
                        if (fail === undefined) {
                            rows.push(k);
                        }
                    }

                    // bicluster found
                    // decode bits back into relevant column
                    if (rows.length >= min_mats) {
                        let columns: number[] = [];
                        p_ij.forEach((num, index) => {
                            let remaining = num;
                            for (let pow = WORD_SIZE - 1; pow >= 0; --pow) {
                                if (remaining >= (2 ** pow)) {
                                    remaining -= 2 ** pow;
                                    columns.push(index * WORD_SIZE + (WORD_SIZE - (pow + 1)));
                                }
                            }
                        });

                        out.push({
                                i: i,
                                j: j,
                                p_ij: p_ij,
                                materials: rows,
                                tags: columns,
                            }
                        )
                    }
                }
            }
        }

        return out;
    };

    const detect_max_cluster = (biclusters: BiclusterInfo[]): BiclusterInfo => {
        let max = biclusters[0];

        biclusters.forEach(val => {
           if (val.tags.length * val.materials.length > max.tags.length * max.materials.length)
               max = val;
        });

        return max;
    };

    const filter_remaining_clusters = (biclusters: BiclusterInfo[], max: BiclusterInfo,
                                       min_tags: number, min_mats: number): BiclusterInfo[] => {
        let ret: BiclusterInfo[] = [];

        biclusters.forEach(val => {
            val.materials = val.materials.filter(mat => !max.materials.includes(mat));
            val.tags = val.tags.filter(tag => !max.tags.includes((tag)));

            if (val.materials.length >= min_mats && val.tags.length >= min_tags)
                ret.push(val);
        });

        return ret;
    };

    let matrix = encode_matrix((data));
    console.log(matrix);
    let biclusters = BiBit_cluster_search(data, matrix, min_tags, min_mats);
    console.log(biclusters);

    let max = detect_max_cluster(biclusters);
    let next = max;
    do {
        biclusters = filter_remaining_clusters(biclusters, max, min_tags, min_mats);
        next = detect_max_cluster(biclusters);
        if (next !== undefined) {
            max.materials = max.materials.concat(next.materials);
            max.tags = max.tags.concat(next.tags);
        }
    } while (next !== undefined);

    if (max !== undefined) {
        console.log(max);
        // old_index -> new_index mapping
        let mat_mapping = Array(data.material_axis.length);
        let tag_mapping = Array(data.tag_axis.length);

        max.materials.forEach((value, index) => {
            mat_mapping[value] = index;
        });

        let next_index = max.materials.length;
        data.material_axis.forEach((value, index) => {
            if (mat_mapping[index] === undefined) {
                mat_mapping[index] = next_index++;
            }
        });
        console.log(mat_mapping);

        let new_mat_axis = Array(data.material_axis.length);
        mat_mapping.forEach((val, index) => {
            new_mat_axis[val] = data.material_axis[index];
        });
        data.material_axis = new_mat_axis;

        max.tags.forEach((value, index) => {
            tag_mapping[value] = index;
        });

        next_index = max.tags.length;
        data.tag_axis.forEach((value, index) => {
            if (tag_mapping[index] === undefined) {
                tag_mapping[index] = next_index++;
            }
        });

        let new_tag_axis = Array(data.tag_axis.length);
        tag_mapping.forEach((val, index) => {
            new_tag_axis[val] = data.tag_axis[index];
        });
        console.log(data.tag_axis);
        console.log(new_tag_axis);
        data.tag_axis = new_tag_axis;

        data.mapping.forEach((val, index) => {
            val.mat_index = mat_mapping[val.mat_index];
            val.tag_index = tag_mapping[val.tag_index];
        });
    }
    return data;
};

