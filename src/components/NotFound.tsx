import React from "react";
import {Route} from "react-router";


// @ts-ignore
function Status({ code, children }) {
  return (
    <Route
      render={() => {
        return children;
      }}
    />
  );
}

export function NotFound() {
  return (
    <Status code={404}>
      <div>
        <h1>Sorry, can’t find that.</h1>
      </div>
    </Status>
  );
}