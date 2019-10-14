import React, {FunctionComponent, SyntheticEvent} from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import {postData, parseJwt} from "../util/util";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
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
    openRegister: () => void;
    handleDialogClose: () => void;
    setLoading: (loading: boolean) => void;
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



export const Login: FunctionComponent<LoginProps> = ({updateId, openRegister, handleDialogClose, setLoading}) => {
    const classes = useStyles();
    const [loginInfo, setLoginInfo] = React.useState<LoginEntity>(
        createEmptyLogin()
    );

    async function onLogin() {
        // @FIXME replace with production url
        const url = "http://localhost:5000/login";

        const data = {"email": loginInfo.login, "password": loginInfo.password};


        setLoading(true);
        // assume failure, to flash message
        let fail = true;
        let server_fail = false;
        let cancel = false;
        try {
            postData(url, data).then(resp => {
                console.log(resp);
                if (resp === undefined) {
                    console.log("API SERVER ERROR");
                    fail = false;
                    server_fail = true;
                    return;
                }
                setLoginInfo({...loginInfo, 'server_fail': false});
                const payload = parseJwt(resp['auth_token']);
                if (payload !== null) {
                    if (payload.sub !== null) {
                        localStorage.setItem("auth_token", resp['auth_token']);
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
                    error={loginInfo.fail}
                    label="Email"
                    value={loginInfo.login}
                    className={classes.textField}
                    onChange={onTextFieldChange("login")}
                    onKeyDown={onKeyDown}
                    autoFocus={true}
                />
                <TextField
                    error={loginInfo.fail}
                    label="Password"
                    type="password"
                    value={loginInfo.password}
                    className={classes.textField}
                    onChange={onTextFieldChange("password")}
                    onKeyDown={onKeyDown}
                />


                <Button variant="contained" color="primary" onClick={onLogin}>
                    Login
                </Button>
            </form>
            <Button color="inherit" onClick={openRegister}>
                Register
            </Button>
            <Snackbar open={loginInfo.fail && !loginInfo.server_fail}>
                <SnackbarContentWrapper
                    open={loginInfo.fail}
                    variant="error"
                    message="login failed, check credentials"
                    onClose={handleFailClose}
                />
            </Snackbar>

            <Snackbar open={loginInfo.server_fail}>
                <SnackbarContentWrapper
                    open={loginInfo.server_fail}
                    variant="error"
                    message="Server Error, contact administrators"
                    onClose={handleServerFailClose}
                />
            </Snackbar>
        </div>
    );
};