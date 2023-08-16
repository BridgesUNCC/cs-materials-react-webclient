import React, {FunctionComponent, useEffect} from 'react';
import './App.css';
import {getJSONData, parseJwt} from './common/util';
import {LoginDialog} from "./components/user/LoginDialog";
import {MaterialList} from "./components/MaterialList";
import {DashBoard} from "./components/collection_dashboard/dashboard";
import {Comparison} from "./components/Comparison";
import {MaterialListAuthor} from "./components/MaterialListAuthor";
import {AppBar, createStyles, Grid, Theme} from "@material-ui/core";
import {AppBarUserMenu} from "./components/user/AppBarUserMenu";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {Route, RouteComponentProps, Switch} from "react-router";
import Container from "@material-ui/core/Container";
import {MaterialOverview} from "./components/MaterialOverview";
import Button from "@material-ui/core/Button";
import {Link} from "react-router-dom";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {MaterialForm} from "./components/forms/MaterialForm";
import {LineGraphWrapper} from "./components/linegraph/LinegraphWrapper";
import {HarmonizationView} from "./components/harmonization_matrix/HarmonizationView";
import OntologyWrapper from "./components/radial/OntologyWrapper";
import {Search} from "./components/search/Search";
import {Analyze} from "./components/analyze/Analyze";
import {Author} from "./components/author/Author";
import {TutorialIndex} from "./components/tutorials/TutorialIndex";
import {AnalyzeTutorial} from "./components/tutorials/AnalyzeTutorial";
import {AuthorTutorial} from "./components/tutorials/AuthorTutorial";
import {SearchTutorial} from "./components/tutorials/SearchTutorial";
import {SearchRelationView} from "./components/search/SearchRelationView";
import Divider from '@material-ui/core/Divider';
import {Sidebar} from "./components/sidebar/Sidebar";
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import  {NotFound} from "./components/NotFound";
import Typography from '@material-ui/core/Typography';
import {getMaterialMeta} from './common/csmaterialsapiinterface';
import {getMaterialLeaves} from './common/csmaterialsapiinterface';
import {getMaterials} from './common/csmaterialsapiinterface';
import {getMaterialsTags} from './common/csmaterialsapiinterface';
import {getOntologyTree} from './common/csmaterialsapiinterface';
import {expandCollectionToListLeave} from './common/csmaterialsapiinterface';
import {acmCS13Core1} from './common/csmaterialsapiinterface';
import {filterTagsInTree} from './common/treeprocessing';
import {allTagsInTree} from './common/treeprocessing';
import {OntologyData} from './common/types';
import {uniqueTags} from './common/treeprocessing';
import {countTags} from './common/treeprocessing';
import {filterTree} from './common/treeprocessing';
import TreeVisualization from './components/radial/TreeVisualization';
import RadialTesting from './components/radial/RadialTesting';


import {
    BuildSnackbar,
    buildSnackbarProps,
    emptySnackbarBuilderProps,
    SnackbarBuilderProps
} from "./common/SnackbarBuilder";
import { SimilarityWrapper } from './components/search/SimilarityWrapper';
import { SimilaritySubcollection } from './components/search/SimilaritySubcollection';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
      margin: {
          margin: theme.spacing(1),  
      },
      extendedIcon: {
          marginRight: theme.spacing(1),
      },
      toolbarButtons: {
          marginLeft: 'auto',
      },
      icon: {
        marginRight: theme.spacing(2),
      },
      heroContent: {
        // backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(8, 8, 6),
        positon: 'relative',
        display: 'flex',
        marginLeft: theme.spacing(1),
      },
      heroButtons: {
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(4),
      },
      cardGrid: {
        paddingTop: theme.spacing(8),
        paddingBottom: theme.spacing(8),
      },
      card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      },
      cardMedia: {
        paddingTop: '56.25%', // 16:9
      },
      cardContent: {
        flexGrow: 1,
      },
      footer: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(6),
      },
      sidebar:{
          position: 'absolute',
          //display: 'flex',
          paddingRight: '200px',
          

      },
      navbar:{
          overflow: 'hidden'
      },
      frame: {
        paddingTop: 0,
        marginBottom: '5%',
        width: '100%',
        height: '700px',
      },
      dividerFullWidth: {
        margin: `5px 0 0 ${theme.spacing(2)}px`,
        minWidth: '200px',
      },
      menu:{
          minWidth: '100px',
      },
  }),
);

