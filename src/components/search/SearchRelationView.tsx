import React, {FunctionComponent} from "react";

import {getJSONData, parse_query_variable} from "../../common/util";
import {Button, CircularProgress, createStyles, Paper, TextField, Theme} from "@material-ui/core";
import {Grid} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {RouteComponentProps} from "react-router";
import {SearchRelation} from "./SearchRelation";
import {Link} from "react-router-dom";
import {MaterialListEntry} from "../../common/types";
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';




const useStyles = makeStyles((theme: Theme) =>
    createStyles ( {
        textField: {
            margin: theme.spacing(2),
            width: 400,
        },
        margin: {
            margin: theme.spacing(1, 0),
        },
        paper: {
          marginTop: '0%',
          marginBottom: '10%'
        },
        button: {
          display: 'block',
          marginTop: theme.spacing(2),
        },
        formControl: {
          margin: theme.spacing(5),
          display: 'inline-block',
          minWidth: 520,
        },
        formMargin:{
          paddingLeft: 100
        },
        label:{
          marginTop: -20,
          marginLeft: 60
        },
        select: {
          width: 300,
          marginRight: 20,
          // paddingRight:200
        },
        textFieldStyle: {
          paddingLeft: 20
        },
    }));



interface MatchParams {
    id: string;
}

interface Props extends RouteComponentProps<MatchParams>{
    api_url: string;
    user_id: any;
}

interface ViewInfo {
    data: any;
    fetched: boolean;
    init_fetched: boolean;
    transform: string;
}

interface ListEntity {
    materials: MaterialListEntry[] | null;
    selected_materials: number[]
    fetched: boolean;
    search: string;
    path: string
}

const createEmptyInfo = (): ViewInfo => {
    return {
        data: null,
        fetched: false,
        init_fetched: false,
        transform: "translate(150, 150)"
    };
};

const createEmptyEntity = (path: string): ListEntity => {
    return {
        materials: null,
        selected_materials: localStorage.getItem("checked_materials")?.split(",").map(e => Number(e)) || [],
        fetched: false,
        search: "N/A",
        path
    }
};



export const SearchRelationView: FunctionComponent<Props> = ({
                                                                history,
                                                                location,
                                                                match,
                                                                api_url,
                                                                user_id,

}) => {
    const [viewInfo, setViewInfo] = React.useState(
        createEmptyInfo()
    );

    let path = location.pathname;
    const [listInfo, setListInfo] = React.useState<ListEntity>(
      createEmptyEntity(path)
    );

    const [age, setAge] = React.useState('');
    const [open, setOpen] = React.useState(false);

    const handleChange = (event: any) => {
      setAge(event.target.value);
    };

    const handleClose = () => {
      setOpen(false);
    };

    const handleOpen = () => {
      setOpen(true);
    };

    if (!listInfo.fetched) {

        let ids = "";
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
                    setListInfo({...listInfo, fetched: true, materials: data, path})
                }
            }
        })
    }


    const classes = useStyles();

    if (!viewInfo.fetched) {
        console.log("pinging");

	//Erik says: there must be a better way to parse GET parameters?
	var k = "20"
	if (location.search.split("k=")[1])
              k = location.search.split("k=")[1].split("&")[0];

	var matchpool = "all"
	if (location.search.split("matchpool=")[1])
              matchpool = location.search.split("matchpool=")[1].split("&")[0];

	var matID = "1"
	if (location.search.split("matID=")[1])
              matID = location.search.split("matID=")[1].split("&")[0];
  console.log(matID, k, matchpool)



	//	var url = "https://cors-anywhere.herokuapp.com/https://csmaterials-search.herokuapp.com/search/?matID=254&k=20"
	var url = "https://cors-anywhere.herokuapp.com/https://csmaterials-search.herokuapp.com/search?matID="+matID
	  +"&matchpool="+matchpool
	  +"&k="+k;
        getJSONData(url, {}).then(resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            }
            else {
                if (resp['status'] === "OK") {
                    const data = resp['data'];
                    console.log(data)
                    setViewInfo({...viewInfo, init_fetched: true, fetched: true, data})
                }
            }
        })


    }


    console.log(viewInfo.data)

    return (
        <div>
        <FormControl className={classes.formControl}>
          <InputLabel id="demo-controlled-open-select-label" className={classes.label}>Selected Material</InputLabel>
          <Select
            labelId="demo-controlled-open-select-label"
            id="demo-controlled-open-select"
            open={open}
            onClose={handleClose}
            onOpen={handleOpen}
            value={age}
            onChange={handleChange}
            className={classes.select}
          >
          {listInfo.materials === null ? <MenuItem value=""><em>None</em></MenuItem> : listInfo.materials.map((mat) => (
            <MenuItem value={mat.id}>{mat.title}</MenuItem>
          ))}
          </Select>
          <TextField id="filled-basic" label="Number of Matches" variant="filled" />
        </FormControl>
        <Paper>
            <Grid container direction="column">
                  <Grid item>

                  </Grid>
                <Grid item>

                </Grid>
                <Grid item
                      >
                    <Link to={""}>
                        <Button className={classes.margin} variant="contained" color="primary">
                            Search
                        </Button>
                    </Link>
                </Grid>
            </Grid>
        </Paper>
            {
                viewInfo.fetched && viewInfo.data !== null? (
                    <div id={"matrix-container"}>
                        <SearchRelation data={viewInfo.data}/>
                    </div>
                    ):
                    <CircularProgress/>
            }
        </div>
    )
};
