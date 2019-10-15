import React, {FunctionComponent} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {Login} from "./Login";
import {Register} from "./Register";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles, Theme} from "@material-ui/core";
import {
    RouteComponentProps,
} from "react-router-dom";
import LinearProgress from "@material-ui/core/LinearProgress";
import {Forgot} from "./Forgot";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    margin: {
      margin: theme.spacing(1),
    },
    extendedIcon: {
      marginRight: theme.spacing(1),
    },
  }),
);

interface LoginProps extends RouteComponentProps {
    updateId: (id: number) => void;
}

interface RegisterLoginEntity {
    login: boolean;
    register: boolean;
    forgot: boolean;
    loading: boolean;
}

const createInitialEntity = (location: any, loading?: boolean): RegisterLoginEntity => {
    if (typeof location === "string") {
        return {
            login: location.endsWith("/login"),
            register: location.endsWith("/register"),
            forgot: location.endsWith("/forgot"),
            loading: loading || false
        };
    }
    return {
        login: false,
        register: false,
        forgot: false,
        loading: loading || false,
    };
};


export const LoginDialog: FunctionComponent<LoginProps> = ({history, location, updateId}) => {
    let [registerLogin, updateRegisterLogin] = React.useState(createInitialEntity(location.pathname));
    const classes = useStyles();
    registerLogin = createInitialEntity(location.pathname, registerLogin.loading);


    const handleLoginOpen = () => {
        let new_location = location.pathname.endsWith("/register") ? location.pathname.slice(0, -9) : location.pathname;
        new_location = new_location.endsWith("/forgot") ? new_location.slice(0, -7) : new_location;
        let prepend = new_location.endsWith("/") ? new_location.slice(0, -1) : new_location;
        history.push({
                pathname: prepend + '/login',
            }
        );
    };

    const handleRegisterOpen = () => {
        let new_location = location.pathname.endsWith("/login") ? location.pathname.slice(0, -6) : location.pathname;
        new_location = new_location.endsWith("/forgot") ? new_location.slice(0, -7) : new_location;
        let prepend = new_location.endsWith("/") ? new_location.slice(0, -1) : new_location;

        history.push({
                pathname: prepend + '/register',
            }
        );
    };

    const handleForgotOpen = () => {
        let new_location = location.pathname.endsWith("/login") ? location.pathname.slice(0, -6) : location.pathname;
        new_location = new_location.endsWith("/register") ? new_location.slice(0, -9) : new_location;
        let prepend = new_location.endsWith("/") ? new_location.slice(0, -1) : new_location;

        history.push({
                pathname: prepend + '/forgot',
            }
        );

    };

    const handleClose = () => {
        let new_location = location.pathname.endsWith("/login") ? location.pathname.slice(0, -6) : location.pathname;
        new_location = new_location.endsWith("/register") ? new_location.slice(0, -9) : new_location;
        new_location = new_location.endsWith("/forgot") ? new_location.slice(0, -7) : new_location;
        if (new_location.length === 0) {
            new_location = "/";
        }
            history.push({
                pathname: new_location,
            }
        );
    };

    const setLoading = (loading: boolean) => {
        console.log(loading);
        updateRegisterLogin(
            {
                ...registerLogin,
                'loading': loading
            }
        );
    };

    return (
        <div>
            <Button className={classes.margin} variant="text" color="inherit" onClick={handleRegisterOpen}>
                Register
            </Button>
            <Dialog
                open={registerLogin.register}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                {registerLogin.loading && <LinearProgress/>}
                <DialogTitle id="alert-dialog-title">{"Register"}</DialogTitle>
                <DialogContent>
                    <Register updateId={updateId}
                              openLogin={handleLoginOpen}
                              handleDialogClose={handleClose}
                              setLoading={setLoading}
                    />
                </DialogContent>
            </Dialog>


            <Button className={classes.margin} variant="contained" color="primary" onClick={handleLoginOpen}>
                Login
            </Button>
            <Dialog
                open={registerLogin.login}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                {registerLogin.loading && <LinearProgress/>}
                <DialogTitle id="alert-dialog-title">{"Login"}</DialogTitle>
                <DialogContent>
                    <Login updateId={updateId}
                           openRegister={handleRegisterOpen}
                           openForgot={handleForgotOpen}
                           handleDialogClose={handleClose}
                           setLoading={setLoading}
                    />
                </DialogContent>
            </Dialog>
            <Dialog
                open={registerLogin.forgot}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                {registerLogin.loading && <LinearProgress/>}
                <DialogTitle id="alert-dialog-title">{"Forgot Password"}</DialogTitle>
                <DialogContent>
                    <Forgot
                        updateId={updateId}
                        setLoading={setLoading}
                        openRegister={handleRegisterOpen}
                    />
                </DialogContent>
            </Dialog>
        </div>

    );
};