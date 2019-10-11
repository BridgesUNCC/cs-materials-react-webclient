import React, {FormEvent, FunctionComponent} from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import {postData, parseJwt} from "../util/util";
import {Card} from "@material-ui/core";



interface LoginEntity {
  login: string;
  password: string;
}

const createEmptyLogin = (): LoginEntity => ({
  login: "",
  password: ""
});

interface LoginProps {
    updateId: (id: number) => void;
}



export const Login: FunctionComponent<LoginProps> = ({updateId}) => {
    const [loginInfo, setLoginInfo] = React.useState<LoginEntity>(
        createEmptyLogin()
    );

    async function onLogin() {
        const url = "http://localhost:5000/login";

        const data = {"email": loginInfo.login, "password": loginInfo.password};
        try {
            postData(url, data).then(resp => {
                console.log(resp);
                const payload = parseJwt(resp['JWT']);
                if (payload !== null) {
                    if (payload.sub !== null) {
                        updateId(payload.sub);
                        localStorage.setItem("jwt", resp['JWT']);
                    }
                }
            });
        } catch (err) {
            console.log(err);
        }
    }

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
          <div>
              <TextField
                  label="Email"
                  margin="normal"
                  value={loginInfo.login}
                  onChange={onTexFieldChange("login")}
              />
          </div>
          <div>
              <TextField
                  label="Password"
                  type="password"
                  margin="normal"
                  value={loginInfo.password}
                  onChange={onTexFieldChange("password")}
              />
          </div>
          <div>
              <Button variant="contained" color="primary" onClick={onLogin}>
                  Login
              </Button>
          </div>
      </div>


  );

};