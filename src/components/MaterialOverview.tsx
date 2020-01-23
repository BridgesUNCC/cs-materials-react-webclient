import React, {FunctionComponent} from "react";
import {RouteComponentProps} from "react-router";
import {getJSONData} from "../util/util";
import {createStyles, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import {Link} from "react-router-dom";
import Button from "@material-ui/core/Button";



const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        margin: {
            margin: theme.spacing(1),
            marginLeft: 'auto',
        },
        root: {
            margin: theme.spacing(3, 2),
        },
        content: {
            margin: theme.spacing(0),
        }
    }),
);


interface MatchParams {
    id: string;
}

interface Props extends RouteComponentProps<MatchParams> {
    api_url: string;
    force_fetch_data: boolean;
}

// @TODO finish the rest of the fields
interface MaterialData {
    id: number;
    title: string;
    description: string;
    upstream_url: string;
    tags: TagData[];
}

interface TagData {
    id: number;
    title: string;
    bloom: string;
    type: string;
}

interface OverviewEntity {
    data:  MaterialData | null;
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

export const MaterialOverview: FunctionComponent<Props> = (
    {
        history,
        location,
        match,
        api_url,
        force_fetch_data,
    }
) => {

    const classes = useStyles();

    const [overviewInfo, setOverviewInfo] = React.useState(
        createEmptyEntity()
    );

    console.log("mat overview");
    if (!overviewInfo.fetched || force_fetch_data) {
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

    let output;
    if (overviewInfo.data) {
        output = (
            <div>
                <Typography variant={"h5"}>
                    Author(s)
                </Typography>
                <Typography variant="body1" component="p" className={classes.content} >
                    {overviewInfo.data.tags.map((value) => {
                        if (value.type !== "author") {
                            return null;
                        }

                        return <li key={value.id}>{value.title}</li>;
                    })}
                </Typography>

                <Typography variant={"h5"}>
                    Course(s)
                </Typography>
                <Typography variant="body1" component="p" className={classes.content} >
                    {overviewInfo.data.tags.map((value) => {
                        if (value.type !== "course") {
                            return null;
                        }

                        return <li key={value.id}>{value.title}</li>;
                    })}
                </Typography>
                 <Typography variant={"h5"}>
                    topic(s)
                </Typography>
                <Typography variant="body1" component="p" className={classes.content} >
                    {overviewInfo.data.tags.map((value) => {
                        if (value.type !== "topic") {
                            return null;
                        }

                        return <li key={value.id}>{value.title}</li>;
                    })}
                </Typography>
                 <Typography variant={"h5"}>
                    programming language(s)
                </Typography>
                <Typography variant="body1" component="p" className={classes.content} >
                    {overviewInfo.data.tags.map((value) => {
                        if (value.type !== "language") {
                            return null;
                        }

                        return <li key={value.id}>{value.title}</li>;
                    })}
                </Typography>
                 <Typography variant={"h5"}>
                    dataset(s)
                </Typography>
                <Typography variant="body1" component="p" className={classes.content} >
                    {overviewInfo.data.tags.map((value) => {
                        if (value.type !== "dataset") {
                            return null;
                        }

                        return <li key={value.id}>{value.title}</li>;
                    })}
                </Typography>
                 <Typography variant={"h5"}>
                    ontologies(s)
                </Typography>
                <Typography variant="body1" component="ul" className={classes.content} >
                    {overviewInfo.data.tags.map((value) => {
                        if (value.type !== "ontology") {
                            return null;
                        }

                        return <li key={value.id}>{value.title}</li>;
                    })}
                </Typography>
            </div>
        )

    }

    return (
        <div>
            <Link to={"/materials"}>
                <Button className={classes.margin} variant="contained" color="primary">
                    back to list
                </Button>
            </Link>
            <div className={classes.root}>

                <Paper>
                    {overviewInfo.data === null ?
                        <CircularProgress/>
                        :
                        <div>
                            {overviewInfo.can_edit &&
                                <Link to={overviewInfo.data.id + "/edit"}>
                                    <Button className={classes.margin} variant="contained" color="primary">
                                        edit
                                    </Button>
                                </Link>
                            }
                            <Typography variant="h5" component="h3" className={classes.content}>
                                {overviewInfo.data.title}
                            </Typography>
                            <Typography variant="body2" component="p" className={classes.content} >
                                {overviewInfo.data.upstream_url}
                            </Typography>
                            <Typography variant="body1" component="p" className={classes.content} >
                                {overviewInfo.data.description}
                            </Typography>
                            {output}
                        </div>
                    }
                </Paper>
            </div>
        </div>
    )
};
