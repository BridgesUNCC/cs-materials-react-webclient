import React, {FunctionComponent, SyntheticEvent} from "react";
import {createStyles, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {parseJwt, postJSONData, getJSONData} from "../../util/util";
import SnackbarContentWrapper from "../SnackbarContentWrapper";
import Snackbar from "@material-ui/core/Snackbar";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";


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


interface ResetEntity {
    password: string;
    confirm_pass: string;
    token_acquired: boolean;
    token_fetched: boolean
    token_acquire_fail: boolean;
    duplicate: boolean;
    fail: boolean;
    used: boolean
    server_fail: boolean;
    pass_mismatch: boolean;
    loading: boolean;
}

const createEmptyReset = (): ResetEntity => {
    return {
        password: "",
        confirm_pass: "",
        token_acquired: false,
        token_fetched: false,
        token_acquire_fail: false,
        duplicate: false,
        fail: false,
        used: false,
        server_fail: false,
        pass_mismatch: false,
        loading: false,
    };
};

interface RegistrationProps {
    openLogin: () => void;
    setCanClose: (flag: boolean) => void;
    setLoading: (loading: boolean) => void;
    authQuery: string;
    apiURL: string;
}

export const PasswordReset: FunctionComponent<RegistrationProps> = ({
                                                                        openLogin,
                                                                        setCanClose,
                                                                        authQuery,
                                                                        apiURL,
                                                                    }) => {
    const classes = useStyles();
    const [resetInfo, setResetInfo] = React.useState<ResetEntity>(
        createEmptyReset()
    );

    if (!resetInfo.token_acquired && !resetInfo.token_fetched) {
        setResetInfo({...resetInfo, token_fetched: true, loading: true});

        const url = apiURL + "/reset/token" + authQuery;

        let fail = true;
        let server_fail = false;
        let token_acquired = false;
        let used = false;
        let token_acquired_fail = true;
        getJSONData(url).then(resp => {
            console.log(resp);
            if (resp === undefined) {
                console.log("API SERVER ERROR");
                server_fail = true;
                fail = false;
                token_acquired_fail = true;
                return;
            }

            if (resp['status'] === "Invalid") {
                if (resp['reason'] === "bad token") {
                    fail = true;
                    used = false;
                    token_acquired_fail = true;
                } else {
                    fail = false;
                    used = true;
                    token_acquired_fail = true;
                }
            };

            const payload = parseJwt(resp['super_access_token']);
            if (payload !== null) {
                if (payload.sub !== null) {
                    localStorage.setItem("super_access_token", resp['super_access_token']);
                    fail = false;
                    server_fail = false;
                    token_acquired = true;
                    token_acquired_fail = false;
                }
            }
        }).finally(() => {
            console.log(fail);
            setCanClose(token_acquired_fail);
            setResetInfo({...resetInfo,
                fail: fail,
                used: used,
                server_fail: server_fail,
                token_acquired: token_acquired,
                token_acquire_fail: token_acquired_fail,
                loading: false,
                token_fetched: true,
            });
        });
    }

    async function onSubmit() {
        const url = apiURL + "/reset";

        if (resetInfo.password !== resetInfo.confirm_pass) {
            setResetInfo({...resetInfo, pass_mismatch: true});
            return;
        }

        // if empty, default to null
        const data = {
            "password": resetInfo.password === "" ? null : resetInfo.password,
        };
        const token = localStorage.getItem("super_access_token");

        // assume failure, to flash message
        let duplicate = true;
        let fail = true;
        let server_fail = false;
        let cancel = false;
        try {
            postJSONData(url, data, {"Authorization": "bearer " + token}).then(resp => {
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
                } else if(resp['status'] === "Mail Error") {
                    fail = false;
                    duplicate = false;
                }
                // TODO redirect to login on OK resp
                if (resp['status'] === "OK") {
                    openLogin();
                    cancel = true;
                }
            }).finally(() => {
                if (!cancel) {
                    setResetInfo({...resetInfo,
                        fail: fail,
                        server_fail: server_fail,
                        duplicate: duplicate,
                    });
                }
            });
        } catch (err) {
            console.log(err);
        }
    }

    const onUpdateResetField = (name: string, value: string) => {
        setResetInfo({
            ...resetInfo,
            [name]: value
        });
    };

    const onTextFieldChange = (fieldId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateResetField(fieldId, e.currentTarget.value);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
        if (event.key === 'Enter') {

            event.preventDefault();
            event.stopPropagation();
            onSubmit();
        }
    };

    const handleSnackbarClose =  (name: string, event?: SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setResetInfo({...resetInfo, [name]: false});
    };

    return (
        <div>
            {resetInfo.loading &&
                <CircularProgress/>
            }
            {resetInfo.token_acquired &&
            <Grid
                container
                direction="column"
                justify="flex-start"
            >
                <Grid
                    item
                >
                    <TextField
                        error={resetInfo.fail || resetInfo.pass_mismatch}
                        required
                        label="Password"
                        type="password"
                        value={resetInfo.password}
                        className={classes.textField}
                        onChange={onTextFieldChange("password")}
                        onKeyDown={onKeyDown}
                    />
                </Grid>
                <Grid
                    item
                >
                    <TextField
                        error={resetInfo.fail || resetInfo.pass_mismatch}
                        required
                        label="Confirm Password"
                        type="password"
                        value={resetInfo.confirm_pass}
                        className={classes.textField}
                        onChange={onTextFieldChange("confirm_pass")}
                        onKeyDown={onKeyDown}
                    />
                </Grid>
                <Grid
                    item
                >
                    <Button variant="contained" color="primary" onClick={onSubmit}>
                        Reset
                    </Button>
                </Grid>
            </Grid>
            }
            <Snackbar open={resetInfo.used}>
                <SnackbarContentWrapper
                    variant="error"
                    message="Reset token already used, request another password reset to reset again"
                    onClose={(event?: SyntheticEvent, reason?: string) => {
                        handleSnackbarClose("used", event, reason);
                    }}
                />
            </Snackbar>
            <Snackbar open={resetInfo.fail}>
                <SnackbarContentWrapper
                    variant="error"
                    message="Bad auth token, check url to make sure it is valid"
                    onClose={(event?: SyntheticEvent, reason?: string) => {
                        handleSnackbarClose("fail", event, reason);
                    }}
                />
            </Snackbar>
            <Snackbar open={resetInfo.server_fail}>
                <SnackbarContentWrapper
                    variant="error"
                    message="Server Error, contact administrators"
                    onClose={(event?: SyntheticEvent, reason?: string) => {
                        handleSnackbarClose("server_fail", event, reason);
                    }}
                />
            </Snackbar>
            <Snackbar open={resetInfo.pass_mismatch}>
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
}