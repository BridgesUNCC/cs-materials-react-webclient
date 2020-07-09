import React, {FunctionComponent, SyntheticEvent} from "react";
import {createStyles, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {parseJwt, postJSONData} from "../../common/util";
import SnackbarContentWrapper from "../SnackbarContentWrapper";
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
    confirm_pass: string;
    name: string;
    duplicate: boolean;
    fail: boolean;
    server_fail: boolean;
    mail_error: boolean;
    pass_mismatch: boolean;
}

const createEmptyRegistration = (): RegistrationEntity => ({
    login: "",
    password: "",
    confirm_pass: "",
    name: "",
    duplicate: false,
    fail: false,
    server_fail: false,
    mail_error: false,
    pass_mismatch: false,
});

interface RegistrationProps {
    updateId: (id: number, fromStorage?: boolean, fromRegister?: boolean) => void;
    openLogin: () => void;
    handleDialogClose: () => void;
    setLoading: (loading: boolean) => void;
    apiURL: string;
}

export const Register: FunctionComponent<RegistrationProps> = ({updateId, openLogin, handleDialogClose, setLoading, apiURL}) => {
    const classes = useStyles();
    const [registrationInfo, setRegistrationInfo] = React.useState<RegistrationEntity>(
        createEmptyRegistration()
    );


    async function onRegister() {
        const url = apiURL + "/register";

        if (registrationInfo.password !== registrationInfo.confirm_pass) {
            setRegistrationInfo({...registrationInfo, 'pass_mismatch': true});
            return;
        }

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
                        updateId(payload.sub, false, true);
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

    const handleSnackbarClose =  (name: string, event?: SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setRegistrationInfo({...registrationInfo, [name]: false});
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
                        error={registrationInfo.fail || registrationInfo.pass_mismatch}
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
                        error={registrationInfo.fail || registrationInfo.pass_mismatch}
                        required
                        label="Confirm Password"
                        type="password"
                        value={registrationInfo.confirm_pass}
                        className={classes.textField}
                        onChange={onTextFieldChange("confirm_pass")}
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
            <Snackbar open={registrationInfo.fail}>
                <SnackbarContentWrapper
                    variant="error"
                    message="registration failed, email and password required"
                    onClose={(event?: SyntheticEvent, reason?: string) => {
                        handleSnackbarClose("fail", event, reason);
                    }}
                />
            </Snackbar>
            <Snackbar open={registrationInfo.duplicate}>
                <SnackbarContentWrapper
                    variant="error"
                    message="registration failed, email in use"
                    onClose={(event?: SyntheticEvent, reason?: string) => {
                        handleSnackbarClose("duplicate", event, reason);
                    }}
                />
            </Snackbar>
            <Snackbar open={registrationInfo.server_fail}>
                <SnackbarContentWrapper
                    variant="error"
                    message="Server Error, contact administrators"
                    onClose={(event?: SyntheticEvent, reason?: string) => {
                        handleSnackbarClose("server_fail", event, reason);
                    }}
                />
            </Snackbar>
            <Snackbar open={registrationInfo.mail_error}>
                <SnackbarContentWrapper
                    variant="error"
                    message="Email Error, unable to send confirmation email"
                    onClose={(event?: SyntheticEvent, reason?: string) => {
                        handleSnackbarClose("mail_error", event, reason);
                    }}
                />
            </Snackbar>
            <Snackbar open={registrationInfo.pass_mismatch}>
                <SnackbarContentWrapper
                    variant="error"
                    message="Passwords do not match"
                    onClose={(event?: SyntheticEvent, reason?: string) => {
                        handleSnackbarClose("pass_mismatch", event, reason);
                    }}
                />
            </Snackbar>
        </div>
    )
};