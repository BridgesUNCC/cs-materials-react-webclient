import React from 'react';
import './App.css';
import {getJSONData, parseJwt} from './util/util';
import {LoginDialog} from "./components/LoginDialog";
import {AppBar, Grid} from "@material-ui/core";
import {AppBarUserMenu} from "./components/AppBarUserMenu";
import {Route, Switch} from "react-router";


interface Props {

}

export interface AppState {
    userID: number | null
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

        if (typeof jwt == "string") {
            let payload = parseJwt(jwt);

            if (payload !== null) {
                let id = payload.sub;
                if (id !== null) {
                    this.state = {userID: id};
                    this.updateUserId(id);
                }
                return;
            }
        }

        this.state = {userID: null};
    }


    updateUserId = (id: number) => {
        let token = localStorage.getItem("access_token");

        getJSONData("http://localhost:5000/user/" + id + "/meta", {"Authorization": "bearer " + token}).then(
            resp => {
                if (resp['status'] === "Expired") {
                    // TODO do refresh or logout
                }
                else if (resp['status'] === "Invalid") {
                    this.logout();
                    return;
                }

                this.setState({userID: id, userData: resp});
                console.log(id);
                console.log(resp);
            }
        );

    };

    logout = () => {
        let token = localStorage.getItem("access_token");
        getJSONData("http://localhost:5000/logout", {"Authorization": "bearer " + token}).then (
            resp => {
                if (resp['status'] === "Expired") {
                    // OK do Nothing
                }
                else if (resp['status'] === "Invalid") {
                    // OK, strange
                }

                this.setState({userID: null, userData: null});

                console.log(resp);
            }
        );
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
                                            <LoginDialog {...props} updateId={this.updateUserId}/>
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
