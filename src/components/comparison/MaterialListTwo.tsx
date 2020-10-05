import React, {FunctionComponent} from "react";
import {getJSONData, parse_query_variable} from "../../common/util";
import CircularProgress from "@material-ui/core/CircularProgress";
import List from "@material-ui/core/List";
import {ListItemLink} from "../ListItemLink";
import {Checkbox, createStyles, Divider, Grid, Paper, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import {RouteComponentProps} from "react-router";
import Button from "@material-ui/core/Button";
import {MaterialListEntry} from "../../common/types";
import {Analyze} from "../analyze/Analyze";
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
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
    from: string;
}

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export const MaterialListTwo: FunctionComponent<ListProps> = ({   history,
                                                               location,
                                                               match,
                                                               api_url,
                                                               user_materials,
                                                               user_id,
                                                               user_data,
                                                               from,
                                                           }) => {
    const classes = useStyles();
    let path = location.pathname;
    let search = location.search;
    console.log(location)
    const [listInfo, setListInfo] = React.useState<ListEntity>(
        createEmptyEntity(path)
    );
    const [tabState, setTabState] = React.useState("")

    let reload = path !== listInfo.path || search !== listInfo.search;

    if(user_data)
      user_materials = user_data.owned_materials


    if (!listInfo.fetched || reload) {

        let ids
        (tabState === "/my_materials") ? ids = user_materials?.toString() : ids = ""
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

    //when a tab is clicked that tabs value is passed to this function
    //the value is assigned to the location search variable and the listinfo's fetched variable is set to false
    //that way, it is forced to reload with the new search filter
    const handleChange=(event:any, newValue:string) => {
      location.search = newValue
      setTabState(newValue)
      if(user_data && newValue === "/my_materials"){
        location.search = ""
      }
      setListInfo({...listInfo, fetched: false})
    }

    if(location.pathname !== "/comparison"){
      if (listInfo.search === "") {
        var title = <Typography component="h1" variant="h3" align="center" color="textPrimary" gutterBottom>
            Select Materials
        </Typography>
      }
      else{
        var title = <Typography component="h1" variant="h3" align="center" color="textPrimary" gutterBottom>
            Select Collections
        </Typography>
      }
    }else{
      var title = <div></div>
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

    console.log(listInfo.selected_materials)
    var analyze = <Analyze info={listInfo.selected_materials} user_id={user_id} user_data={{user_data}} currentLoc="compare" from="listTwo"/>

    return (
        <div>
        <AppBar position="static">
        <Tabs value={"hello"} onChange={handleChange} aria-label="wrapped label tabs example">
          <Tab value="" label="All Materials"/>
          <Tab value="?material_types=collection" label="Collections" />
          <Tab value="/my_materials" label="My Materials" />
        </Tabs>
      </AppBar>
      <TabPanel value={"hello"} index="one">
        Item One
      </TabPanel>
      <TabPanel value={"hello"} index="two">
        Item Two
      </TabPanel>
      <TabPanel value={"hello"} index="three">
        Item Three
      </TabPanel>
        {/*load selected material to analyze comp for visualze*/}
        {analyze}
        {/*uses the listinfor search variable to determine if on collections or not, could prob be done a better way*/}
          {title}
            <Paper className={classes.root}>
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
