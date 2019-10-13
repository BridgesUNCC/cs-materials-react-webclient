import React from 'react';
import './App.css';
import {parseJwt} from './util/util';
import {LoginDialog} from "./components/LoginDialog";
import {AppBar, Button, Grid} from "@material-ui/core";


interface Props {

}

interface AppState {
  userID: number | null
}


export class App extends React.Component<Props, AppState> {

    constructor(props: Props) {
        super(props);
        let jwt = localStorage.getItem("jwt");

        if (typeof jwt == "string") {
            let payload = parseJwt(jwt);

            if (payload !== null) {
                let id = payload.sub;
                this.state = {userID: id};
                return;
            }
        }

        this.state = {userID: null};
    }


    updateUserId = (id: number) => {
        this.setState({userID: id});
    };

    logout = () => {
        this.setState({userID: null});
        localStorage.removeItem("jwt");
    };

    render () {
        return (
            <div className="App">
                <header className="App-header">
                </header>
                <AppBar color="secondary">
                    <Grid
                        justify="flex-end"
                        container
                        spacing={4}
                    >
                        <Grid item>
                        {this.state.userID === null && <LoginDialog updateId={this.updateUserId}/>}
                        {this.state.userID && <Button onClick={this.logout}> Logged in </Button>}
                        </Grid>
                    </Grid>
                </AppBar>
            </div>
        );
    }
}

export default App;
