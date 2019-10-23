import React from 'react';
import './App.css';
import {getJSONData, parseJwt} from './util/util';
import {LoginDialog} from "./components/LoginDialog";
import {MaterialList} from "./components/MaterialList";
import {AppBar, Grid} from "@material-ui/core";
import {AppBarUserMenu} from "./components/AppBarUserMenu";
import {Route, RouteComponentProps, Switch} from "react-router";
import Container from "@material-ui/core/Container";
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContentWrapper from "./components/SnackbarContentWrapper";


interface Props extends RouteComponentProps {

}

export interface AppState {
    user_id: number | null
    api_url: string,
    user_data?: UserData | any,
    snackbar_flags: SnackbarFlags,
}

// @TODO think about State in App
interface UserData {
    email: string,
    name?: string | null,
    role: string,
    registered_on: string,
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


export class App extends React.Component<Props, AppState> {

    constructor(props: Props) {
        super(props);
        let snackbar_flags = defaultSnackbarFlags();

        // @TODO if token is blacklisted, drop it
        let jwt = localStorage.getItem("access_token");
        console.log(this.props.location);

        console.log(process.env.REACT_APP_API_URL);
        let api_url = process.env.REACT_APP_API_URL || "http://localhost:5000";
        if (this.props.location.pathname.endsWith("/confirm")) {
            this.confirm(api_url);
        }
        if (typeof jwt == "string") {
            let payload = parseJwt(jwt);

            if (payload !== null) {
                let id = payload.sub;
                if (id !== null) {
                    this.state = {user_id: id, api_url: api_url, snackbar_flags: snackbar_flags};
                    this.updateUserId(id, true);
                }
                return;
            }
        }

        this.state = {user_id: null, api_url: api_url, snackbar_flags: snackbar_flags};
    }


    updateUserId = (id: number, fromStorage?: boolean, fromRegister?: boolean) => {
        let token = localStorage.getItem("access_token");

        // @TODO flash error
        getJSONData(this.state.api_url + "/user/" + id + "/meta", {"Authorization": "bearer " + token}).then(
            resp => {
                let ok = false, request_confirm = false, expired = false, server_fail = false, invalid = false;
                let id_to_set = null;

                console.log(resp);
                if (resp === undefined) {
                    console.log("API SERVER ERROR");
                    server_fail = true;
                } else {

                    if (resp['status'] === "Expired") {
                        expired = true;
                    } else if (resp['status'] === "Invalid") {
                        console.log("was this logging out?");
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

                let flags = this.state.snackbar_flags;
                flags = {...flags, ok, expired, server_fail, invalid, request_confirm};

                this.setState({...this.state, user_id: id_to_set, user_data: resp, snackbar_flags: flags});
                console.log(id);
                console.log(resp);
            }
        );

    };

    logout = () => {
        let token = localStorage.getItem("access_token");
        getJSONData(this.state.api_url + "/logout", {"Authorization": "bearer " + token}).then (
            resp => {
                let logged_out = false, server_fail = false;
                if (resp === undefined) {
                    console.log("API SERVER ERROR");
                    server_fail = true;
                } else {
                    // @FIXME think about if these states affect how true "logout" is
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
                let flags = this.state.snackbar_flags;
                flags = {...flags, logged_out, server_fail};

                this.setState({...this.state, user_id: null, user_data: null, snackbar_flags: flags});
                localStorage.removeItem("access_token");
                localStorage.removeItem("super_access_token");

                console.log(resp);
            }
        );
    };

    confirm = (api_url: string) => {
        const url = api_url + "/confirm" + this.props.location.search;

        // TODO flash some messages depending on state of fetch
        getJSONData(url).then(resp => {
            console.log(resp);

            let ok = false, request_confirm = false, expired = false, server_fail = false, invalid = false;
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
                    this.updateUserId(payload.sub);
                    let new_location = this.props.location.pathname.endsWith("/confirm") ?
                        this.props.location.pathname.slice(0, -8) :
                        this.props.location.pathname;

                    if (new_location.length === 0) {
                        new_location = "/";
                    }

                    this.props.history.push({
                        pathname: new_location,
                    });
                }
            }
        });
    };

    handleSnackbarClose = (name: string) => {
        let flags = this.state.snackbar_flags;
        flags = {...flags, [name]: false};
        this.setState({...this.state, snackbar_flags: flags});
    };

    render () {
        return (
            <div className="App">
                <Switch>
                    <Route path="/">
                        <AppBar color="secondary" position="sticky">
                            <Grid
                                justify="flex-end"
                                container
                                spacing={4}
                            >
                                <Grid item>
                                    {this.state.user_id === null &&
                                    <Route render={(props) => (
                                        <LoginDialog {...props} updateId={this.updateUserId} api_url={this.state.api_url}/>
                                    )}
                                    />
                                    }
                                    {this.state.user_id && <AppBarUserMenu logout={this.logout} appState={this.state}/>}
                                </Grid>
                            </Grid>
                        </AppBar>
                    </Route>
                </Switch>

                <Container maxWidth="md">

                    <MaterialList apiURL={this.state.api_url}/>

                </Container>


                {/**
                    Begin Snackbar stuff for account stuff, this may be a @TODO or @FIXME at some point to
                    move it into its own component, that takes in the snackbar_flags from the state of the app.
                    currently that may be too abstract for my own good, so I am doing it this way
                 */}
                <Snackbar open={this.state.snackbar_flags.ok}>
                    <SnackbarContentWrapper
                        variant="success"
                        message="Login Successful"
                        onClose={() => {
                            /**
                                This is a hack, essentially; in order to use handleSnackbarClose like this, passing a
                                string to determine which is to be closed, we must pass a true "function" to the Wrapper
                                when in reality this is just messy way to reuse some logic. I will probably
                                end up doing this in general when handling multiple snackbar messages

                                Placing this message here in hopes of preventing myself from seeing the NOP and trying
                                "refactor" which will break the type checker and make it yell at you
                             */
                            this.handleSnackbarClose("ok")
                        }}
                    />
                </Snackbar>

                <Snackbar open={this.state.snackbar_flags.logged_out}>
                    <SnackbarContentWrapper
                        variant="success"
                        message="Logged out successfully"
                        onClose={() => this.handleSnackbarClose("logged_out")}
                    />
                </Snackbar>

                <Snackbar open={this.state.snackbar_flags.confirmed}>
                    <SnackbarContentWrapper
                        variant="success"
                        message="Email Confirmed"
                        onClose={() => this.handleSnackbarClose("confirmed")}
                    />
                </Snackbar>

                <Snackbar open={this.state.snackbar_flags.request_confirm}>
                    <SnackbarContentWrapper
                        variant="info"
                        message="A confirmation email has been sent, please confirm"
                        onClose={() => this.handleSnackbarClose("request_confirm")}
                    />
                </Snackbar>

                <Snackbar open={this.state.snackbar_flags.expired}>
                    <SnackbarContentWrapper
                        variant="info"
                        message="Session Expired, please login again"
                        onClose={() => this.handleSnackbarClose("expired")}
                    />
                </Snackbar>

                <Snackbar open={this.state.snackbar_flags.server_fail}>
                    <SnackbarContentWrapper
                        variant="error"
                        message="API Error, contact admins"
                        onClose={() => this.handleSnackbarClose("server_fail")}
                    />
                </Snackbar>

                <Snackbar open={this.state.snackbar_flags.invalid}>
                    <SnackbarContentWrapper
                        variant="error"
                        message="Invalid session, please login again"
                        onClose={() => this.handleSnackbarClose("invalid")}
                    />
                </Snackbar>

            </div>
        );
    }
}

export default App;
