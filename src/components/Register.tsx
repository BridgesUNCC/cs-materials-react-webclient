import React, {FunctionComponent, SyntheticEvent} from "react";
import {createStyles, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {parseJwt, postJSONData} from "../util/util";
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
    mail_error: boolean;
}

const createEmptyRegistration = (): RegistrationEntity => ({
    login: "",
    password: "",
    name: "",
    duplicate: false,
    fail: false,
    server_fail: false,
    mail_error: false,
});

interface RegistrationProps {
    updateId: (id: number) => void;
    openLogin: () => void;
    handleDialogClose: () => void;
    setLoading: (loading: boolean) => void;
}

export const Register: FunctionComponent<RegistrationProps> = ({updateId, openLogin, handleDialogClose, setLoading}) => {
    const classes = useStyles();
    const [registrationInfo, setRegistrationInfo] = React.useState<RegistrationEntity>(
        createEmptyRegistration()
    );


    async function onRegister() {
        // @FIXME replace with production url
        const url = "http://localhost:5000/register";

        setLoading(true);
        // if empty, default to null
        const data = {
            "email": registrationInfo.login === "" ? null: registrationInfo.login,
            "password": registrationInfo.password === "" ? null : registrationInfo.password,
            "name": registrationInfo.name === "" ? null : registrationInfo.name,
        };

        // assume failure, to flash message
        let duplicate = true;
        let fail = true;
        let mail_error = true;
        let server_fail = false;
        let cancel = false;
        try {
            postJSONData(url, data).then(resp => {
                console.log(resp);
                if (resp === undefined) {
                    console.log("API SERVER ERROR");
                    fail = false;
                    duplicate = false;
                    mail_error = false;
                    server_fail = true;
                    return;
                }
                if (resp['status'] === "Invalid") {
                    fail = true;
                    duplicate = false;
                    mail_error = false;
                } else if(resp['status'] === "Duplicate") {
                    fail = false;
                    duplicate = true;
                    mail_error = false;
                } else if(resp['status'] === "Mail Error") {
                    fail = false;
                    duplicate = false;
                    mail_error = true;
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
                    setRegistrationInfo({...registrationInfo,
                        'fail': fail,
                        'server_fail': server_fail,
                        'duplicate': duplicate,
                        'mail_error': mail_error,
                    });
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
            <Snackbar open={registrationInfo.mail_error}>
                <SnackbarContentWrapper
                    open={registrationInfo.mail_error}
                    variant="error"
                    message="Email Error, unable to send confirmation email"
                    onClose={handleServerFailClose}
                />
            </Snackbar>
        </div>
    )
};