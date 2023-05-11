import React, {FunctionComponent, ReactNode} from 'react';
import {createStyles, Theme} from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import {OntologyData, TagData} from "../../common/types";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Box, Checkbox, CircularProgress, Divider} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import {getJSONData} from "../../common/util";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';

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
        },
        tags: {
          position: 'fixed',
          float: 'right',
          right: '100px'
          // marginLeft: 1500,
        }
    }),
);

// @TODO data shouldnt be a prop i think.

interface Props {
    api_url: string;
    tree_name: string;
    selected_tags: TagData[];
    onCheck: (event: React.ChangeEvent<HTMLInputElement>, id: OntologyData) => void;
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

    let [tag, settag] = React.useState([] as string[])

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event: any) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    // for(let i = 0; i < selected_tags.length; i++){
    //   settag(tag.push(selected_tags[i].title))
    // }



    const handleChange = (event: React.ChangeEvent<{}>, expanded: string[]) => {
        setTreeInfo({...treeInfo, expanded, propagate_expand: false});
    };

    console.log(treeInfo.checked)

    const createTree = (node: OntologyData, parent_id: number, expanded: string[], propagate_expand: boolean):
        ReactNode => {

        const is_match = search_term.length > 2 && kmpSearch(search_term.toLowerCase(), node.title.toLowerCase()) !== -1;
        // @ts-ignore
        const font_weight = is_match ? "fontWeightBold" : "inherit";
        const font_style = is_match ? "italic" : "normal";
        let color = is_match ? "secondary.main" : "text.primary";

        //change the color based on if it is saved or a new entry
        if(is_match){
          color = "secondary.main"
        }else if(treeInfo.checked.find(e => Number(e) === node.id) !== undefined){
          color = "green"
        }else if(selected_tags.find(e => Number(e.id) === node.id) !== undefined){
          color = "orange"
        }else{
          color = "text.primary"
        }

        //determine the checkbox state and the label for a tag within the tree
        const label = (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                    id={`checkbox-${node.id}`}
                    color="default"
                    //checks if the treeInfo contains newly selected tag to make sure
                    //the checkbox doesn't get reversed when colapsing the tree to avoid
                    //duplication of tags. may be easier to update treeinfo interface rather than this
                    defaultChecked={treeInfo.checked.find(e => Number(e) === node.id) !== undefined || selected_tags.find(e => Number(e.id) === node.id) !== undefined}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        settag(tag.concat(node.title))
                        onCheck(event, node);
                        // if(treeInfo.checked.includes(node.id.toString())){
                        //   let index = treeInfo.checked.indexOf(node.id.toString())
                        //   treeInfo.checked.splice(index,1)
                        // }else{
                        //   treeInfo.checked.push(node.id.toString());
                        // }
                    }}
                    onClick={e => (e.stopPropagation())}
                />
                <div>
                    <Typography variant={"body1"} className={classes.inheritTypography}>{node.title}</Typography>

                </div>
            </div>
        );

        // expand if matching term, or is parent of matching term
        const should_expand = is_match
            || (propagate_expand && expanded.find(e => Number(e) === node.id) !== undefined)
        if (should_expand) {
            expanded.push(String(parent_id));
        }

        if (node.children.length > 0) {
            let ele = (
                <div key={node.id}>
                    <TreeItem nodeId={String(node.id)} key={String(node.id)} label={label}>
                        { node.children.map(e => createTree(e, node.id, expanded, propagate_expand)) }
                    </TreeItem>
                    <Divider/>
                </div>
            );

            // expand parent nodes of selected nodes
            if (
                propagate_expand &&
                expanded.find(e => Number(e) === node.id) !== undefined
            )
                expanded.push(String(parent_id));

            // expand root node, even if nothing is selected/matched
            if (parent_id === -1 && expanded.find(e => Number(e) === node.id) === undefined) {
                expanded.push(String(node.id));
            }

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
      <div>
      <div>
      <Button variant="contained" color="secondary" aria-haspopup="true" onClick={handleClick} className={classes.tags} style={{zIndex:1}}>
        View Selected Tags
      </Button>
      </div>
      <div>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
        {selected_tags.map((tag) => (
          <MenuItem onClick={handleClose}>{tag.title}</MenuItem>
        ))}

        </Menu>
        <TreeView
            className={classes.root}
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            expanded={expanded}
            onNodeToggle={handleChange}
        >
            {tree}
        </TreeView>
      </div>
      </div>
    );
};
