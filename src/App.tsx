import React, {FunctionComponent} from 'react';
import './App.css';
import {getJSONData, parseJwt} from './common/util';
import {LoginDialog} from "./components/user/LoginDialog";
import {MaterialList} from "./components/MaterialList";
import {MaterialListAuthor} from "./components/MaterialListAuthor";
import {AppBar, createStyles, Grid, Theme} from "@material-ui/core";
import {AppBarUserMenu} from "./components/user/AppBarUserMenu";
import {Route, RouteComponentProps, Switch} from "react-router";
import Container from "@material-ui/core/Container";
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContentWrapper from "./components/SnackbarContentWrapper";
import {MaterialOverview} from "./components/MaterialOverview";
import Button from "@material-ui/core/Button";
import {Link} from "react-router-dom";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {MaterialForm} from "./components/forms/MaterialForm";
import {HarmonizationView} from "./components/harmonization_matrix/HarmonizationView";
import OntologyWrapper from "./components/radial/OntologyWrapper";
import {Search} from "./components/search/Search";
import {Analyze} from "./components/analyze/Analyze";
import {Author} from "./components/author/Author";
import {CollectionForm} from "./components/forms/CollectionForm";
import {CollectionOverview} from "./components/CollectionOverview";
import CameraIcon from '@material-ui/icons/PhotoCamera';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';


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
        padding: theme.spacing(8, 0, 6),
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
  }),
);

const cards = [{id: 1, title: "Author", image: require("./author.PNG"),
                       text: 'Enter your own \
                       course information to analyze and compare against ACM and PDC guidelines',
                       link: '/author'},
               {id: 2, title: "Analyze", image: require("./analyze.PNG"),
                       text: 'Here you can analyze your courses or collections to find relationships among your courses \
                       or courses in a collection',
                       link: '/analyze'},
               {id: 3, title: "Search", image: require("./search.PNG"),
                       text: 'Search the CS Materials database for new assignments',
                       link: '/search'}];


interface Props extends RouteComponentProps {

}

export interface AppEntity {
    user_id: number | null;
    fetched_initial_data: boolean;
    force_fetch_data: boolean;
    api_url: string;
    user_data?: UserData | any;
    snackbar_flags: SnackbarFlags;
}