const cards = [{id: 1, title: "Author", image: require("./author.PNG"),
                       text: 'Enter your own course information to analyze and compare against ACM and PDC guidelines',
                       link: '/author'},
               {id: 2, title: "Analyze", image: require("./analyze.PNG"),
                       text: 'Here you can analyze your courses and collections by viewing topic alignment or comparing to other materials',
                       link: '/analyze'},
               {id: 3, title: "Search", image: require("./search.PNG"),
                       text: 'Search the CS Materials database for new and related assignments',
                       link: '/search'}];


interface Props extends RouteComponentProps {

}


export interface AppEntity {
    user_id: number | null;
    fetched_initial_data: boolean;
    force_fetch_data: boolean;
    api_url: string;
    searchapi_url: string;
    user_data?: UserData | any;
    snackbar_info: SnackbarBuilderProps;
}

const createInitialAppEntity = (): AppEntity => {
    // @TODO if token is blacklisted, drop it
    let jwt = localStorage.getItem("access_token");

    let api_url = process.env.REACT_APP_API_URL || "http://localhost:5000";
    let searchapi_url = process.env.REACT_APP_SEARCHAPI_URL || "http://localhost:6000";

    if (typeof jwt === "string") {
        let payload = parseJwt(jwt);

        if (payload !== null) {
            let id = payload.sub;
            if (id !== null) {
                return {
                    user_id: id,
                    api_url: api_url,
		    searchapi_url: searchapi_url,
                    fetched_initial_data: false,
                    force_fetch_data: false,
                    snackbar_info: emptySnackbarBuilderProps(),
                };
            }
        }
    }

    return {
        user_id: null,
        api_url: api_url,
	searchapi_url: searchapi_url,
        fetched_initial_data: false,
        force_fetch_data: false,
        snackbar_info: emptySnackbarBuilderProps(),
    };
};

// @TODO think about State in App
interface UserData {
    email: string;
    name?: string | null;
    role: string;
    registered_on: string;
    owned_materials: number[];
}

