import React, {FunctionComponent, useEffect} from "react";
import {getJSONData, parse_query_variable} from "../../common/util";
import {Button, Card, CardContent, CircularProgress, createStyles, Paper, TextField, Theme, Typography} from "@material-ui/core";
import {Grid} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {RouteComponentProps} from "react-router";
import {SearchRelation} from "./SearchRelation";
import {Link, useLocation} from "react-router-dom";
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
          width: 600,
          marginRight: 20,
          marginTop:20
        },
        Grid: {
          

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
//This interface and the following function create a way of holding all of the search parameters
interface SearchParam {
  materialChoice: Array<number> | number;
  matchpoolChoice: string | null;
  algorithmChoice: string | null;
  searchType: string | null;
  searchAmount: number;
}
const createEmptyParams = (): SearchParam => {
  return {
    materialChoice: [],
    matchpoolChoice: 'all',
    algorithmChoice: 'jaccard',
    searchType: 'search',
    searchAmount: 1
  }
};
interface SimilarityData {
  visData: any;
  names: any;
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

      //This stuff runs when the component is mounted
      //console.log(viewInfo)
      let algorithms = ["jaccard", "matching", "pagerank"];
      let types = ["similarity", "search"];
      let matchpools = ["all", "pdc"];
      useEffect(()=>{
          let tempParam = createEmptyParams();
          const searchParams = new URLSearchParams(search);
          if(searchParams.has("type") && types.includes(searchParams.get("type")!)) tempParam.searchType = searchParams.get("type")!;
          if(searchParams.has("algo") && algorithms.includes(searchParams.get("algo")!)) tempParam.algorithmChoice = searchParams.get("algo")!;
          if(searchParams.has("matchpool") && matchpools.includes(searchParams.get("matchpool")!)) tempParam.matchpoolChoice = searchParams.get("matchpool")!;
          if(searchParams.has("matID") && parseInt(searchParams.get("matID")!) >= 0) tempParam.materialChoice = searchParams.get("matID")!.split(',').map(e => parseInt(e));
          if(searchParams.has("k") && parseInt(searchParams.get("k")!) >= 0) tempParam.searchAmount = parseInt(searchParams.get("k")!);
          (tempParam.searchType === "search") ? setMultipleChoice(false) : setMultipleChoice(true);
          if(tempParam !== searchParameters){
            setSearchParameters(tempParam);
          }
        }, []);
    const [viewInfo, setViewInfo] = React.useState(
        createEmptyInfo()
    );

    let path = location.pathname;
    const [listInfo, setListInfo] = React.useState<ListEntity>(
      createEmptyEntity(path)
    );

    //This is just setting up a lot of the state variables used in this component
    const [searchParameters, setSearchParameters] = React.useState<SearchParam>(createEmptyParams());
    const [resultDisplay, setResultDisplay] = React.useState<Array<ResultData> | null>();
    const [similarityDisplay, setSimilarityDisplay] = React.useState<SimilarityData | null>(null);
    const [multipleChoice,setMultipleChoice] = React.useState(false);
    const [similarityIdList, setSimilarityIdList] = React.useState<Number[]>([]);
    
    //This function makes sure that at least one of the toggles is selected
    //I need this to correctly update the multipleChoice variable correctly I believe (the useEffect hook operates async)
    useEffect(() => {
      searchParameters.searchType === 'search' ? setMultipleChoice(false) : setMultipleChoice(true);
    }, [searchParameters]);

    const handleSearchClick = () => {
      multipleChoice ? handleSimilarity() : handleSearch();
    };
    const handleSearch = () => {
      //This syntax looks a lot better to me
      var url = 'https://csmaterials-search.herokuapp.com/search?'+
                 `matID=${searchParameters.materialChoice}&matchpool=${searchParameters.matchpoolChoice}`+
                 `&algo=${searchParameters.algorithmChoice}&k=${searchParameters.searchAmount}`;
      console.log(url);
      getJSONData(url, {}).then(resp => {
        console.log(resp)
          if (resp === undefined) {
              console.log("API SERVER FAIL")
          }
          else {
              let list: number[] = [];
              if (resp['status'] === "OK") {
                  let listOfResults : ResultData[] = [];
                  let data = resp['data'];
                  listOfResults = data.results;
                  setResultDisplay(data.results);
                  listOfResults?.map(({id, score, title}) => 
                  {
                    console.log(id);
                    list.push(id);
                    }
                  )
                  setSimilarityIdList(list);
                  console.log("List: " + list + "\nSimilarity List: " + similarityIdList + "\nResults Display: " + resultDisplay);
              }
          }
      })
    };
    const handleSimilarity = () => {
      
      var url = 'https://csmaterials-search.herokuapp.com/similarity?'+
                 `matID=${searchParameters.materialChoice}`
      getJSONData(url, {}).then(resp => {
          if (resp === undefined) {
              console.log("API SERVER FAIL")
          }
          else {

              if (resp['status'] === "OK") {
                //Getting the names for the labels
                let ob = {};
                if(Array.isArray(searchParameters.materialChoice)){
                  searchParameters.materialChoice.map(i =>{
                    ob = {...ob, [i]: (listInfo.materials.find(material => material.id === i))?.title};
                  });
                }
                let dataVis = resp['data'];
                  setSimilarityDisplay({visData: dataVis, names: ob});
              }
          }
      })
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
                    setListInfo({...listInfo, fetched: true, materials: data, path})
                }
            }
        })
    }

    let { search } = useLocation();
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
      
      
      //console.log("pinging");

      	// //Erik says: there must be a better way to parse GET parameters?
        // //K is the number of matches
      	
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
            value={[]}
            multiple = {multipleChoice}
            getOptionLabel={(option) => option.title}
            onChange={(event: any, value: any) => {
              setSearchParameters({...searchParameters, materialChoice: value.id});
            }}
            options={listInfo.materials}
            renderInput={(params) => <TextField {...params} label="Select Material" />}
          /> */}
          {/* This form is what you would use to select the material that you want to search for */}
          <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center" >

          <Grid item>
          <FormControl className={classes.formControl}>
            <InputLabel id="material-select-label" className={classes.label}>Selected Material</InputLabel>
            <Select
              autoWidth
              labelId="material-select-label"
              id="demo-controlled-open-select"
              
              
              value={searchParameters.materialChoice}
              multiple = {true}
              onChange={(event: any) => setSearchParameters({...searchParameters, materialChoice: event.target.value})}
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
            value={searchParameters.searchAmount} 
            
            disabled={multipleChoice}
            onChange={(event: any) => setSearchParameters({...searchParameters, searchAmount: event.target.value})}/>
          </FormControl>
          </Grid>

            {/* This form is what you would use to select the matchpool that you want to search for */}
          {/* <Grid item>
          <FormControl className={classes.formControl}>
            <InputLabel id="matchpool-select-label" className={classes.label}>Matchpool / Algorithm</InputLabel>
            <Select
              autoWidth
              labelId="matchpool-select-label"
              id="matchpool-select"
              value={searchParameters.matchpoolChoice}
              onChange={(event: any) => setSearchParameters({...searchParameters, matchpoolChoice: event.target.value})}
              className={classes.select}
            >
            <MenuItem value={"all"}>All</MenuItem>
            <MenuItem value={"pdc"}>PDC</MenuItem>
            </Select>
            <Select
              autoWidth
              labelId="algo-select-label"
              id="algo-select"
              value={searchParameters.algorithmChoice}
              disabled={multipleChoice}
              onChange={(event: any) =>{
                setSearchParameters({...searchParameters, algorithmChoice: event.target.value});
              } }
              className={classes.select}
            >
            <MenuItem value={'jaccard'}>Jaccard</MenuItem>
            <MenuItem value={'matching'}>Matching</MenuItem>
            <MenuItem value={'pagerank'}>Pagerank</MenuItem>
            </Select>
          </FormControl>
          </Grid> */}

          

          <Grid item>
          {/* <ToggleButtonGroup
          value= {searchParameters.searchType}
          exclusive
          onChange={(
                      event: React.MouseEvent<HTMLElement>,
                      newSearchType: string | null
                    ) => {
                      if (newSearchType !== null) {
                        //This part just fills in the list with data from the URL when you switch from similarity to search
                        let materials : Array<number> | number = [];
                        const searchParams = new URLSearchParams(search);
                        if(searchParams.has("matID") && parseInt(searchParams.get("matID")!) >= 0 && !multipleChoice) materials = searchParams.get("matID")!.split(',').map(e => parseInt(e));
                        if(searchParams.has("matID") && parseInt(searchParams.get("matID")!) >= 0 && multipleChoice) materials = [parseInt(searchParams.get("matID")!)];
                        setSearchParameters({...searchParameters, searchType: newSearchType, materialChoice: materials, searchAmount: 1})
                        setSimilarityDisplay(null);
                        setResultDisplay(null);
                      }
                    }}
          >
          <ToggleButton value="search">
            Search
          </ToggleButton>
          <ToggleButton value="similarity">
            Similarity
          </ToggleButton>
         </ToggleButtonGroup>    */}
         </Grid>

         </Grid>
              <Grid container direction="column">
                    <Grid item>

                    </Grid>
                  <Grid item>

                  </Grid>
                  <Grid item>
                          <Button onClick={handleSearchClick} className={classes.margin} variant="contained" color="primary">
                              Search
                          </Button>
                  </Grid>
                  <Grid item>
                          <Button component={Link} to={'/selectsimilarity?id=' + searchParameters.materialChoice + "&id2=" + similarityIdList} variant="contained" color="primary">
                              Similarity Graph
                          </Button>
                  </Grid>
              </Grid>
          {/* Super weird syntax but basically its conditionally creating these elements depending on if the multipleChoice
          variable is true or not */}
          
          {(resultDisplay !== null)&&!multipleChoice&&<Typography component={'span'}> 
          <Paper style={{maxHeight: 330, overflow: 'auto'}}>
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
              </Paper>
            </Typography> 
           
          }
          {/* Similar conditional rendering  */}
          {(similarityDisplay !== null)&&multipleChoice&&
          // I mean should I be using Material UI for this? I'm just gonna use in text styling
            <div>
            <div style={{border: '2px solid gray', height: '600px', backgroundColor: '#3b3a3a', marginTop: '20px'}}> 
              <SearchRelation data={similarityDisplay.visData} names={similarityDisplay.names}/>
            </div> 
            </div>
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
    
 

    return (
        <div>
          {viewg}
        </div>
      )
    
};
