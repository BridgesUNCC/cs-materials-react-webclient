import React, {FunctionComponent} from "react";
import {RouteComponentProps} from "react-router";
import {getJSONData} from "../util/util";
import {createStyles, Divider, List, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import {MaterialData} from "./forms/CollectionForm";
import {ListItemLink} from "./ListItemLink";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        margin: {
            margin: theme.spacing(2),
            marginLeft: 'auto',
        },
        root: {
            margin: theme.spacing(3, 2),
            textAlign: 'center',
        },
        content: {
            margin: theme.spacing(2, 1),
            textAlign: 'left',
        }
    }),
);


interface MatchParams {
    id: string;
}

interface Props extends RouteComponentProps<MatchParams> {
    api_url: string;
}

interface CollectionData {
    title: string;
    id: number;
    materials: MaterialData[]
}

interface OverviewEntity {
    data: CollectionData | null;
    fetched: boolean;
    can_edit: boolean;
}

const createEmptyEntity = (): OverviewEntity => {
    return {
        data: null,
        fetched: false,
        can_edit: false,
    };
};

export const CollectionOverview: FunctionComponent<Props> = (
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
        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        getJSONData(url, auth).then(resp => {
            console.log(resp);
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            }
              else {
                if (resp['status'] === "OK") {
                    let can_edit = false;
                    if (resp['access'] === "owner" || resp['access'] === "write") {
                        can_edit = true;
                    }

                    const data = resp['data'];
                    console.log(resp);
                    setOverviewInfo({...overviewInfo, fetched: true, data, can_edit})
                }
            }
        })
    }

    let output = null;
    let count = 0;
    if (overviewInfo.data !== null) {
        output = overviewInfo.data.materials.map((value, index) => {
            // @Hack @FIXME cull entries for speed
            if (count++ > 250)
                return null;
            return (
                <div key={`${value.id}`}>

                    <Divider/>
                    <ListItemLink
                        history={history}
                        location={location}
                        match={match}
                        primary={value.title} to={"/material/" + value.id} key={value.id}
                    />
                </div>
            )
        });
    }

    return (
        <div>
            <Paper>
                {overviewInfo.data === null ?
                    <CircularProgress/>
                    :
                    <div>
                        <Typography variant="h4" component="h3" className={classes.root}>
                            {overviewInfo.data.title}
                        </Typography>
                        <List>
                            {output}
                        </List>
                    </div>
                }
            </Paper>
        </div>
    )
};