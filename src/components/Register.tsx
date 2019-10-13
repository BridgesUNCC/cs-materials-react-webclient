import React, {FunctionComponent, SyntheticEvent} from "react";
import {createStyles, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {parseJwt, postData} from "../util/util";
import SnackbarContentWrapper from "./SnackbarContentWrapper";
import Snackbar from "@material-ui/core/Snackbar";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";


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


interface RegistrationEntity {
    login: string;
    password: string;
    name: string;
    duplicate: boolean;
    fail: boolean;
    server_fail: boolean;
}

const createEmptyRegistration = (): RegistrationEntity => ({
    login: "",
    password: "",
    name: "",
    duplicate: false,
    fail: false,
    server_fail: false,
});

interface RegistrationProps {
    updateId: (id: number) => void;
    openLogin: () => void;
}

export const Register: FunctionComponent<RegistrationProps> = ({updateId, openLogin}) => {
    const classes = useStyles();
    const [registrationInfo, setRegistrationInfo] = React.useState<RegistrationEntity>(
        createEmptyRegistration()
    );


    async function onRegister() {
        // @FIXME replace with production url
        const url = "http://localhost:5000/register";


        // if empty, default to null
        const data = {
            "email": registrationInfo.login === "" ? null: registrationInfo.login,
            "password": registrationInfo.password === "" ? null : registrationInfo.password,
            "name": registrationInfo.name === "" ? null : registrationInfo.name,
        };

        // assume failure, to flash message
        let duplicate = true;
        let fail = true;
        let server_fail = false;
        let cancel = false;
        try {
            postData(url, data).then(resp => {
                console.log(resp);
                if (resp === undefined) {
                    console.log("API SERVER ERROR");
                    fail = false;
                    duplicate = false;
                    server_fail = true;
                    return;
                }
                if (resp['status'] === "Invalid") {
                    fail = true;
                    duplicate = false;
                } else if(resp['status'] === "Duplicate") {
                    fail = false;
                    duplicate = true;
                }
                setRegistrationInfo({...registrationInfo, 'server_fail': false});
                const payload = parseJwt(resp['token']);
                if (payload !== null) {
                    if (payload.sub !== null) {
                        localStorage.setItem("jwt", resp['token']);
                        updateId(payload.sub);
                        // cancel state update, as component is going to unmount
                        cancel = true;
                    }
                }
            }).finally(() => {
                if (!cancel) {
                    setRegistrationInfo({...registrationInfo,
                        'fail': fail,
                        'server_fail': server_fail,
                        'duplicate': duplicate});
                }
            });
        } catch (err) {
            console.log(err);
        }
    }

    const onUpdateRegistartionField = (name: string, value: string) => {
        setRegistrationInfo({
            ...registrationInfo,
            [name]: value
        });
    };

    const onTextFieldChange = (fieldId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateRegistartionField(fieldId, e.currentTarget.value);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
        if (event.key === 'Enter') {

            event.preventDefault();
            event.stopPropagation();
            onRegister();
        }
    };

    const handleFailClose =  (event?: SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setRegistrationInfo({...registrationInfo, 'fail': false});
    };

    const handleDuplicateClose =  (event?: SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setRegistrationInfo({...registrationInfo, 'duplicate': false});
    };

    const handleServerFailClose =  (event?: SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setRegistrationInfo({...registrationInfo, 'server_fail': false});
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
                        error={registrationInfo.duplicate || registrationInfo.fail}
                        required
                        label="Email"
                        value={registrationInfo.login}
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
                        error={registrationInfo.fail}
                        required
                        label="Password"
                        type="password"
                        value={registrationInfo.password}
                        className={classes.textField}
                        onChange={onTextFieldChange("password")}
                        onKeyDown={onKeyDown}
                    />
                </Grid>
                <Grid
                    item
                >
                    <TextField
                        label="Display Name"
                        value={registrationInfo.name}
                        className={classes.textField}
                        onChange={onTextFieldChange("name")}
                        onKeyDown={onKeyDown}
                    />
                </Grid>

                <Grid
                    item
                >
                    <Button variant="contained" color="primary" onClick={onRegister}>
                        Register
                    </Button>
                </Grid>
            </Grid>
            <Button color="inherit" onClick={openLogin}>
                Have an Account? login
            </Button>
            <Snackbar open={registrationInfo.fail && !registrationInfo.server_fail}>
                <SnackbarContentWrapper
                    open={registrationInfo.fail}
                    variant="error"
                    message="registration failed, email and password required"
                    onClose={handleFailClose}
                />
            </Snackbar>
            <Snackbar open={registrationInfo.duplicate}>
                <SnackbarContentWrapper
                    open={registrationInfo.duplicate}
                    variant="error"
                    message="registration failed, email in use"
                    onClose={handleDuplicateClose}
                />
            </Snackbar>
            <Snackbar open={registrationInfo.server_fail}>
                <SnackbarContentWrapper
                    open={registrationInfo.server_fail}
                    variant="error"
                    message="Server Error, contact administrators"
                    onClose={handleServerFailClose}
                />
            </Snackbar>
        </div>
    )
};