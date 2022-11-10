import React, {FunctionComponent, useEffect} from "react";
import {getJSONData, parse_query_variable} from "../../common/util";
import {Button, Card, CardContent, CircularProgress, createStyles, Paper, TextField, Theme, Typography} from "@material-ui/core";
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
import { Autocomplete, ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { EqualizerSharp, Label } from "@material-ui/icons";
import { Console } from "console";



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

interface ResultData {
  id: number;
  score: number;
  title: string;
}

interface ListEntity {
    materials: MaterialListEntry[];
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
    }
};

const createEmptyEntity = (path: string): ListEntity => {
    return {
        materials: [],
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
    const [materialChoice, setMaterialChoice] = React.useState<Array<number> | number>([]);
    const [matchpoolChoice, setMatchpoolChoice] = React.useState('all');
    const [algorithmChoice, setAlgorithmChoice] = React.useState('jaccard');
    const [searchType, setSearchType] = React.useState('search');
    const [searchAmount, setSearchAmount] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [openMatchpool, setOpenMatchpool] = React.useState(false);
    const [openAlgo, setOpenAlgo] = React.useState(false);
    const [resultDisplay, setResultDisplay] = React.useState<Array<ResultData> | null>();
    const [resultSimilarityDisplay, setResultSimilarityDisplay] = React.useState<Array<any> | null>(null); 
    const [resultSimilarityDisplayKeys, setResultSimilarityDisplayKeys] = React.useState<Array<string> | null>(null);
    const [multipleChoice,setMultipleChoice] = React.useState(false);
    
    //This function makes sure that at least one of the toggles is selected
    const handleChangeSearchType = (
      event: React.MouseEvent<HTMLElement>,
      newSearchType: string | null,
    ) => {
      if (newSearchType !== null) {
        setSearchType(newSearchType);
        setMaterialChoice([]);
        setResultSimilarityDisplay(null);
        setResultDisplay(null);
      }
    };
    //I need this to correctly update the multipleChoice variable correctly I believe (the useEffect hook operates async)
    useEffect(() => {
      searchType === 'search' ?   setMultipleChoice(false) : setMultipleChoice(true);
    }, [searchType]);

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

    const handleSearchClick = () => {
      //Some examples of API calls

      //	var url = "https://cors-anywhere.herokuapp.com/https://csmaterials-search.herokuapp.com/search/?matID=254&k=20"
      //http://127.0.0.1:3000/searchrelation?k=20&matID=100

      // var url = "https://csmaterials-search.herokuapp.com/similarity?matID="+matID
      // +"&matchpool="+matchpool
      // +"&k="+k;
      multipleChoice ? handleSimilarity() : handleSearch();
      
    };
    const handleSearch = () => {
      var url = "https://csmaterials-search.herokuapp.com/search"
          + "?matID="+materialChoice
          +"&matchpool="+matchpoolChoice
          +"&algorithm="+algorithmChoice
          +"&k="+searchAmount;
      console.log(url)
      getJSONData(url, {}).then(resp => {
        console.log(resp)
          if (resp === undefined) {
              console.log("API SERVER FAIL")
          }
          else {

              if (resp['status'] === "OK") {
                  let data = resp['data'];

                  handleData(data.results);
              }
          }
      })
    };
    //Similarity data is split in to 2 arrays (since it won't let me print information from an object)
    // the keys are sent to resultSimilarityDisplayKeys, and the actual 
    // data is sent to resultSimilarityDisplay. The keys are used to retrieve the name of the material when displaying the results
    // and the data is used to hold the ID's and corresponding similarity value
    const handleSimilarity = () => {
      var url = "https://csmaterials-search.herokuapp.com/similarity"
          + "?matID="+materialChoice
          +"&matchpool="+matchpoolChoice;
      getJSONData(url, {}).then(resp => {
        console.log(resp)
          if (resp === undefined) {
              console.log("API SERVER FAIL")
          }
          else {

              if (resp['status'] === "OK") {
                //I'm sure there is a better way of doing this, but I am just convering this information to an array of strings to be displayed
                  let data = resp['data'];
                  let dataArray = [];
                  data = data.similarity; //This is the portion of the response that contains the similarity data
                  setResultSimilarityDisplayKeys(Object.keys(data))
                  data = Object.values(data)
                  for(let i = 0; i < data.length; i++){
                    dataArray.push(Object.entries(data[i]))
                  }
                  //console.log("This is the data" + dataArray)
                  
                  handleData(dataArray)
              }
          }
      })
    };
    const handleData = (data: any) => { //Just selecting where the data is sent basically
      multipleChoice ? setResultSimilarityDisplay(data) : setResultDisplay(data);
    };

    var viewg;


    //Needs to fetch only materials from the smart search. This is currently getting all
    //Materials in the database
    if (!listInfo.fetched) {

        let ids = "";
        ids += parse_query_variable(location, "ids");
        let tags = parse_query_variable(location, "tags");
        let sim_mats = parse_query_variable(location, "sim_mats");
        let keyword = parse_query_variable(location, "keyword");
        let material_types = parse_query_variable(location, "material_types");

        let url = api_url + "/data/list/materials?ids=" + ids + "&tags=" + tags + "&sim_mats=" + sim_mats
            + "&keyword=" + keyword + "&material_types=" + material_types;

        let auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        // @TODO pass in auth token
        getJSONData(url, auth).then(resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            }
            else {
                if (resp['status'] === "OK") {
                    let data = resp['data'];
                    //console.log(data)
                    setListInfo({...listInfo, fetched: true, materials: data, path})
                }
            }
        })
    }


    const classes = useStyles();


    //TODO:
    //This is currently running automatically when the page loads
    //Need to run this when someone submits from the form

    //TODO:
    //in the form we need for choose between regular search and similarity search

    //TODO:
    //searching searches for top similar materials based on an imput Material
    //similarity scores the similarity between a set of materials passed in
    //for both you should pass in ids
    // I have been intructed to commend this stuff out
    if (!viewInfo.fetched) {
        // console.log("pinging");

      	// //Erik says: there must be a better way to parse GET parameters?
        // //K is the number of matches
      	// let k = "20"
      	// if (location.search.split("k=")[1])
        //             k = location.search.split("k=")[1].split("&")[0];
        // //to figure out
      	// let matchpool = "all"
      	// if (location.search.split("matchpool=")[1])
        //             matchpool = location.search.split("matchpool=")[1].split("&")[0];

        // //TODO:
        // //similarity takes more than 1 material as input
        // //so change the material component based on searchtype
      	// let matID = "1"
      	// if (location.search.split("matID=")[1])
        //             matID = location.search.split("matID=")[1].split("&")[0];

        // let type = "search"//or similarity
        // if (location.search.split("type=")[1])
        //             type = location.search.split("type=")[1].split("&")[0];

        // //TODO: search only takes algorithm
        // let algo = "pagerank"
        // if (location.search.split("algo=")[1])
        //             algo = location.search.split("algo=")[1].split("&")[0];
        // console.log(matID, k, matchpool, type, algo)

        // let url = "https://csmaterials-search.herokuapp.com/"+type+"?matID="+matID
        // +"&matchpool="+matchpool
        // +"&k="+k
        // +"&algo="+algo;

        //TODO: Done! There was some stuff down here but I removed it
        //move to onclick function

          viewg = <div>
            {/* This autocomplete could be a really cool way of replacing the current dropdown menu with something easier to use */}
          {/* <Autocomplete
            disablePortal
            id="combo-box-demo"
            multiple = {multipleChoice}
            getOptionLabel={(option) => option.title}
            onChange={(event: any, value: MaterialListEntry | MaterialListEntry[] | null) => {
              
              setMaterialChoice(value!.id);
            
            }}
            options={listInfo.materials}
            renderInput={(params) => <TextField {...params} label="Select Material" />}
          /> */}
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
              multiple = {multipleChoice}
              onChange={(event: any) => setMaterialChoice(event.target.value)}
              className={classes.select}
              
            >
            {listInfo.materials === null ? <MenuItem value=""><em>None</em></MenuItem> : listInfo.materials.map((mat) => (
              <MenuItem value={mat.id}>{mat.title}</MenuItem>
            ))}
            </Select>
            {/* This form is what you would use to select the number of things you are comparing*/}
            <TextField id="filled-basic" 
            label="Number of Matches" 
            variant="filled" 
            value={searchAmount} 
            disabled={multipleChoice}
            onChange={(event: any) => setSearchAmount(event.target.value)}/>
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
              onChange={(event: any) => setMatchpoolChoice(event.target.value)}
              className={classes.select}
            >
              {/* This just lists the different options that we have, might be better to like get them from a source rather than hardcoded */}
            <MenuItem value={"all"}>All</MenuItem>
            <MenuItem value={"pdc"}>PDC</MenuItem>
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
              disabled={multipleChoice}
              onChange={(event: any) => setAlgorithmChoice(event.target.value)}
              className={classes.select}
            >
            <MenuItem value={'jaccard'}>Jaccard</MenuItem>
            <MenuItem value={'matching'}>Matching</MenuItem>
            <MenuItem value={'pagerank'}>Pagerank</MenuItem>
            </Select>
          {/* This is used to set the search type, either search or simularity */}
          </FormControl>
          <ToggleButtonGroup
          value= {searchType}
          exclusive
          onChange={handleChangeSearchType}
        >
          <ToggleButton value="search">
            Search
          </ToggleButton>
          <ToggleButton value="similarity">
            Similarity
          </ToggleButton>
         </ToggleButtonGroup>

          <Paper>
              <Grid container direction="column">
                    <Grid item>

                    </Grid>
                  <Grid item>

                  </Grid>
                  <Grid item
                        >
                          <Button onClick={handleSearchClick} className={classes.margin} variant="contained" color="primary">
                              Search
                          </Button>
                          
                  </Grid>
              </Grid>
          </Paper>
          {/* Super weird syntax but basically its conditionally creating these elements depending on if the multipleChoice
          variable is true or not */}
          
          {(resultDisplay !== null)&&!multipleChoice&&<Typography component={'span'}> 
                      {
                        
                        resultDisplay?.map(({id, score, title}) => 
                      {
                        let link = './material/' + id
                          return (
                            <Link to={link} style={{ textDecoration: 'none' }}>
                                <Card variant="outlined">
                                  <CardContent>
                                    <Typography>
                                      {title}
                                    </Typography>
                                  </CardContent>
                                </Card>
                                </Link>
                          )
                        }
                      )
                    }
            </Typography> 
           
          }
          {/* Similar conditional rendering  */}
          {(resultSimilarityDisplay !== null)&&multipleChoice&&<Typography component={'span'}> 
            {
                        // This maps through the results of the similarity search
                        resultSimilarityDisplay?.map((value: Array<Object>, index) => 
                      {
                          return (
                                <Card variant="outlined">
                                  <CardContent>
                                    <h4>Similarity scores for: {
                                      //This is using the id's present in the keys array to searh the materials list for the titles of the various
                                      //materials that are being listed as well as displaying their similarity score.
                                    listInfo.materials.find(({id}) => id === parseInt(resultSimilarityDisplayKeys![index]))?.title}
                                    </h4>
                                    {
                                      value?.map((info: any) => {
                                        return<Typography>
                                          {listInfo.materials.find(({id}) => id === parseInt(info[0]))?.title}: {info[1]}
                                        </Typography>
                                      })
                                    }
                                    <Typography> 
                                    </Typography>
                                  </CardContent>
                                </Card>
                                
                          )
                        }
                      )
                    }
            </Typography> 
          }
              {
                  // viewInfo.fetched && viewInfo.data !== null? (
                  //     <div id={"matrix-container"}>
                  //         <SearchRelation data={viewInfo.data}/>
                  //     </div>
                  //     ):
                  //     <CircularProgress/>
              }
          </div>
        }



    //to use later??
    // if(viewInfo.data !== null && location.search.split("type=")[1]){
    //   if(location.search.split("type=")[1].split("&")[0] === "search"){
    //     let results: any[] = []
    //     for(let i = 0; i < viewInfo.data.results.length; i++){
    //       results.push(viewInfo.data.results[i].id)
    //     }
    //     history.push('/materials?ids=' + results.toString())
    //   }
    // }


    //console.log(viewInfo)

    return (
      <div>
        {viewg}
      </div>
    )
};
