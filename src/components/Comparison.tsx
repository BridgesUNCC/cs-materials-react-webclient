import React, {FunctionComponent} from "react";
import {MaterialListOne} from "./comparison/MaterialListOne";
import {MaterialListTwo} from "./comparison/MaterialListTwo";
import {createStyles,  Grid,  Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {RouteComponentProps} from "react-router";


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
