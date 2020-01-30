import React, {FunctionComponent, ReactNode} from 'react';
import {createStyles, Theme} from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import {OntologyData, TagData} from "../MaterialForm";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Checkbox, CircularProgress, Divider} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import {getJSONData} from "../../util/util";
import {on} from "cluster";

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
    }),
);

// @TODO data shouldnt be a prop i think.

interface Props {
    api_url: string;
    tree_name: string;
    selected_tags: TagData[];
    onCheck: (event: React.ChangeEvent<HTMLInputElement>, id: number) => void;
}

interface TreeInfo {
    expanded: string[];
    checked: string[];
    fetched: boolean;
    tree: ReactNode;
}

const createTreeInfo = (selected: TagData[], tree?: ReactNode): TreeInfo => {
    console.log("new tree");
    return {
        expanded: selected.map(e => String(e.id)),
        checked: selected.map(e => String(e.id)),
        fetched: false,
        tree: tree,
    }
};

export const  OntologyTree: FunctionComponent<Props> = ({api_url, tree_name, selected_tags, onCheck}) => {
    const classes = useStyles();

    console.log(selected_tags);
    let [treeInfo, setTreeInfo] = React.useState<TreeInfo>(
        createTreeInfo(selected_tags, (<CircularProgress/>))
    );


    const handleChange = (event: React.ChangeEvent<{}>, expanded: string[]) => {
        console.log(expanded);
        setTreeInfo({...treeInfo, expanded});
    };

    const onCheckLocal = (event: React.ChangeEvent<HTMLInputElement>, id: number ) => {
        let selected = treeInfo.checked;
        if (event.target.checked)
            selected.push(String(id));
        else {
            selected = selected.filter(e => e !== String(id));
        }

        console.log(treeInfo.expanded);
        setTreeInfo({...treeInfo, checked: selected});
    };

    const createTree = (node: OntologyData, parent_id: number, expanded: string[]): ReactNode => {
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
                <Typography variant="body1">{node.title}</Typography>
            </div>
        );

        if (expanded.find(e => Number(e) === node.id) !== undefined &&
            expanded.find(e => Number(e) === parent_id) === undefined )
            expanded.push(String(parent_id));

        if (node.children.length > 0) {
            let ele = (
                <div key={node.id}>
                    <TreeItem nodeId={String(node.id)} key={String(node.id)} label={label}>
                        { node.children.map(e => createTree(e, node.id, expanded)) }
                    </TreeItem>
                    <Divider/>
                </div>
            )

            if (expanded.find(e => Number(e) === node.id) !== undefined &&
                expanded.find(e => Number(e) === parent_id) === undefined )
                expanded.push(String(parent_id));

            return ele;
        }
        else {
            let ele = (<TreeItem nodeId={String(node.id)} key={String(node.id)} label={label} />)
            if (expanded.find(e => Number(e) === node.id) !== undefined &&
                expanded.find(e => Number(e) === parent_id) === undefined )
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
                    let tree = createTree(ontology, -1, expanded);
                    setTreeInfo({...treeInfo, fetched: true, tree, expanded});
                }
            }
        });
    }

    return (
        <TreeView
            className={classes.root}
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            expanded={treeInfo.expanded}
            onNodeToggle={handleChange}
        >
            {treeInfo.tree}
        </TreeView>
    );
};