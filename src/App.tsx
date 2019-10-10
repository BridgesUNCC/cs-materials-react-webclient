import React from 'react';
import logo from './logo.svg';
import './App.css';
import parseJWT from './util/util';
import {Login} from "./components/login";


interface Props {

}

interface AppState {
  userID: number | null
}


export class App extends React.Component {

  constructor(props: Props) {
    super(props);
    let jwt = localStorage.getItem("jwt");

    if (typeof jwt == "string") {
      let payload = parseJWT(jwt);

      if (payload !== null) {
          let id = payload.sub;
          this.setState({userID: id});
      }

    }

  }




  render ()
  {
    return (
        <div className="App">
          <header className="App-header">
              <Login>

              </Login>
          </header>
        </div>
    );
  }
}

export default App;
