import React from 'react';
import './App.css';
import {getJSONData, parseJwt} from './util/util';
import {LoginDialog} from "./components/LoginDialog";
import {AppBar, Grid} from "@material-ui/core";
import {AppBarUserMenu} from "./components/AppBarUserMenu";
import {Route, RouteComponentProps, Switch} from "react-router";


interface Props extends RouteComponentProps {

}

export interface AppState {
    userID: number | null
    apiURL: string,
    userData?: UserData | any,
}

// @TODO think about State in App
interface UserData {
    email: string,
    name?: string | null,
    role: string,
    registered_on: string,
}


export class App extends React.Component<Props, AppState> {

    constructor(props: Props) {
        super(props);
        // @TODO if token is blacklisted, drop it
        let jwt = localStorage.getItem("access_token");
        console.log(this.props.location);

        console.log(process.env.REACT_APP_PRODUCTION_API);
        let apiURL = process.env.REACT_APP_PRODUCTION_API || "http://localhost:5000";
        if (this.props.location.pathname.endsWith("/confirm")) {
            this.confirm(apiURL);
        }
        if (typeof jwt == "string") {
            let payload = parseJwt(jwt);

            if (payload !== null) {
                let id = payload.sub;
                if (id !== null) {
                    this.state = {userID: id, apiURL: apiURL};
                    this.updateUserId(id);
                }
                return;
            }
        }

        this.state = {userID: null, apiURL: apiURL};
    }


    updateUserId = (id: number) => {
        let token = localStorage.getItem("access_token");

        // @TODO flash error
        getJSONData(this.state.apiURL + "/user/" + id + "/meta", {"Authorization": "bearer " + token}).then(
            resp => {
                console.log(resp);
                   if (resp === undefined) {
                    console.log("API SERVER ERROR");
                    return;
                }

                if (resp['status'] === "Expired") {
                    // TODO do refresh or logout
                }
                else if (resp['status'] === "Invalid") {
                    console.log("was this logging out?");
                    return;
                }

                this.setState({...this.state, userID: id, userData: resp});
                console.log(id);
                console.log(resp);
            }
        );

    };

    logout = () => {
        let token = localStorage.getItem("access_token");
        getJSONData(this.state.apiURL + "/logout", {"Authorization": "bearer " + token}).then (
            resp => {
                if (resp['status'] === "Expired") {
                    // OK do Nothing
                }
                else if (resp['status'] === "Invalid") {
                    // OK, strange
                }

                this.setState({userID: null, userData: null});
                localStorage.removeItem("access_token");
                localStorage.removeItem("super_access_token");

                console.log(resp);
            }
        );
    };

    confirm = (apiURL: string) => {
        const url = apiURL + "/confirm" + this.props.location.search;

        // TODO flash some messages depending on state of fetch
        getJSONData(url).then(resp => {
            console.log(resp);
            if (resp === undefined) {
                console.log("API SERVER ERROR");
                return;
            }

            if (resp['status'] === "Invalid") {
                if (resp['reason'] === "bad token") {

                } else {

                }
            };

            const payload = parseJwt(resp['access_token']);
            if (payload !== null) {
                if (payload.sub !== null) {
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

    render () {
        return (
            <div className="App">
                <header className="App-header">
                </header>

                <Switch>
                    <Route path="/">
                        <AppBar color="secondary">
                            <Grid
                                justify="flex-end"
                                container
                                spacing={4}
                            >
                                <Grid item>
                                    {this.state.userID === null &&
                                        <Route render={(props) => (
                                            <LoginDialog {...props} updateId={this.updateUserId} apiURL={this.state.apiURL}/>
                                        )}
                                        />
                                    }
                                    {this.state.userID && <AppBarUserMenu logout={this.logout} appState={this.state}/>}
                                </Grid>
                            </Grid>
                        </AppBar>
                    </Route>
                </Switch>
            </div>
        );
    }
}

export default App;
