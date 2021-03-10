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
            padding: theme.spacing(3, 2, 0, 0),
            margin: theme.spacing(2, 0, 0, 0),
            align: 'center',
            marginLeft: 100,
        },
        titles:{
          align: 'center',
          marginLeft: 100,
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
        selected_materials: localStorage.getItem("checked_materials")?.split(",").map(e => Number(e)) || [],
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
    from: string;
}

export const MaterialList: FunctionComponent<ListProps> = ({   history,
                                                               location,
                                                               match,
                                                               api_url,
                                                               user_materials,
                                                               user_id,
                                                               from,
                                                           }) => {
    const classes = useStyles();
    let path = location.pathname;
    let search = location.search;

    console.log(path)

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
                    console.log(data)
                    setListInfo({...listInfo, fetched: true, materials: data, search: search, path})
                }
            }
        })
    }

    // @Speed @TODO, smart cull entries so rendering doesn't take too long, maybe have a callback that renders more as
    // user scrolls down?
    let output;
    let count = 0;
    console.log(listInfo)
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

        localStorage.setItem("checked_materials", selected.toString());

        setListInfo({...listInfo, selected_materials: selected});
    };

    const handleSelectAll = () => {
        let selected_materials = [...new Set(listInfo.selected_materials.concat(listInfo.materials?.map(e => e.id)
            || []))]
        localStorage.setItem("checked_materials", selected_materials.toString());

        setListInfo({...listInfo, selected_materials});
    };

    const handleSelectNone = () => {
        let selected_materials: number[] = []
        localStorage.setItem("checked_materials", selected_materials.toString());

        setListInfo({...listInfo, selected_materials});
    };

    return (
        <div>
        {/*load selected material to analyze comp for visualze*/}
        {(listInfo.search !== "?material_types=collection")?
          <Analyze listOne={listInfo.selected_materials} listTwo={[]} user_id={user_id} user_data={{}} currentLoc="materials" from="materials"/>
          :
          <Analyze listOne={listInfo.selected_materials} listTwo={[]} user_id={user_id} user_data={{}} currentLoc="collection" from="collection"/>
        }
        {/*uses the listinfor search variable to determine if on collections or not, could prob be done a better way*/}
          {(listInfo.search !== "?material_types=collection") ?
            <Typography component="h1" variant="h3" align="center" color="textPrimary" gutterBottom className={classes.titles}>
                Select Materials
            </Typography>
            :
            <Typography component="h1" variant="h3" align="center" color="textPrimary" gutterBottom className={classes.titles}>
                Select Collections
            </Typography>
          }
            <Paper className={classes.root}>
                <Grid container direction="column">
                    <Grid item>
                        <Button className={classes.margin} variant="contained" color="primary"
                                onClick={() => {
                                    if (listInfo.materials !== null)
                                        handleSelectAll();
                                }}
                        >
                            Select All
                        </Button>
                        <Button className={classes.margin} variant="contained" color="primary"
                                onClick={() => {handleSelectNone();}}
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
