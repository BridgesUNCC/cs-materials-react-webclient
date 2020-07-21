import React, {FunctionComponent} from "react";
import {getJSONData, parse_query_variable} from "../common/util";
import CircularProgress from "@material-ui/core/CircularProgress";
import List from "@material-ui/core/List";
import {ListItemLink} from "./ListItemLink";
import {Checkbox, createStyles, Divider, Grid, Paper, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import {RouteComponentProps} from "react-router";
import Button from "@material-ui/core/Button";
import {MaterialListEntry} from "../common/types";
import {Analyze} from "./analyze/Analyze";



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
}

export const MaterialList: FunctionComponent<ListProps> = ({   history,
                                                               location,
                                                               match,
                                                               api_url,
                                                               user_materials,
                                                           }) => {
    const classes = useStyles();
    let path = location.pathname;
    let search = location.search;
    const [listInfo, setListInfo] = React.useState<ListEntity>(
        createEmptyEntity(path)
    );

    let reload = path !== listInfo.path || search !== listInfo.search;


    if (!listInfo.fetched || reload) {

        let ids = user_materials?.toString() || "";
        ids += parse_query_variable(location, "ids");
        let tags = parse_query_variable(location, "tags");
        let sim_mats = parse_query_variable(location, "sim_mats");
        let keyword = parse_query_variable(location, "keyword");
        let material_types = parse_query_variable(location, "material_types");

        const url = api_url + "/data/list/materials?ids=" + ids + "&tags=" + tags + "&sim_mats=" + sim_mats
            + "&keyword=" + keyword + "&material_types=" + material_types;

        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        // @TODO pass in auth token
        getJSONData(url, auth).then(resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            }
            else {
                if (resp['status'] === "OK") {
                    const data = resp['data'];
                    setListInfo({...listInfo, fetched: true, materials: data, search: search, path})
                }
            }
        })
    }

    // @Speed @TODO, smart cull entries so rendering doesn't take too long, maybe have a callback that renders more as
    // user scrolls down?
    let output;
    let count = 0;
    if (listInfo.materials !== null && !reload) {
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
          {/*load selected material to analyze comp for visualze*/}
          <Analyze info={listInfo.selected_materials}/>
            <Paper className={classes.root}>
                <Typography variant="h5" component="h3">
                    Results
                </Typography>

                <Grid container direction="column">
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
                {(listInfo.materials === null || reload) &&
                <CircularProgress/>
                }
                <List>
                    {output}
                </List>
            </Paper>
        </div>
    )
};
