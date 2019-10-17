import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {BrowserRouter, Route} from "react-router-dom";

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<BrowserRouter>
    <Route render={(props) => (<App {...props}/>)}/>
  </BrowserRouter>, div);
  ReactDOM.unmountComponentAtNode(div);
});
