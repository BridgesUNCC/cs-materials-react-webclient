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
          minWidth: 500,
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

    //This is just setting up a lot of the state variables used in this component
    const [materialChoice, setMaterialChoice] = React.useState('');
    const [matchpoolChoice, setMatchpoolChoice] = React.useState('All');
    const [algorithmChoice, setAlgorithmChoice] = React.useState('jaccard');
    const [searchAmount, setSearchAmount] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [openMatchpool, setOpenMatchpool] = React.useState(false);
    const [openAlgo, setOpenAlgo] = React.useState(false);

    const handleChangeMaterial = (event: any) => {
      setMaterialChoice(event.target.value);
    };

    const handleChangeMatchpool = (event: any) => {
      setMatchpoolChoice(event.target.value);
    };

    const handleChangeAlgorithm = (event: any) => {
      setAlgorithmChoice(event.target.value);
    };

    const handleChangeAmount = (event: any) => {
      setSearchAmount(event.target.value);
    };
    
    const handleClose = () => {
      setOpen(false);
    };

    const handleOpen = () => {
      setOpen(true);
    };

    const handleMatchpoolClose = () => {
      setOpenMatchpool(false);
    };

    const handleMatchpoolOpen = () => {
      setOpenMatchpool(true);
    };

    const handleAlgoClose = () => {
      setOpenAlgo(false);
    };

    const handleAlgoOpen = () => {
      setOpenAlgo(true);
    };
    var viewg;

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

        var type = "similarity"
        if (location.search.split("type=")[1])
                    type = location.search.split("type=")[1].split("&")[0];

        var algo = "pagerank"
        if (location.search.split("algo=")[1])
                    algo = location.search.split("algo=")[1].split("&")[0];
        console.log(matID, k, matchpool, type, algo)


        if(type === "search"){
          var url = "https://csmaterials-search.herokuapp.com/search?matID="+matID
      	  +"&matchpool="+matchpool
      	  +"&k="+k
          +"&algo="+algo;

          viewg = <div></div>
        }else if(type === "similarity"){
          
          var url = "https://csmaterials-search.herokuapp.com/similarity?matID="+matID
      	  +"&matchpool="+matchpool
      	  +"&k="+k;
          
          viewg = <div>
          {/* This form is what you would use to select the material that you want to search for */}
          <FormControl className={classes.formControl}>
            <InputLabel id="material-select-label" className={classes.label}>Selected Material</InputLabel>
            <Select
              autoWidth
              labelId="material-select-label"
              id="demo-controlled-open-select"
              open={open}
              onClose={handleClose}
              onOpen={handleOpen}
              value={materialChoice}
              onChange={handleChangeMaterial}
              className={classes.select}
            >
            {listInfo.materials === null ? <MenuItem value=""><em>None</em></MenuItem> : listInfo.materials.map((mat) => (
              <MenuItem value={mat.id}>{mat.title}</MenuItem>
            ))}
            </Select>
            {/* This form is what you would use to select the number of things you are comparing*/}
            <TextField id="filled-basic" label="Number of Matches" variant="filled" value={searchAmount} onChange={handleChangeAmount}/>
          </FormControl>

            {/* This form is what you would use to select the matchpool that you want to search for */}
          <FormControl className={classes.formControl}>
            <InputLabel id="matchpool-select-label" className={classes.label}>Matchpool</InputLabel>
            <Select
              autoWidth
              labelId="matchpool-select-label"
              id="matchpool-select"
              open={openMatchpool}
              onClose={handleMatchpoolClose}
              onOpen={handleMatchpoolOpen}
              value={matchpoolChoice}
              onChange={handleChangeMatchpool}
              className={classes.select}
            >
              {/* This just lists the different options that we have, might be better to like get them from a source rather than hardcoded */}
            <MenuItem value={"All"}>All</MenuItem>
            <MenuItem value={"PDC"}>PDC</MenuItem>
            </Select>
          </FormControl>

          {/* This form is what you would use to select the algorithm that you want to search for */}
          <FormControl className={classes.formControl}>
            <InputLabel id="algo-select-label" className={classes.label}>Algorithm</InputLabel>
            <Select
              autoWidth
              labelId="algo-select-label"
              id="algo-select"
              open={openAlgo}
              onClose={handleAlgoClose}
              onOpen={handleAlgoOpen}
              value={algorithmChoice}
              onChange={handleChangeAlgorithm}
              className={classes.select}
            >
            <MenuItem value={'jaccard'}>Jaccard</MenuItem>
            <MenuItem value={'matching'}>Matching</MenuItem>
            <MenuItem value={'pagerank'}>Pagerank</MenuItem>
            </Select>
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
                  // viewInfo.fetched && viewInfo.data !== null? (
                  //     <div id={"matrix-container"}>
                  //         <SearchRelation data={viewInfo.data}/>
                  //     </div>
                  //     ):
                  //     <CircularProgress/>
              }

          </div>
        }else{
          var url = ""
          viewg = <div></div>
        }

      	//	var url = "https://cors-anywhere.herokuapp.com/https://csmaterials-search.herokuapp.com/search/?matID=254&k=20"
      	//http://127.0.0.1:3000/searchrelation?k=20&matID=100

          // var url = "https://csmaterials-search.herokuapp.com/similarity?matID="+matID
      	  // +"&matchpool="+matchpool
      	  // +"&k="+k;

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


    if(viewInfo.data !== null && location.search.split("type=")[1]){
      if(location.search.split("type=")[1].split("&")[0] === "search"){
        let results: any[] = []
        for(let i = 0; i < viewInfo.data.results.length; i++){
          results.push(viewInfo.data.results[i].id)
        }
        history.push('/materials?ids=' + results.toString())
      }
    }


    console.log(viewInfo)

    return (
      <div>
        {viewg}
      </div>
    )
};