export const App: FunctionComponent<Props> = ({history, location}) => {
    const classes = useStyles();

    let [appInfo, setAppInfo] = React.useState(
        createInitialAppEntity()
    );


    //update the state of the material id lists for sending to sidebar
    //so we can render the radial and matrix view
    //this gets the updated material id selected from material list and
    //comparison views
    let [listOne, setListOne] = React.useState<any[]>([]);
    let [comparisonListOne, setcomparisonListOne] = React.useState<any[]>([]);
    let [listTwo, setListTwo] = React.useState<any[]>([]);
    //takes the event of a checkbox to determine if a value should be removed or
    //appended to the list
    //first checks if it is getting a list by checking the length of the new newElement
    //if its a list we can append all elements individualy or remove all knowing that
    //deselect all was pressed
    //we have to check if newElement is an array or not because u can check a single material
    //or selectall/deselectall
    const handleListUpdate = (event: boolean, newElement: any) => {
        if(event){
            if(newElement.length === undefined){
                setListOne(listOne => [...listOne, newElement]);
            }else{
                for(let i = 0; i < newElement.length; i++){
                    setListOne(listOne => [...listOne, newElement[i]]);
                }
            }
        }else{
            if(newElement.length === undefined){
                const newList = listOne.filter((item) => item.id !== newElement.id)
                setListOne(newList)
            }else{
                setListOne([]);
            }

        }
    }

    //function same as above but for material list one in comparison view
    const handleListOneUpdate = (event: boolean, newElement: any) => {
        if(event){
            if(newElement.length === undefined){
                setcomparisonListOne(comparisonListOne => [...comparisonListOne, newElement]);
            }else{
                for(let i = 0; i < newElement.length; i++){
                    setcomparisonListOne(comparisonListOne => [...comparisonListOne, newElement[i]]);
                }
            }
        }else{
            if(newElement.length === undefined){
                const newList = comparisonListOne.filter((item) => item.id !== newElement.id)
                setcomparisonListOne(newList)
            }else{
                setcomparisonListOne([]);
            }

        }
    }

    //handle the editing of the global list of selected materials from list two in comparison
    const handleListTwoUpdate = (event: boolean, newElement: any) => {
        if(event){
            if(newElement.length === undefined){
                setListTwo(listTwo => [...listTwo, newElement]);
            }else{
                for(let i = 0; i < newElement.length; i++){
                    setListTwo(listTwo => [...listTwo, newElement[i]]);
                }
            }
        }else{
            if(newElement.length === undefined){
                const newList = listTwo.filter((item) => item.id !== newElement.id)
                setListTwo(newList)
            }else{
                setListTwo([]);
            }

        }
    }

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleGlobalListClick = (event: any) => {
      setAnchorEl(event.currentTarget);
    };

    const handleGlobalListClose = () => {
      setAnchorEl(null);
    };


    const updateUserId = (id: number, fromStorage?: boolean, fromRegister?: boolean) => {
        let token = localStorage.getItem("access_token");

        // @TODO flash error
        getJSONData(appInfo.api_url + "/user/" + id + "/meta", {"Authorization": "bearer " + token}).then(
            resp => {
                let id_to_set = null;
                let snackbar_info = {...appInfo.snackbar_info};

                let cached_info = localStorage.getItem("snackbar_info");

                if (cached_info) {
                    snackbar_info = JSON.parse(cached_info);
                    localStorage.removeItem("snackbar_info");
                }

                if (resp === undefined) {
                    console.log("API SERVER ERROR");
                    snackbar_info = buildSnackbarProps("error", "API Error, contact admins");
                } else {
                    if (resp['status'] === "Expired") {
                        // clear response so it doesn't store junk data
                        resp = null;
                        snackbar_info = buildSnackbarProps("info", "Session Expired, please login again");
                    } else if (resp['status'] === "Invalid") {
                        console.log("was logging out?");
                        snackbar_info = buildSnackbarProps("error", "Invalid session, please login again");
                    } else if (resp['status'] === "OK") {
                        if (!fromStorage) {
                            if (!fromRegister) {
                                snackbar_info = buildSnackbarProps("success", "Login Successful");
                            } else {
                                snackbar_info = buildSnackbarProps("info",
                                    "A confirmation email has been sent, please confirm");
                            }
                        }
                        id_to_set = id;
                    }
                }

                setAppInfo({
                    ...appInfo, user_id: id_to_set, user_data: resp,
                    fetched_initial_data: true, force_fetch_data: false, snackbar_info,
                });
            }
        );

    };
    if ((!appInfo.fetched_initial_data || appInfo.force_fetch_data) && appInfo.user_id !== null) {
        /**
         *  This may be an anti pattern not sure
         *
         *  Basically, do fetch if token is from localStorage and never again
         */
        updateUserId(appInfo.user_id, true)
    }


    const logout = () => {
        let token = localStorage.getItem("access_token");
        getJSONData(appInfo.api_url + "/logout", {"Authorization": "bearer " + token}).then(
            resp => {
                let snackbar_info = {...appInfo.snackbar_info};
                let logged_out = false;
                if (resp === undefined) {
                    console.log("API SERVER ERROR");
                    snackbar_info = buildSnackbarProps("error", "API Error, contact admins");
                } else {
                    // @FIXME think about if these appInfos affect how true "logout" is
                    if (resp['status'] === "Expired") {
                        // OK? flash confirm message anyways?
                        logged_out = true;
                    } else if (resp['status'] === "Invalid") {
                        // OK, strange? flash confirm message anyways?
                        logged_out = true;
                    } else if (resp['status'] === "OK") {
                        logged_out = true;
                    }
                }

                if (logged_out) {
                    snackbar_info = buildSnackbarProps("success", "Logged out successfully")
                }

                setAppInfo({...appInfo, user_id: null, user_data: null, snackbar_info});
                localStorage.removeItem("access_token");
                localStorage.removeItem("super_access_token")

                console.log(resp);
            }
        );
    };

    const confirm = (api_url: string) => {
        const url = api_url + "/confirm" + location.search;

        // TODO flash some messages depending on appInfo of fetch
        getJSONData(url).then(resp => {
            console.log(resp);
            let snackbar_info = {...appInfo.snackbar_info};

            if (resp === undefined) {
                console.log("API SERVER ERROR");
                snackbar_info = buildSnackbarProps("error", "API Error, contact admins");
            }

            if (resp['status'] === "Invalid") {
                if (resp['reason'] === "bad token") {
                    snackbar_info = buildSnackbarProps("error", "Invalid session, please login again");
                }
            } else if (resp['status'] === "OK") {
                snackbar_info = buildSnackbarProps("success", "Email Confirmed");
            }

            const payload = parseJwt(resp['access_token']);
            if (payload !== null) {
                if (payload.sub !== null) {
                    // @TODO, push flag into local storage, that way the constructor can handle the flag for confirm message
                    localStorage.setItem("access_token", resp['access_token']);
                    localStorage.setItem("snackbar_info", JSON.stringify(snackbar_info));
                    updateUserId(payload.sub);
                    let new_location = location.pathname.endsWith("/confirm") ?
                        location.pathname.slice(0, -8) :
                        location.pathname;

                    if (new_location.length === 0) {
                        new_location = "/";
                    }

                    history.push({
                        pathname: new_location,
                    });
                }
            }
        });
    };
    if (location.pathname.endsWith("/confirm")) {
        /**
         * This may also be an anti-pattern not sure.
         */
        confirm(appInfo.api_url);
    }

    const clearSnackbarProps = () => {
        setAppInfo({...appInfo, snackbar_info: emptySnackbarBuilderProps(appInfo.snackbar_info)})
    }

    const redirect = (new_location: string) => {
        history.push({pathname: new_location});
        window.location.reload();
    };

    const force_user_data_refresh = () => {
        setAppInfo({...appInfo, force_fetch_data: true});
    };

    return (
        <div className="App">
            <Switch>
                <Route path="/">
                    <AppBar color="secondary" position="fixed">
                        <Grid container >
                            <Grid item>
                                <Button className={classes.margin} variant="contained" color="primary"
                                        component={ Link } to={"/"}
                                >
                                    CS Materials
                                </Button>
                                <Button className={classes.margin} variant="contained" color="primary"
                                        component={ Link } to={"/tutorialindex"}
                                >
                                    Tutorials
                                </Button>
                            </Grid>

                            <Grid item className={classes.toolbarButtons}>
                            <Button variant="contained" color="primary" aria-haspopup="true" className={classes.margin} onClick={handleGlobalListClick} style={{zIndex:1}}>
                              View Selected Materials
                            </Button>

                              <Menu
                                id="simple-menu"
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleGlobalListClose}
                                className={classes.menu}
                              >
                                  <li>
                                    <Typography
                                      className={classes.dividerFullWidth}
                                      color="textSecondary"
                                      display="block"
                                      variant="caption"
                                    >
                                      Selected Materials
                                    </Typography>
                                  </li>
                              {listOne.map((tag) => (
                                <MenuItem component={ Link } to={"/material/"+tag.id}>{tag.name}</MenuItem>
                              ))}
                              <Divider component="li" />
                                  <li>
                                    <Typography
                                      className={classes.dividerFullWidth}
                                      color="textSecondary"
                                      display="block"
                                      variant="caption"
                                    >
                                      Comparison List One
                                    </Typography>
                                  </li>
                              {comparisonListOne.map((tag) => (
                                <MenuItem component={ Link } to={"/material/"+tag.id}>{tag.name}</MenuItem>
                              ))}
                              <Divider component="li" />
                                  <li>
                                    <Typography
                                      className={classes.dividerFullWidth}
                                      color="textSecondary"
                                      display="block"
                                      variant="caption"
                                    >
                                      Comparison List Two
                                    </Typography>
                                  </li>

                              {listTwo.map((tag) => (
                                <MenuItem component={ Link } to={"/material/"+tag.id}>{tag.name}</MenuItem>
                              ))}
                              </Menu>
                            </Grid>

                            <Grid item className={classes.toolbarButtons}>

                                {
                                    /**
                                     If no user id set, show login button, else show user buttons
                                     */
                                    appInfo.user_id === null ?
                                        <Route render={(props) => (
                                            <LoginDialog {...props} updateId={updateUserId} api_url={appInfo.api_url}/>
                                        )}
                                        />
                                        :
                                        <Route render={(props) => (
                                            <AppBarUserMenu {...props} logout={logout} appState={appInfo}/>
                                        )}
                                        />
                                }
                            </Grid>
                        </Grid>
                    </AppBar>
                </Route>
            </Switch>

            <Grid container>
            <Grid item xs={2}>
            <Container className={classes.sidebar}>
                <Sidebar listOne={listOne.map(function(a) {return a.id;})} compareListOne={comparisonListOne.map(function(a) {return a.id;})} listTwo={listTwo.map(function(a) {return a.id;})} user_id={appInfo.user_id} user_data={appInfo} currentLoc="materials" from="materials"/>
            </Container>
            </Grid>

            <Grid item xs={10} >
            <Container className={classes.heroContent} >
                <Switch>
                    <Route exact path="/" render={() => (
                        <div>
                            <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
                                CS Materials
                            </Typography>
                            <Typography variant="h5" align="center" color="textSecondary" paragraph>
                                Create, Analyze and Search for computer science materials that are classified against the ACM and PDC guidelines.
                            </Typography>
                            <div className={classes.heroButtons}>
                                <Grid container spacing={2} justify="center">
                                    <Grid item>

                                    </Grid>
                                    <Grid item>

                                    </Grid>
                                </Grid>
                            </div>
                            {/* End hero unit */}
                            <TutorialIndex/>

                        </div>
                    )}
                    />

                    <Route path="/search" render={(route_props) => (
                        <Container maxWidth="lg">
                            <Search {...route_props} api_url={appInfo.api_url} redirect={redirect} />
                        </Container>
                    )}
                    />
                    <Route path="/author" render={(route_props) => (
                        <Container maxWidth="lg">
                            <Author info={[]} currentLoc={""}/>
                        </Container>
                    )}
                    />
                    
                    <Route path="/comparison" render={(route_props) => (
                        <Container maxWidth="lg">
                            <Comparison {...route_props} api_url={appInfo.api_url} user_data={appInfo.user_data} user_id={appInfo.user_id} listOneCallBack = {handleListOneUpdate} listTwoCallBack={handleListTwoUpdate} listOne={comparisonListOne.map(function(a) {return a.id;})} listTwo={listTwo.map(function(a) {return a.id;})}/>
                        </Container>
                    )}
                    />
                    <Route path="/matrix" render={(route_props) => (
                        <Container maxWidth="xl">
                            <HarmonizationView {...route_props} api_url={appInfo.api_url} user_id={appInfo.user_id} />
                        </Container>
                    )}
                    />
                    <Route path='/radial' render={(route_props) => {
                       let query:string = route_props.location.search;
                       const paramparser = new URLSearchParams(query);
                       
                       const p1 : string | null = paramparser.get('ids');
                       const p2 : string | null = paramparser.get('id2');
                       const ids : Array<Array<number> > = [];

                       const treetype:string | null = paramparser.get('tree');
                       const tags:string | null = paramparser.get('tags');

                       if(tags){
                          let tagList : Array<number> = [];
                          tagList = tags.split(",").map(i=>Number(i));
                       }
                       if (p1) {
                          let id1 : Array<number> = [];
                          id1 = p1.split(",").map(i=>Number(i));
                          ids.push(id1);
                       }
                       if (p2) {
                          let id2 : Array<number> = [];
                          id2 = p2.split(",").map(i=>Number(i));
                          ids.push(id2);
                       }
                       return(
                        <Container maxWidth="xl">
                            <OntologyWrapper {...route_props} api_url={appInfo.api_url} user_id={appInfo.user_id} ids={ids} tree={treetype} tags={tags}/>
                        </Container>
                    )}
                   }
                    />
                    <Route path="/materials" render={(route_props) => (
                        <Container maxWidth="md">
                            <MaterialList {...route_props} api_url={appInfo.api_url} searchapi_url={appInfo.searchapi_url} user_id={appInfo.user_id} listOneCallBack = {handleListUpdate} currentSelected={listOne.map(function(a) {return a.id;})}/>
                        </Container>
                    )}
                    />
                    <Route path="/materials_author" render={(route_props) => (
                        <Container maxWidth="md">
                            <MaterialListAuthor {...route_props} api_url={appInfo.api_url} listOne={[]} currentSelected={[]}/>
                        </Container>
                    )}
                    />
                    {appInfo.user_data &&
                    <Route path="/my_materials" render={(route_props) => (
                        <Container maxWidth="md">
                            <MaterialListAuthor
                                {...route_props}
                                api_url={appInfo.api_url}
                                user_materials={appInfo.user_data.owned_materials}
                                listOneCallBack = {handleListUpdate}
                                listOne={listOne}
                                currentSelected={listOne.map(function(a) {return a.id;})}
                            />
                        </Container>
                    )}
                    />
                    }
                    <Route path="/material/create" render={(route_props) => (
                        <Container maxWidth="md">
                            <MaterialForm {...route_props} api_url={appInfo.api_url} searchapi_url={appInfo.searchapi_url}
                                      force_user_data_reload={force_user_data_refresh}
                            />
                        </Container>
                    )}
                    />
                    <Route path="/material/:id/edit" render={(route_props) => (
                        <Container maxWidth="md">
                            <MaterialForm {...route_props} api_url={appInfo.api_url} searchapi_url={appInfo.searchapi_url}
                                          force_user_data_reload={force_user_data_refresh}/>
                        </Container>
                    )}
                    />

                    <Route path="/material/create" render={(route_props) => (
                        <Container maxWidth="md">
                            <MaterialForm {...route_props} api_url={appInfo.api_url} searchapi_url={appInfo.searchapi_url}
                                      force_user_data_reload={force_user_data_refresh}
                            />
                        </Container>
                    )}
                    />

                    <Route path="/material/:id/edit" render={(route_props) => (
                        <Container maxWidth="md">
                            <MaterialForm {...route_props} api_url={appInfo.api_url} searchapi_url={appInfo.searchapi_url}
                                          force_user_data_reload={force_user_data_refresh}/>
                        </Container>
                    )}
                    />

                    {/**
                        Because :id is a string, we need to use a switch to prevent the Overview from rendering
                        when trying to create a new material

                        @TODO figure out how to tell thing to refetch data on login/logout
                     */}
                    <Route path="/material/:id" render={(route_props) => (
                        <Container maxWidth="lg">
                            <MaterialOverview {...route_props} api_url={appInfo.api_url}
                                              force_fetch_data={false} is_admin={appInfo.user_data?.role === "admin"}/>
                        </Container>
                    )}
                    />
                    <Route path="/tutorialindex"render={(route_props) => (
                        <Container maxWidth="xl">
                            <TutorialIndex/>
                        </Container>
                    )}
                    />
                    <Route path="/Analyzetutorial"render={(route_props) => (
                        <Container maxWidth="xl">
                            <AnalyzeTutorial/>
                        </Container>
                    )}
                    />
                    <Route path="/Authortutorial"render={(route_props) => (
                        <Container maxWidth="xl">
                            <AuthorTutorial/>
                        </Container>
                    )}
                    />
                    <Route path="/searchtutorial"render={(route_props) => (
                        <Container maxWidth="xl">
                            <SearchTutorial/>
                        </Container>
                    )}
                    />
                    <Route path="/searchrelation"render={(route_props) => (
                        <Container maxWidth="xl">
                            <SearchRelationView {...route_props} api_url={appInfo.api_url} searchapi_url={appInfo.searchapi_url} user_id={appInfo.user_id} />
                        </Container>
                    )}
                    />

		    <Route path="/selectsimilarity" render={
			       (route_props) => 			       {
				   let search :string = route_props.location.search;
				   const paramparser = new URLSearchParams(search);
				   
				   const p1 : string | null = paramparser.get('id');
				   const p2 : string | null = paramparser.get('id2');
				   const ids : Array< Array<number> > = [];

				   if (p1) {
				      let id1 : Array<number> = [];
				      id1 = p1.split(",").map(i=>Number(i));
				      ids.push(id1);
				   }
				   if (p2) {
				      let id2 : Array<number> = [];
				      id2 = p2.split(",").map(i=>Number(i));
				      ids.push(id2);
				   }
			       return (
			       <Container maxWidth="xl">
			       		  <SimilarityWrapper api_url={appInfo.api_url} searchapi_url={appInfo.searchapi_url} ids={ids} />
                               </Container>
			       )}
			   }
                    />

		    <Route path="/simtest" render={
			       (route_props) => 			       {
			       
			       let ids1=[[1,2,3]];
			       let ids2=[[4,5,6]];
			       		
			       return (
			       <Container maxWidth="xl">
			       		  <SimilarityWrapper api_url={appInfo.api_url} searchapi_url={appInfo.searchapi_url} ids={ids1} />
					  <SimilarityWrapper api_url={appInfo.api_url} searchapi_url={appInfo.searchapi_url} ids={ids2} />	


                               </Container>
			       )}
			   }
                    />

		    <Route path="/testkrs" render={
			       (route_props) => 			       {
			       
			       let ids1=[[1,2,3]];
			       		
			       return (
			       <Container maxWidth="xl">
			       		  <LineGraphWrapper api_url={appInfo.api_url} searchapi_url={appInfo.searchapi_url} ids={ids1} />
                               </Container>
			       )}
			   }
                    />




		    <Route path="/collectionsimilarity" render={
			       (route_props) => 			       {
				   let search :string = route_props.location.search;
				   const paramparser = new URLSearchParams(search);
				   
				   const p1 : string | null = paramparser.get('id');
				   let id : number = Number(p1); 

							 return (
			       <Container maxWidth="xl">
				   <SimilaritySubcollection api_url={appInfo.api_url} searchapi_url={appInfo.searchapi_url} id={id}  />
                               </Container>
							)

							}
			   }
                    />

		    <Route path="/testing" render={
		    	   (route_props) => {
			   let collectionid = 178;
			   let obj :Promise<Array<Number>> = getMaterialLeaves(collectionid, appInfo.api_url);
			   let mattags = obj.then( mats => getMaterialsTags(mats, appInfo.api_url));
			   //  let alltags = mattags.then(

			   let tree = getOntologyTree("acm", appInfo.api_url);
			   Promise.all([mattags, tree]).then((values) => {
			     let matt = values[0];
			     let tr: OntologyData = values[1];

			     //filter out tags that are not in that tree
			     for (let k in matt) {
			       matt[k] = filterTagsInTree(matt[k], tr);
			     }

			     console.log(countTags(matt));

			     let filtered = filterTree(tr, (o:OntologyData)=> (o.id%2 == 1));
			     console.log("filtered");
			     console.log(filtered);
			     let core1 = acmCS13Core1();
                             let ontologyTree = filterTree(tr, (o:OntologyData)=>{return core1.includes(o.id)});
			     console.log("after filter");
			     console.log(ontologyTree);


			   });

			   return JSON.stringify(obj);
		    	   }
		    }
		    />
		    <Route path="/testing2" render={
		    	   (route_props) => {
			   let CS1s= [1210,1669, 351, 1132, 1490, 1697 ];//1678 cause internal server error
			   let OOPs=[703, 266]; //1121, 1696 causes internal server error
			   let DSs=[1210, 703, 178, 177, 805 ]; //1717, 808, 1718 causes internal server error
			   let ALGOs= [828, 584]; //and 346, but causes internal server error
			   let SOFTENGs=[998, 1695]; //and 1644 and 1035 cause internal server error for unknown reasons
			   let PDCs = [1166, 1203, 179];
			   let OTHERs = [733, 1798]; //and 1680 but it causes internval server error
			     //let collectionIds = [1210,1644,1669,1166,1035,1680,703,346,1678,808,351,733,1717,1718,1203,1132,998,1121,1695,178,179,1269,1490,266,828,177,1696,1697,805,584,1798];
			     //let collectionIds = [1210,1644,1669,1166,1035,1680,703,346,1678,808];
			     let all = [...CS1s, ...OOPs, ...DSs, ...ALGOs, ...SOFTENGs, ...PDCs, ...OTHERs];
			     let collectionIds = all;

			     let pr: any = {};
			     let all_pr: Array<Promise<number>> = [];
			     collectionIds.forEach(
			       id => {
			         all_pr.push(getMaterialLeaves(id, appInfo.api_url)
			           .then(matids => getMaterialsTags(matids, appInfo.api_url)
  			           .then(tags =>{
				     pr[id] = uniqueTags(tags);
				     return 1; //return non sense to make the types work
				     }))
				   );
				 }
			     );
			     Promise.all(all_pr).then(
			     (vals) => {
			       console.log(pr);
			     }
			     );
			     return "";
			   }
		    }
		    />


		    <Route path="/testing3" render={
		    	   (route_props) => {
			   
			   return (
			       <Container maxWidth="xl">
				   <RadialTesting  />
                               </Container>
			       );
			   }
		    }
		    />



                    <Route path="/login"/>
                    <Route path="/register"/>

                    <Route component={NotFound} />
                </Switch>
            </Container>
            </Grid>
            </Grid>

            {/*handles cards for navigation*/}

            <BuildSnackbar {...appInfo.snackbar_info} clearProps={clearSnackbarProps} />

        </div>
    );
};

export default App;
