import React, {FunctionComponent, ReactNode} from 'react';
import {createStyles, Theme} from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import {OntologyData} from "../MaterialForm";
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
}

interface TreeInfo {
    expanded: string[];
    fetched: boolean;
    tree: ReactNode;
}

const createEmptyInfo = (): TreeInfo => {
    return {
        expanded: [],
        fetched: false,
        tree: (<CircularProgress/>),
    }
};

export const  OntologyTree: FunctionComponent<Props> = ({api_url, tree_name}) => {
  const classes = useStyles();

  const [treeInfo, setTreeInfo] = React.useState<TreeInfo>(
      createEmptyInfo()
  );




  const handleChange = (event: React.ChangeEvent<{}>, expanded: string[]) => {
    setTreeInfo({...treeInfo, expanded});
  };

  const createTree = (node: OntologyData): ReactNode => {
      const label = (
          <div style={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                  id={`checkbox-${node.id}`}
                  color="default"
                  onClick={e => (e.stopPropagation())}
              />
              <Typography variant="body1">{node.title}</Typography>
          </div>
      );

    if (node.children.length > 0) {
        return (
            <div key={node.id}>
            <TreeItem nodeId={String(node.id)} key={String(node.id)} label={label}>
              { node.children.map(e => createTree(e)) }
            </TreeItem>
                <Divider/>
            </div>
        )
    }
    else {
      return (<TreeItem nodeId={String(node.id)} key={String(node.id)} label={label} />)
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

                    setTreeInfo({...treeInfo, fetched: true, tree: createTree(ontology)});
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