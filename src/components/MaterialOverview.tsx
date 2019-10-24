import React, {FunctionComponent} from "react";
import {RouteComponentProps} from "react-router";
import {getJSONData} from "../util/util";
import {createStyles, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";



const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(3, 2),
            margin: theme.spacing(3, 2),
        },
    }),
);


interface MatchParams {
    id: string;
}

interface Props extends RouteComponentProps<MatchParams> {
    api_url: string;
}

// @TODO finish the rest of the fields
interface MaterialData {
    id: number;
    title: string;
    description: string
}
interface OverviewEntity {
    data:  MaterialData | null;
    fetched: boolean;
}

const createEmptyEntity = (): OverviewEntity => {
    return {
        data: null,
        fetched: false,
    };
};

export const MaterialOverview: FunctionComponent<Props> = (
    {
        history,
        location,
        match,
        api_url,
    }
) => {

    const classes = useStyles();

    const [overviewInfo, setOverviewInfo] = React.useState(
        createEmptyEntity()
    );

    if (!overviewInfo.fetched) {
        setOverviewInfo({...overviewInfo, fetched: true});

        const url = api_url + "/data/material/meta?id=" + match.params.id;

        // @TODO pass in auth token
        getJSONData(url).then(resp => {
            console.log(resp);
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            }
              else {
                if (resp['status'] === "OK") {
                    const data = resp['data'];
                    setOverviewInfo({...overviewInfo, fetched: true, data})
                }
            }
        })
    }

    return (
        <div className={classes.root}>
            <Paper>
                {overviewInfo.data === null ?
                    <CircularProgress/>
                    :
                    <div>
                        <Typography variant="h5" component="h3">
                            {overviewInfo.data.title}
                        </Typography>
                        <Typography component="p">
                            {overviewInfo.data.description}
                        </Typography>
                    </div>
                    }
            </Paper>
        </div>
    )
};
