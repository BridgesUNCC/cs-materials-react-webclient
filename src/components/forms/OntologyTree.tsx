import React, {FunctionComponent, ReactNode} from 'react';
import {createStyles, Theme} from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import {OntologyData, TagData} from "../MaterialForm";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Box, Checkbox, CircularProgress, Divider} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import {getJSONData} from "../../util/util";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        margin: {
            margin: theme.spacing(1),
        },
        extendedIcon: {
            marginRight: theme.spacing(1),
        },
        root: {
            flexGrow: 1,
        },
        appBar: {
            position: 'relative',
        },
        title: {
            marginLeft: theme.spacing(2),
            flex: 1,
        },
        inheritTypography: {
            fontWeight: "inherit",
        }
    }),
);

// @TODO data shouldnt be a prop i think.

interface Props {
    api_url: string;
    tree_name: string;
    selected_tags: TagData[];
    onCheck: (event: React.ChangeEvent<HTMLInputElement>, id: number) => void;
    search_term: string;
}

interface TreeInfo {
    expanded: string[];
    checked: string[];
    fetched: boolean;
    propagate_expand: boolean;
    ontology: OntologyData | null;
    search_term: string;
}

const createTreeInfo = (selected: TagData[], search_term: string,): TreeInfo => {
    return {
        expanded: selected.map(e => String(e.id)),
        checked: selected.map(e => String(e.id)),
        fetched: false,
        propagate_expand: true,
        ontology: null,
        search_term: search_term
    }
};


// Searches for the given pattern string in the given text string using the Knuth-Morris-Pratt string matching algorithm.
// If the pattern is found, this returns the index of the start of the earliest match
// https://www.nayuki.io/res/knuth-morris-pratt-string-matching/kmp-string-matcher.js
function kmpSearch(pattern: string, text: string): number {
    if (pattern.length === 0)
        return 0; // Immediate match

    // Compute longest suffix-prefix table
    const lsp = [0]; // Base case
    for (let i = 1; i < pattern.length; i++) {
        let j = lsp[i - 1]; // Start by assuming we're extending the previous LSP
        while (j > 0 && pattern.charAt(i) !== pattern.charAt(j))
            j = lsp[j - 1];
        if (pattern.charAt(i) === pattern.charAt(j))
            j++;
        lsp.push(j);
    }

    // Walk through text string
    let j = 0; // Number of chars matched in pattern
    for (let i = 0; i < text.length; i++) {
        while (j > 0 && text.charAt(i) !== pattern.charAt(j))
            j = lsp[j - 1]; // Fall back in the pattern
        if (text.charAt(i) === pattern.charAt(j)) {
            j++; // Next char matched, increment position
            if (j === pattern.length)
                return i - (j - 1);
        }
    }
    return -1; // Not found
}


export const  OntologyTree: FunctionComponent<Props> = ({api_url, tree_name, selected_tags, onCheck, search_term}) => {
    const classes = useStyles();

    console.log(selected_tags);
    console.log(search_term);
    let [treeInfo, setTreeInfo] = React.useState<TreeInfo>(
        createTreeInfo(selected_tags, search_term,)
    );


    const handleChange = (event: React.ChangeEvent<{}>, expanded: string[]) => {
        console.log(expanded);
        setTreeInfo({...treeInfo, expanded, propagate_expand: false});
    };

    const createTree = (node: OntologyData, parent_id: number, expanded: string[], propagate_expand: boolean):
        ReactNode => {

        const is_match = search_term.length !== 0 && kmpSearch(search_term, node.title) !== -1;
        // @ts-ignore
        const font_weight = is_match ? "fontWeightBold" : "inherit";
        const font_style = is_match ? "italic" : "normal";
        const color = is_match ? "secondary.main" : "text.primary";

        const label = (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                    id={`checkbox-${node.id}`}
                    color="default"
                    defaultChecked={treeInfo.checked.find(e => Number(e) === node.id) !== undefined}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        console.log(event);
                        onCheck(event, node.id);
                    }}
                    onClick={e => (e.stopPropagation())}
                />
                <Box fontWeight={font_weight} fontStyle={font_style} color={color}>
                    <Typography variant={"body1"} className={classes.inheritTypography}>{node.title}</Typography>
                </Box>
            </div>
        );

        if (
            is_match ||
            (
                propagate_expand &&
                expanded.find(e => Number(e) === node.id) !== undefined
            )
        )
            expanded.push(String(parent_id));

        if (node.children.length > 0) {
            let ele = (
                <div key={node.id}>
                    <TreeItem nodeId={String(node.id)} key={String(node.id)} label={label}>
                        { node.children.map(e => createTree(e, node.id, expanded, propagate_expand)) }
                    </TreeItem>
                    <Divider/>
                </div>
            );

            if (
                propagate_expand &&
                expanded.find(e => Number(e) === node.id) !== undefined
            )
                expanded.push(String(parent_id));

            return ele;
        }
        else {
            let ele = (<TreeItem nodeId={String(node.id)} key={String(node.id)} label={label} />);
            if (
                propagate_expand &&
                expanded.find(e => Number(e) === node.id) !== undefined
            )
                expanded.push(String(parent_id));

            return  ele;
        }

    };

    if (!treeInfo.fetched) {
        const url = api_url + "/data/ontology_trees";

        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};
        getJSONData(url, auth).then(resp => {
            console.log(resp);
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            } else {
                if (resp['status'] === "OK") {
                    const ontology = resp["data"][tree_name];
                    console.log(treeInfo.checked);

                    let expanded = treeInfo.expanded;
                    setTreeInfo({...treeInfo, ontology, fetched: true, expanded});
                }
            }
        });
    }

    let expanded = treeInfo.expanded.map(e => e);

    let propagate_expand = treeInfo.search_term !== search_term || treeInfo.propagate_expand;
    console.log("tree redraw");
    const tree = treeInfo.fetched && treeInfo.ontology !== null ?
        createTree(treeInfo.ontology, -1, expanded, propagate_expand) : <CircularProgress/>;

    return (
        <TreeView
            className={classes.root}
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            expanded={expanded}
            onNodeToggle={handleChange}
        >
            {tree}
        </TreeView>
    );
};