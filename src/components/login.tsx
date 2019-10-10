import React, {FormEvent, FunctionComponent} from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";



interface LoginEntity {
  login: string;
  password: string;
}

const createEmptyLogin = (): LoginEntity => ({
  login: "",
  password: ""
});

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  })
      .catch(e => {
          console.log(e);
      });
  if (typeof response === "object") {
      let body = await response.json()
      console.log(body);
      return body; // parses JSON response into native JavaScript objects
  }
}


export const Login: FunctionComponent = () => {
    const [loginInfo, setLoginInfo] = React.useState<LoginEntity>(
        createEmptyLogin()
    );

    const onLogin = () => {
        const url = "http://localhost:5000/login";

        const data = {"email": loginInfo.login, "password": loginInfo.password};
        try {
            const resp = postData(url, data);
            console.log(resp);
        } catch (err) {
            console.log(err);
        }
    };

    const onUpdateLoginField = (name: string, value: string) => {
        setLoginInfo({
            ...loginInfo,
            [name]: value
        });
    };

    const onTexFieldChange = (fieldId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateLoginField(fieldId, e.currentTarget.value);
    };


  return (

      <div>
          <TextField
              label="Email"
              margin="normal"
              value={loginInfo.login}
              onChange={onTexFieldChange("login")}
          />
          <TextField
              label="Password"
              type="password"
              margin="normal"
              value={loginInfo.password}
              onChange={onTexFieldChange("password")}
          />
          <Button variant="contained" color="primary" onClick={onLogin}>
              Login
          </Button>
      </div>


  );

};