import {AxisData, MappingData, HarmonizationData} from "./HarmonizationView";
import {number} from "prop-types";
import {jsxMemberExpression} from "@babel/types";


export interface BiclusterInfo {
    // seed rows
    i: number;
    j: number;

    // rows and cols in bicluster
    rows: number[];
    columns: number[];
}


export const Bicluster = (data: HarmonizationData): void => {
    const WORD_SIZE = 8;
    let enc_remainder = data.tag_axis.length % WORD_SIZE;
    let enc_len = data.tag_axis.length / WORD_SIZE;
    let row_len = data.tag_axis.length;
    let col_len = data.material_axis.length;

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
                                  min_cols: number, min_rows: number): BiclusterInfo[] => {
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
                if (cols >= min_cols) {
                    let rows = [i, j];

                    for (let k = 0; k !== i && k !== j && k < col_len; ++k) {
                        let fail = p_ij.find((element, index) => (element & matrix[k][index]) !== element);
                        if (fail === undefined) {
                            rows.push(k);
                        }
                    }

                    // bicluster found
                    if (rows.length >= min_rows) {
                        // @TODO decode p_ij

                        out.push({
                                i: i,
                                j: j,
                                rows: rows,
                                columns: p_ij,
                            }
                        )
                    }
                }
            }
        }

        return out;
    };

    let matrix = encode_matrix((data));
    console.log(matrix);
    let biclusters = BiBit_cluster_search(data, matrix, 3, 3);
    console.log(biclusters);

};

