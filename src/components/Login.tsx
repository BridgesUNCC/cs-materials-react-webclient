import React, {FormEvent, FunctionComponent, SyntheticEvent} from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import {postData, parseJwt} from "../util/util";
import {Card, createStyles, makeStyles, Theme} from "@material-ui/core";
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContentWrapper from "./SnackbarContentWrapper";

interface LoginEntity {
    login: string;
    password: string;
    fail: boolean;
    server_fail: boolean;
}

const createEmptyLogin = (): LoginEntity => ({
    login: "",
    password: "",
    fail: false,
    server_fail: false,
});

interface LoginProps {
    updateId: (id: number) => void;
}


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 200,
    },
    dense: {
      marginTop: 19,
    },
    menu: {
      width: 200,
    },
  }),
);



export const Login: FunctionComponent<LoginProps> = ({updateId}) => {
    const classes = useStyles();
    const [loginInfo, setLoginInfo] = React.useState<LoginEntity>(
        createEmptyLogin()
    );

    async function onLogin() {
        const url = "http://localhost:5000/login";

        const data = {"email": loginInfo.login, "password": loginInfo.password};
        // assume failure, to flash message
        let fail = true;
        try {
            postData(url, data).then(resp => {
                console.log(resp);
                if (resp === undefined) {
                    console.log("API SERVER ERROR");
                    setLoginInfo({...loginInfo, 'server_fail': true});
                    return;
                }
                setLoginInfo({...loginInfo, 'server_fail': false});
                const payload = parseJwt(resp['JWT']);
                if (payload !== null) {
                    if (payload.sub !== null) {
                        updateId(payload.sub);
                        localStorage.setItem("jwt", resp['JWT']);
                        fail = false;
                    }
                }
            });
        } catch (err) {
            console.log(err);
        }
        setLoginInfo({...loginInfo, 'fail': fail});
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

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
        if (event.key === 'Enter') {

            event.preventDefault();
            event.stopPropagation();
            setLoginInfo({...loginInfo, 'fail': false});
            onLogin();
        }
    };

    const handleFailClose =  (event?: SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setLoginInfo({...loginInfo, 'fail': false});
    };

    const handleServerFailClose =  (event?: SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setLoginInfo({...loginInfo, 'server_fail': false});
    };

  return (

      <div>
          <form className={classes.container} noValidate>
              <TextField
                  label="Email"
                  value={loginInfo.login}
                  className={classes.textField}
                  onChange={onTexFieldChange("login")}
                  onKeyDown={onKeyDown}
                  autoFocus={true}
              />
              <TextField
                  label="Password"
                  type="password"
                  value={loginInfo.password}
                  className={classes.textField}
                  onChange={onTexFieldChange("password")}
                  onKeyDown={onKeyDown}
              />


              <Button variant="contained" color="primary" onClick={onLogin}>
                  Login
              </Button>
          </form>
          <Button color="inherit">
              Register
          </Button>
          <Snackbar open={loginInfo.fail || loginInfo.server_fail}>
              <SnackbarContentWrapper
                  variant="error"
                  message={loginInfo.fail ? "Login Failed, check credentials":
                    "Server Error, contact Administrators"}
                  onClose={loginInfo.fail ? handleFailClose : handleServerFailClose}
              />
              }
          </Snackbar>
      </div>


  );

};