const createInitialAppEntity = (): AppEntity => {
    let snackbar_flags = defaultSnackbarFlags();

    // @TODO if token is blacklisted, drop it
    let jwt = localStorage.getItem("access_token");

    let api_url = process.env.REACT_APP_API_URL || "http://localhost:5000";

    if (typeof jwt === "string") {
        let payload = parseJwt(jwt);

        if (payload !== null) {
            let id = payload.sub;
            if (id !== null) {
                return {
                    user_id: id,
                    api_url: api_url,
                    fetched_initial_data: false,
                    force_fetch_data: false,
                    snackbar_flags: snackbar_flags
                };
            }
        }
    }

    return {
        user_id: null,
        api_url: api_url,
        fetched_initial_data: false,
        force_fetch_data: false,
        snackbar_flags: snackbar_flags
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

interface SnackbarFlags {
    ok: boolean;
    logged_out: boolean;
    request_confirm: boolean;
    confirmed: boolean;
    server_fail: boolean;
    expired: boolean;
    invalid: boolean;
}

const defaultSnackbarFlags = (): SnackbarFlags => {
    return {
        ok: false,
        logged_out: false,
        request_confirm: false,
        confirmed: false,
        server_fail: false,
        expired: false,
        invalid: false,
    };
};


export const App: FunctionComponent<Props> = ({history, location}) => {
    const classes = useStyles();

    let [appInfo, setAppInfo] = React.useState(
        createInitialAppEntity()
    );


    const updateUserId = (id: number, fromStorage?: boolean, fromRegister?: boolean) => {
        let token = localStorage.getItem("access_token");

        // @TODO flash error
        getJSONData(appInfo.api_url + "/user/" + id + "/meta", {"Authorization": "bearer " + token}).then(
            resp => {
                let ok = false, request_confirm = false, expired = false, server_fail = false, invalid = false;
                let id_to_set = null;

                if (resp === undefined) {
                    console.log("API SERVER ERROR");
                    server_fail = true;
                } else {

                    if (resp['status'] === "Expired") {
                        // clear response so it doesn't store junk data
                        resp = null;
                        expired = true;
                    } else if (resp['status'] === "Invalid") {
                        console.log("was logging out?");
                        invalid = true;
                        return;
                    } else if (resp['status'] === "OK") {
                        if (!fromStorage) {
                            if (!fromRegister) {
                                ok = true;
                            } else {
                                request_confirm = true;
                            }
                        }
                        id_to_set = id;
                    }
                }

                let flags = appInfo.snackbar_flags;
                flags = {...flags, ok, expired, server_fail, invalid, request_confirm};

                setAppInfo({
                    ...appInfo, user_id: id_to_set, user_data: resp,
                    snackbar_flags: flags, fetched_initial_data: true, force_fetch_data: false,
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
                let logged_out = false, server_fail = false;
                if (resp === undefined) {
                    console.log("API SERVER ERROR");
                    server_fail = true;
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
                let flags = appInfo.snackbar_flags;
                flags = {...flags, logged_out, server_fail};

                setAppInfo({...appInfo, user_id: null, user_data: null, snackbar_flags: flags,
                });
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

            if (resp === undefined) {
                console.log("API SERVER ERROR");

            }

            if (resp['status'] === "Invalid") {
                if (resp['reason'] === "bad token") {

                } else {

                }
            }

            const payload = parseJwt(resp['access_token']);
            if (payload !== null) {
                if (payload.sub !== null) {
                    // @TODO, push flag into local storage, that way the constructor can handle the flag for confirm message
                    localStorage.setItem("access_token", resp['access_token']);
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

    const handleSnackbarClose = (name: string) => {
        let flags = appInfo.snackbar_flags;
        flags = {...flags, [name]: false};
        setAppInfo({...appInfo, snackbar_flags: flags});
    };

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
                    <AppBar color="secondary" position="sticky">
                        <Grid container >
                            <Grid item>
                                <Button className={classes.margin} variant="contained" color="primary"
                                        component={ Link } to={"/"}
                                >
                                    CS Materials
                                </Button>
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

            <Container maxWidth="md" className={classes.heroContent}>

                <Route exact path="/" render={() => (
                    <div>
                      <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
                        CS Materials
                      </Typography>
                      <Typography variant="h5" align="center" color="textSecondary" paragraph>
                        Put something about cs materials here. maybe a short description
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
                      <Grid container spacing={4}>
                        {cards.map((card) => (
                          <Grid item key={card.id} xs={12} sm={6} md={4}>
                            <Card className={classes.card}>
                              <CardMedia
                                className={classes.cardMedia}
                                image={card.image}
                                title="Image title"
                              />
                              <CardContent className={classes.cardContent}>
                                <Typography gutterBottom variant="h5" component="h2">
                                  {card.title}
                                </Typography>
                                <Typography>
                                  {card.text}
                                </Typography>
                              </CardContent>
                              <CardActions>
                              <Route exact path="/" render={() => (
                                card.title === 'Author' ?
                                  appInfo.user_id === null ?
                                  <Route render={(props) => (
                                      <LoginDialog {...props} updateId={updateUserId} api_url={appInfo.api_url}/>
                                  )}
                                  />
                                    :
                                    <Link to={card.link}>
                                      <Button variant="contained" size="small" color="primary">
                                        Begin
                                      </Button>
                                    </Link>
                                  :
                                  <Link to={card.link}>
                                    <Button variant="contained" size="small" color="primary">
                                      Begin
                                    </Button>
                                  </Link>
                              )}
                              />
                              </CardActions>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </div>
                )}
                />


                <Switch>
                    <Route path="/search" render={(route_props) => (
                        <Container maxWidth="lg">
                            <Search {...route_props} api_url={appInfo.api_url} redirect={redirect}/>
                        </Container>
                    )}
                    />
                    <Route path="/author" render={(route_props) => (
                        <Container maxWidth="lg">
                            <Author />
                        </Container>
                    )}
                    />
                    <Route path="/analyze" render={(route_props) => (
                        <Container maxWidth="lg">
                            <Analyze info={[]} />
                        </Container>
                    )}
                    />
                    <Route path="/matrix" render={(route_props) => (
                        <Container maxWidth="xl">
                            <HarmonizationView {...route_props} api_url={appInfo.api_url} />
                        </Container>
                    )}
                    />
                    <Route path='/radial' render={(route_props) => (
                        <Container maxWidth="xl">
                            <OntologyWrapper {...route_props} api_url={appInfo.api_url}/>
                        </Container>
                    )}
                    />
                    <Route path="/materials" render={(route_props) => (
                        <Container maxWidth="md">
                            <MaterialList {...route_props} api_url={appInfo.api_url}/>
                        </Container>
                    )}
                    />
                    <Route path="/materials_author" render={(route_props) => (
                        <Container maxWidth="md">
                            <MaterialListAuthor {...route_props} api_url={appInfo.api_url}/>
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
                            />
                        </Container>
                    )}
                    />
                    }
                    <Route path="/material/create" render={(route_props) => (
                        <Container maxWidth="md">
                            <MaterialForm {...route_props} api_url={appInfo.api_url}
                                      force_user_data_reload={force_user_data_refresh}
                            />
                        </Container>
                    )}
                    />
                    <Route path="/material/:id/edit" render={(route_props) => (
                        <Container maxWidth="md">
                            <MaterialForm {...route_props} api_url={appInfo.api_url}
                                          force_user_data_reload={force_user_data_refresh}/>
                        </Container>
                    )}
                    />
                </Switch>


                <Switch>
                    <Route path="/collection/create" render={(route_props) => (
                        <Container maxWidth={"md"}>
                            <CollectionForm {...route_props} api_url={appInfo.api_url}
                                force_user_data_reload={force_user_data_refresh}
                            />
                        </Container>
                    )}
                    />

                    <Route path="/collection/:id" render={(route_props) => (
                        <Container maxWidth={"md"}>
                            <CollectionOverview {...route_props} api_url={appInfo.api_url} />
                        </Container>
                    )}
                    />

                    <Route path="/material/create" render={(route_props) => (
                        <Container maxWidth="md">
                            <MaterialForm {...route_props} api_url={appInfo.api_url}
                                      force_user_data_reload={force_user_data_refresh}
                            />
                        </Container>
                    )}
                    />


                    <Route path="/material/:id/edit" render={(route_props) => (
                        <Container maxWidth="md">
                            <MaterialForm {...route_props} api_url={appInfo.api_url}
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
                                              force_fetch_data={false}/>
                        </Container>
                    )}
                    />
                </Switch>
            </Container>

            {/*handles cards for navigation*/}
            {/**
             Begin Snackbar stuff for account stuff, may be a @TODO or @FIXME at some point to
             move it into its own component, that takes in the snackbar_flags from the appInfo of the app.
             currently that may be too abstract for my own good, so I am doing it way
             */}
            <Snackbar open={appInfo.snackbar_flags.ok}>
                <SnackbarContentWrapper
                    variant="success"
                    message="Login Successful"
                    onClose={() => {handleSnackbarClose("ok")}}
                />
            </Snackbar>

            <Snackbar open={appInfo.snackbar_flags.logged_out}>
                <SnackbarContentWrapper
                    variant="success"
                    message="Logged out successfully"
                    onClose={() => handleSnackbarClose("logged_out")}
                />
            </Snackbar>

            <Snackbar open={appInfo.snackbar_flags.confirmed}>
                <SnackbarContentWrapper
                    variant="success"
                    message="Email Confirmed"
                    onClose={() => handleSnackbarClose("confirmed")}
                />
            </Snackbar>

            <Snackbar open={appInfo.snackbar_flags.request_confirm}>
                <SnackbarContentWrapper
                    variant="info"
                    message="A confirmation email has been sent, please confirm"
                    onClose={() => handleSnackbarClose("request_confirm")}
                />
            </Snackbar>

            <Snackbar open={appInfo.snackbar_flags.expired}>
                <SnackbarContentWrapper
                    variant="info"
                    message="Session Expired, please login again"
                    onClose={() => handleSnackbarClose("expired")}
                />
            </Snackbar>

            <Snackbar open={appInfo.snackbar_flags.server_fail}>
                <SnackbarContentWrapper
                    variant="error"
                    message="API Error, contact admins"
                    onClose={() => handleSnackbarClose("server_fail")}
                />
            </Snackbar>

            <Snackbar open={appInfo.snackbar_flags.invalid}>
                <SnackbarContentWrapper
                    variant="error"
                    message="Invalid session, please login again"
                    onClose={() => handleSnackbarClose("invalid")}
                />
            </Snackbar>

        </div>
    );
};

export default App;
