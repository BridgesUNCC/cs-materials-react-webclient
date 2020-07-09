import React, {FunctionComponent} from "react";
import {RouteComponentProps} from "react-router";
import {getJSONData} from "../common/util";
import {createStyles, Divider, Theme, List} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import {Link} from "react-router-dom";
import Button from "@material-ui/core/Button";
import {ListItemLink} from "./ListItemLink";
import {DeleteDialog} from "./forms/DeleteDialog";
import {MaterialTypesArray} from "../common/types";


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
    force_fetch_data: boolean;
}


export interface MaterialListData {
    title: string;
    id: number;
}

// @TODO finish the rest of the fields
interface MaterialData {
    id: number;
    title: string;
    material_type: string;
    description: string;
    upstream_url: string;
    tags: TagData[];
    materials: MaterialListData[]
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
    can_delete: boolean;
    not_found: boolean;
}

const createEmptyEntity = (): OverviewEntity => {
    return {
        data: null,
        fetched: false,
        can_edit: false,
        can_delete: false,
        not_found: false,
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

    if (overviewInfo.fetched && overviewInfo.data !== null && Number(match.params.id) !== overviewInfo.data.id) {
        setOverviewInfo({...overviewInfo, data: null, fetched: false})
    }

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
                    let can_edit = resp['access'] === "owner" || resp['access'] === "write";

                    let can_delete = resp['access'] === "owner";

                    const data = resp['data'];
                    console.log(resp);
                    setOverviewInfo({...overviewInfo, fetched: true, data, can_edit, can_delete})
                } else {
                    setOverviewInfo({...overviewInfo, fetched: true, not_found: true})
                }
            }
        })
    }

    let output;
    let count = 0;
    if (overviewInfo.data) {
        output = (
            <div>
                <Divider/>
                <Typography variant={"h5"}>
                    Authors
                </Typography>
                <Typography variant="body1" component="ul" className={classes.content} >
                    {overviewInfo.data.tags.map((value) => {
                        if (value.type !== "author") {
                            return null;
                        }

                        return <li key={value.id}>{value.title}</li>;
                    })}
                </Typography>

                <Divider/>
                <Typography variant={"h5"}>
                    Courses
                </Typography>
                <Typography variant="body1" component="ul" className={classes.content} >
                    {overviewInfo.data.tags.map((value) => {
                        if (value.type !== "course") {
                            return null;
                        }

                        return <li key={value.id}>{value.title}</li>;
                    })}
                </Typography>
                <Divider/>
                 <Typography variant={"h5"}>
                    Topics
                </Typography>
                <Typography variant="body1" component="ul" className={classes.content} >
                    {overviewInfo.data.tags.map((value) => {
                        if (value.type !== "topic") {
                            return null;
                        }

                        return <li key={value.id}>{value.title}</li>;
                    })}
                </Typography>
                <Divider/>
                 <Typography variant={"h5"}>
                    Programming Languages
                </Typography>
                <Typography variant="body1" component="ul" className={classes.content} >
                    {overviewInfo.data.tags.map((value) => {
                        if (value.type !== "language") {
                            return null;
                        }

                        return <li key={value.id}>{value.title}</li>;
                    })}
                </Typography>
                <Divider/>
                 <Typography variant={"h5"}>
                    Datasets
                </Typography>
                <Typography variant="body1" component="ul" className={classes.content} >
                    {overviewInfo.data.tags.map((value) => {
                        if (value.type !== "dataset") {
                            return null;
                        }

                        return <li key={value.id}>{value.title}</li>;
                    })}
                </Typography>
                <Divider/>
                 <Typography variant={"h5"}>
                    Ontologies
                </Typography>
                <Typography variant="body1" component="ul" className={classes.content} >
                    {overviewInfo.data.tags.map((value) => {
                        if (value.type !== "ontology") {
                            return null;
                        }

                        return <li key={value.id}>{value.title}</li>;
                    })}
                </Typography>
                <Divider/>
                <Typography variant={"h5"}>
                    Mapped Materials
                </Typography>
                <List>
                    {
                        overviewInfo.data.materials.map((value, index) => {
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
                        })
                    }
                </List>
            </div>
        )

    }

    return (
        <div>
            <div>
            <Link to={"/materials"}>
                <Button className={classes.margin} variant="contained" color="primary">
                    To Materials List
                </Button>
            </Link>
            {
                typeof localStorage.getItem("access_token") === "string" &&
                    <Link to={"/my_materials"}>
                        <Button className={classes.margin} variant="contained" color="primary">
                            To My Materials
                        </Button>
                    </Link>
            }
            </div>

            {
                typeof localStorage.getItem("access_token") === "string" &&
                <Link to={"/material/create?source=" + overviewInfo.data?.id}>
                    <Button className={classes.margin} variant="contained" color="primary">
                        Duplicate
                    </Button>
                </Link>
            }
            <div className={classes.root}>

                <Paper>
                    {overviewInfo.data === null ?
                        <div>
                            {!overviewInfo.not_found && <CircularProgress/>}
                        </div>
                        :
                        <div>
                            {overviewInfo.can_edit &&
                            <Link to={overviewInfo.data.id + "/edit"}>
                                <Button className={classes.margin} variant="contained" color="primary">
                                    edit
                                </Button>
                            </Link>
                            }
                           <Typography variant={"h5"}>
                                {MaterialTypesArray.find(e => e.value === overviewInfo.data?.material_type)?.label}
                            </Typography>
                            <Typography variant="h4" component="h3" className={classes.root}>
                                {overviewInfo.data.title}
                            </Typography>
                            <Divider/>
                            <Typography variant={"h5"}>
                                Upstream URL
                            </Typography>
                            <Typography variant="body2" component="p" className={classes.content} >
                                {overviewInfo.data.upstream_url}
                            </Typography>
                            <Divider/>
                            <Typography variant={"h5"}>
                                Description
                            </Typography>
                            <Typography variant="body1" component="p" className={classes.content} >
                                {overviewInfo.data.description}
                            </Typography>
                            <Divider/>
                            {output}

                            <Divider/>
                            {overviewInfo.can_delete &&
                            <DeleteDialog id={overviewInfo.data.id} name={overviewInfo.data.title} api_url={api_url}
                                          history={history} location={location} match={match}/>
                            }

                        </div>
                    }
                </Paper>
            </div>
        </div>
    )
};
