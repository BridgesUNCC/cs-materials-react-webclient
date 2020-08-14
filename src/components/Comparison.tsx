import React, {FunctionComponent} from "react";
import {getJSONData, parse_query_variable} from "../common/util";
import CircularProgress from "@material-ui/core/CircularProgress";
import {Link} from "react-router-dom";
import {MaterialListOne} from "./comparison/MaterialListOne";
import {MaterialListTwo} from "./comparison/MaterialListTwo";
import List from "@material-ui/core/List";
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import {ListItemLink} from "./ListItemLink";
import {Checkbox, createStyles, Divider, Grid, Paper, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import {RouteComponentProps} from "react-router";
import Button from "@material-ui/core/Button";
import {MaterialListEntry} from "../common/types";
import {Analyze} from "./analyze/Analyze";
import FolderIcon from '@material-ui/icons/Folder';
import DeleteIcon from '@material-ui/icons/Delete';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';



const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        flexGrow: 1,
        maxWidth: 752,
      },
      demo: {
        backgroundColor: theme.palette.background.paper,
      },
      title: {
        margin: theme.spacing(4, 0, 2),
      },
    }),
);

interface ListEntity {
    materials: MaterialListEntry[] | null;
    selected_materials: number[]
    fetched: boolean;
    search: string;
    path: string
}

const createEmptyEntity = (path: string): ListEntity => {
    return {
        materials: null,
        selected_materials: [],
        fetched: false,
        search: "N/A",
        path
    }
};

interface MatchParams {
    id: string;
}

interface ListProps extends RouteComponentProps<MatchParams> {
    api_url: string;
    user_materials?: number[];
    user_id: any;
    user_data: any;
}


export const Comparison: FunctionComponent<ListProps> = ({   history,
                                                               location,
                                                               match,
                                                               api_url,
                                                               user_materials,
                                                               user_id,
                                                               user_data,
                                                           }) => {
    const classes = useStyles();


    return (
      <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <MaterialListOne history={history} location={location} match={match} api_url={api_url} user_id={user_id} user_data={user_data} from={"listOne"}/>
      </Grid>
      <Grid item xs={12} md={6}>
        <MaterialListTwo history={history} location={location} match={match} api_url={api_url} user_id={user_id} user_data={user_data} from={"listTwo"}/>
      </Grid>
    </Grid>
    )
};
