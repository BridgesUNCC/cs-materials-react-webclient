import React, {FunctionComponent, ReactNode} from 'react';
import {createStyles, Theme} from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import {OntologyData} from "../MaterialForm";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Checkbox, Divider} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

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
  data: OntologyData;
}

export const  OntologyTree: FunctionComponent<Props> = ({data}) => {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState<string[]>([]);

  const handleChange = (event: React.ChangeEvent<{}>, nodes: string[]) => {
    setExpanded(nodes);
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
            <div>
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

  return (
    <TreeView
      className={classes.root}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      expanded={expanded}
      onNodeToggle={handleChange}
    >
      {createTree(data)}
    </TreeView>
  );
};