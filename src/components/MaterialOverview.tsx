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
import {MaterialListData, MaterialTypesArray} from "../common/types";
import {Author} from "./author/Author";
import EditIcon from '@material-ui/icons/Edit';
import GetAppIcon from '@material-ui/icons/GetApp';
import {NotFound} from "./NotFound";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        margin: {
            margin: theme.spacing(2),
            marginLeft: 'auto',
        },
        topButton:{
          display: 'inline-block'
        },
        root: {
            margin: theme.spacing(3, 2),
            textAlign: 'center',
        },
        content: {
            margin: theme.spacing(2, 1),
            textAlign: 'left',
        },
        link: {
            color: 'cyan',
        }
    }),
);


interface MatchParams {
    id: string;
}

interface Props extends RouteComponentProps<MatchParams> {
    api_url: string;
    force_fetch_data: boolean;
    is_admin: boolean,
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

export interface FileLink {
    name: string;
    url: string;
}

interface OverviewEntity {
    data:  MaterialData | null;
    files: FileLink[];
    fetched: boolean;
    can_edit: boolean;
    can_delete: boolean;
    not_found: boolean;
}

const createEmptyEntity = (): OverviewEntity => {
    return {
        data: null,
        files: [],
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
        is_admin,
    }
) => {

    const classes = useStyles();

    const [overviewInfo, setOverviewInfo] = React.useState(
        createEmptyEntity()
    );

    if (overviewInfo.fetched && overviewInfo.data !== null && Number(match.params.id) !== overviewInfo.data.id) {
        setOverviewInfo({...overviewInfo, data: null, fetched: false})
    }

    console.log(overviewInfo.not_found);
    if (!overviewInfo.fetched || force_fetch_data) {
        const url = api_url + "/data/material/meta?id=" + match.params.id;
        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        let promises: Promise<OverviewEntity>[] = [];
        let promise;
        promise = getJSONData(url, auth).then(resp => {
            console.log(resp);
            if (resp === undefined) {
                console.log("API SERVER FAIL")
                return overviewInfo
            } else {
                if (resp['status'] === "OK") {
                    let can_edit = resp['access'] === "owner" || resp['access'] === "write";

                    let can_delete = resp['access'] === "owner";

                    const data = resp['data'];
                    console.log(resp);
                    return {...overviewInfo, fetched: true, data, can_edit, can_delete}
                } else {
                    return  {...overviewInfo, fetched: true, not_found: true};
                }
            }
        })
        promises.push(promise);

        const files_url = api_url + "/data/list_files/material?id=" + match.params.id;
        promise = getJSONData(files_url, auth).then((resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL")
                return {...overviewInfo, fetched: false}
            } else {
                if (resp.status === "OK") {
                    let inner_promises: Promise<FileLink>[] = [];
                    resp.data.forEach((file_name: string) => {
                        const file_get = api_url + "/data/get_file/material?id=" + match.params.id + "&file_key=" + file_name;
                        let inner_promise: Promise<FileLink> = getJSONData(file_get, auth).then((resp) => {
                            if (resp === undefined) {
                                console.log("API SERVER FAIL")
                            } else {
                                if (resp.status === "OK") {
                                    return {name: file_name, url: resp.url}
                                }
                            }
                            return {name: "", url: ""}
                        })
                        inner_promises.push(inner_promise);
                    })
                    return Promise.all(inner_promises).then((files) => {
                        return {...overviewInfo, files, fetched: false}
                    })
                } else {
                    return {...overviewInfo, fetched: false}
                }
            }
        }));
        promises.push(promise)

        Promise.all(promises).then((values) => {
            let real_data = values.find(e => e.fetched)
            let file_data = values.find(e => !e.fetched) || overviewInfo
            if (real_data) {
                setOverviewInfo({...real_data, files: file_data.files});
            }
        })
    }

    let output;
    let count = 0;
    if (overviewInfo.data) {
        output = (
            <div>
                <Divider/>
                <Typography variant={"h5"} className={classes.content}>
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
                <Typography variant={"h5"} className={classes.content}>
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
                 <Typography variant={"h5"} className={classes.content}>
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
                 <Typography variant={"h5"} className={classes.content}>
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
                 <Typography variant={"h5"} className={classes.content}>
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
                 <Typography variant={"h5"} className={classes.content}>
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
                <Typography variant={"h5"} className={classes.content}>
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
            {
                !overviewInfo.not_found &&
                typeof localStorage.getItem("access_token") === "string" &&
                <Link to={"/material/create?source=" + overviewInfo.data?.id}>
                    <Button className={classes.margin} variant="contained" color="primary">
                        Duplicate
                    </Button>
                </Link>
            }
            <div className={classes.root}>

                {overviewInfo.not_found && <NotFound/>}
                <Paper>
                    {overviewInfo.data === null ?
                        <div>
                            {!overviewInfo.not_found && <CircularProgress/>}
                        </div>
                        :
                        <div>
                                    <div className={classes.topButton}>
                                        {overviewInfo.can_edit &&
                                        <Link to={overviewInfo.data.id + "/edit"}>
                                            <Button className={classes.margin} variant="contained" color="primary" startIcon={<EditIcon/>}>
                                                edit
                                            </Button>
                                        </Link>
                                        }
                                        {is_admin &&
                                        <Link to={overviewInfo.data.id + "/edit"}>
                                            <Button className={classes.margin} variant="contained" color="secondary">
                                                edit as admin
                                            </Button>
                                        </Link>
                                        }
                                        {
                                            overviewInfo.files.length !== 0 ?
                                                <div>
                                                    <Typography variant="h5">
                                                        Files
                                                    </Typography>
                                                    {overviewInfo.files.map(file => {
                                                        return <Button className={classes.margin}
                                                                       variant="contained"
                                                                       startIcon={<GetAppIcon/>}
                                                                       target={"_blank"}
                                                                       href={file.url}
                                                                       key={file.name}
                                                                       download={true}
                                                        >
                                                            {file.name}
                                                        </Button>
                                                    })}

                                                    <Divider/>
                                                </div>
                                                :
                                                <div/>
                                        }

                                        {overviewInfo.can_delete &&
                                        <DeleteDialog id={overviewInfo.data.id} name={overviewInfo.data.title} api_url={api_url}
                                                      on_success={() => {
                                                          history.push({
                                                              pathname: "/my_materials",
                                                          });}}
                                                      endpoint={"/data/delete/material?id=" + overviewInfo.data.id}
                                        />
                                        }
                                    </div>
                                    <Divider/>
                                    <Typography variant={"h3"}>
                                        {MaterialTypesArray.find(e => e.value === overviewInfo.data?.material_type)?.label}
                                    </Typography>
                                    <Typography variant="h4" component="h3" className={classes.root}>
                                        {overviewInfo.data.title}
                                    </Typography>
                                    <Divider/>
                                    <Typography variant={"h5"} className={classes.content}>
                                        Upstream URL
                                    </Typography>
                                    <a target={"_blank"} href={overviewInfo.data.upstream_url} className={classes.link}>
                                        {overviewInfo.data.upstream_url}
                                    </a>
                                    <Divider/>
                                    <Typography variant={"h5"} className={classes.content}>
                                        Description
                                    </Typography>
                                    <Typography variant="body1" component="p" className={classes.content} >
                                        {overviewInfo.data.description}
                                    </Typography>
                                    <Divider/>
                                    {output}
                                    <Divider/>
                        </div>
                    }
                </Paper>
            </div>
        </div>
    )
};
