import React, {FunctionComponent, SyntheticEvent} from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import {postJSONData, parseJwt} from "../../util/util";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContentWrapper from "../SnackbarContentWrapper";
import Grid from "@material-ui/core/Grid";

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
    openRegister: () => void;
    handleDialogClose: () => void;
    setLoading: (loading: boolean) => void;
    openForgot: () => void;
    api_url: string;
}


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        textField: {
            margin: theme.spacing(2),
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



export const Login: FunctionComponent<LoginProps> = ({
                                                         updateId,
                                                         openRegister,
                                                         handleDialogClose,
                                                         setLoading,
                                                         openForgot,
                                                         api_url,
                                                     }) => {
    const classes = useStyles();
    const [loginInfo, setLoginInfo] = React.useState<LoginEntity>(
        createEmptyLogin()
    );

    async function onLogin() {
        const url = api_url + "/login";

        const data = {"email": loginInfo.login, "password": loginInfo.password};


        setLoading(true);
        // assume failure, to flash message
        let fail = true;
        let server_fail = false;
        let cancel = false;
        try {
            postJSONData(url, data).then(resp => {
                console.log(resp);
                if (resp === undefined) {
                    console.log("API SERVER ERROR");
                    fail = false;
                    server_fail = true;
                    return;
                }
                const payload = parseJwt(resp['access_token']);
                if (payload !== null) {
                    if (payload.sub !== null) {
                        localStorage.setItem("access_token", resp['access_token']);
                        handleDialogClose();
                        updateId(payload.sub);
                        // cancel state update, as component is going to unmount
                        cancel = true;
                    }
                }
            }).finally(() => {
                if (!cancel) {
                    setLoading(false);
                    setLoginInfo({...loginInfo, 'fail': fail, 'server_fail': server_fail});
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

    const onTextFieldChange = (fieldId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateLoginField(fieldId, e.currentTarget.value);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
        if (event.key === 'Enter') {

            event.preventDefault();
            event.stopPropagation();
            onLogin();
        }
    };

    const handleSnackbarClose =  (name: string, event?: SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setLoginInfo({...loginInfo, [name]: false});
    };

    return (
        <div>
            <Grid
                container
                direction="column"
                justify="flex-start"
            >
                <Grid
                    item
                >
                    <TextField
                        error={loginInfo.fail}
                        label="Email"
                        value={loginInfo.login}
                        className={classes.textField}
                        onChange={onTextFieldChange("login")}
                        onKeyDown={onKeyDown}
                        autoFocus={true}
                    />

                </Grid>
                <Grid
                    item
                >
                    <TextField
                        error={loginInfo.fail}
                        label="Password"
                        type="password"
                        value={loginInfo.password}
                        className={classes.textField}
                        onChange={onTextFieldChange("password")}
                        onKeyDown={onKeyDown}
                    />
                </Grid>
                <Grid
                    item
                >
                    <Button variant="contained" color="primary" onClick={onLogin}>
                        Login
                    </Button>
                </Grid>
                <Grid
                    item
                >
                    <Button color="inherit" onClick={openRegister}>
                        Register
                    </Button>
                </Grid>
                <Grid
                    item
                >
                    <Button color="inherit" onClick={openForgot}>
                        Forgot Password
                    </Button>
                </Grid>


            </Grid>
            <Snackbar open={loginInfo.fail}>
                <SnackbarContentWrapper
                    variant="error"
                    message="login failed, check credentials"
                    onClose={(event?: SyntheticEvent, reason?: string) => {
                        handleSnackbarClose("fail", event, reason);
                    }}
                />
            </Snackbar>

            <Snackbar open={loginInfo.server_fail}>
                <SnackbarContentWrapper
                    variant="error"
                    message="Server Error, contact administrators"
                    onClose={(event?: SyntheticEvent, reason?: string) => {
                        handleSnackbarClose("server_fail", event, reason);
                    }}
                />
            </Snackbar>
        </div>
    );
};