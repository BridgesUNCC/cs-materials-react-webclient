import React, {FunctionComponent} from "react";
import {getJSONData} from "../util/util";
import CircularProgress from "@material-ui/core/CircularProgress";
import List from "@material-ui/core/List";
import {ListItemLink} from "./ListItemLink";
import {Checkbox, createStyles, Divider, Grid, Paper, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import {RouteComponentProps} from "react-router";
import Button from "@material-ui/core/Button";
import {Link} from "react-router-dom";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(3, 2),
            margin: theme.spacing(5),
        },
        margin: {
            margin: theme.spacing(5),
        },
    }),
);


interface MaterialEntry {
    title: string;
    id: number;
}


interface ListEntity {
    materials: MaterialEntry[] | null;
    selected_materials: number[]
    fetched: boolean;
}

const createEmptyEntity = (): ListEntity => {
    return {
        materials: null,
        selected_materials: [],
        fetched: false,
    }
};

interface MatchParams {
    id: string;
}

interface ListProps extends RouteComponentProps<MatchParams> {
    api_url: string;
}

export const MaterialList: FunctionComponent<ListProps> = ({   history,
                                                               location,
                                                               match,
                                                               api_url,
                                                           }) => {
    const classes = useStyles();

    const [listInfo, setListInfo] = React.useState<ListEntity>(
        createEmptyEntity()
    );
    console.log("in material list");

    if (!listInfo.fetched) {
        setListInfo({...listInfo, fetched: true});


        let ids = "";
        let tags = "";
        let sim_mats = "";
        let keyword = "";
        let collectionsOnly = "";
        if (location.search.split("ids=")[1])
            ids = location.search.split("ids=")[1].split("&")[0];
        if (location.search.split("tags=")[1])
            tags = location.search.split("tags=")[1].split("&")[0];
        if (location.search.split("sim_mats=")[1])
            sim_mats = location.search.split("sim_mats=")[1].split("&")[0];
        if (location.search.split("keyword=")[1])
            keyword = location.search.split("keyword=")[1].split("&")[0];
        if (location.search.split("collectionsOnly=")[1])
            collectionsOnly = location.search.split("collectionsOnly=")[1].split("&")[0];

        const url = api_url + "/data/list/materials?ids=" + ids + "&tags=" + tags + "&sim_mats=" + sim_mats
            + "&keyword=" + keyword + "&collectionsOnly=" + collectionsOnly;

        // @TODO pass in auth token
        getJSONData(url).then(resp => {
            console.log(resp);
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            }
            else {
                if (resp['status'] === "OK") {
                    const data = resp['data'];
                    setListInfo({...listInfo, fetched: true, materials: data})
                }
            }
        })
    }

    // @Speed @TODO, smart cull entries so rendering doesn't take too long, maybe have a callback that renders more as
    // user scrolls down?
    let output;
    let count = 0;
    if (listInfo.materials !== null) {
        output = listInfo.materials.map((value, index) => {
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
                        input={
                            <Checkbox id={`checkbox-${value.id}`}
                                      checked={listInfo.selected_materials.includes(value.id)}
                                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                          event.stopPropagation();
                                          handleCheck(event, value.id);
                                      }}
                                      onClick={e => (e.stopPropagation())}
                            />
                        }
                    />
                </div>
            )
        });
    }

    const handleCheck = (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
        let selected = listInfo.selected_materials;
        if (event.target.checked) {
            selected.push(id);
        } else {
            selected = selected.filter(e => e !== id);
        }

        setListInfo({...listInfo, selected_materials: selected});
    };

    return (
        <div>
            <Paper className={classes.root}>
                <Typography variant="h5" component="h3">
                    Results
                </Typography>

                <Grid container
                      direction="column"

                >
                    <Grid item>
                        <Button className={classes.margin} variant="contained" color="primary"
                                component={ Link } to={"/matrix?ids=" + (listInfo.selected_materials.length === 0 ?
                                -1
                                :
                                listInfo.selected_materials
                        )
                        }>
                            Harmonization Matrix
                        </Button>
                        <Button className={classes.margin} variant="contained" color="primary"
                                component={ Link } to={"/radial?tree=acm&ids=" + listInfo.selected_materials}>
                            Radial View ACM-CSC 2013
                        </Button>
                        <Button className={classes.margin} variant="contained" color="primary"
                                component={ Link } to={"/radial?tree=pdc&ids=" + listInfo.selected_materials}>
                            Radial View PDC 2012
                        </Button>
                        <Button className={classes.margin} variant="contained" color="primary"
                                onClick={() => {
                                    history.push("/materials?sim_mats=" + listInfo.selected_materials);
                                    setListInfo({...listInfo, materials: null, fetched: false});
                                }}>
                            Search for Similar Materials
                        </Button>
                    </Grid>
                    <Divider/>
                        <Button className={classes.margin} variant="contained" color="primary"
                                onClick={() => {
                                    history.push("/collection/create?ids=" + listInfo.selected_materials);
                                    setListInfo({...listInfo, materials: null, fetched: false});
                                }}>
                            Create Collection from Selected Materials
                        </Button>
                    <Divider/>
                    <Grid item>
                        <Button className={classes.margin} variant="contained" color="primary"
                                onClick={() => {
                                    if (listInfo.materials !== null)
                                        setListInfo({...listInfo, selected_materials:listInfo.materials.map(e => e.id)})}
                                }
                        >
                            Select All
                        </Button>
                        <Button className={classes.margin} variant="contained" color="primary"
                                onClick={() => {setListInfo({...listInfo, selected_materials:[]})}}
                        >
                            Select None
                        </Button>
                    </Grid>
                </Grid>
                {listInfo.materials === null &&
                <CircularProgress/>
                }
                <List>
                    {output}
                </List>
            </Paper>
        </div>
    )
};
