import React, {FunctionComponent, SyntheticEvent} from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import {postJSONData} from "../../common/util";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContentWrapper from "../../common/SnackbarContentWrapper";
import Grid from "@material-ui/core/Grid";


interface ForgotEntity {
    email: string;
    fail: boolean;
    server_fail: boolean;
    ok: boolean;
}

const createEmptyForgot = (): ForgotEntity => ({
    email: "",
    fail: false,
    server_fail: false,
    ok: false,
});


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

interface ForgotProps {
    updateId: (id: number) => void;
    setLoading: (loading: boolean) => void;
    openRegister: () => void;
    apiURL: string;
}

export const Forgot: FunctionComponent<ForgotProps> = ({updateId, setLoading, openRegister, apiURL}) => {

    const classes = useStyles();
    const [forgotInfo, setForgotInfo] = React.useState<ForgotEntity>(
        createEmptyForgot()
    );


    async function onSubmit() {
        const url = apiURL + "/forgot";

        const data = {"email": forgotInfo.email};

        setLoading(true);

        let fail = true;
        let server_fail = false;
        let cancel = false;
        let ok = false;
        try {
            postJSONData(url, data).then(resp => {
                console.log(resp);
                if (resp === undefined) {
                    console.log("API SERVER ERROR");
                    fail = false;
                    server_fail = true;
                    return;
                }
                if (resp['status'] === "OK") {
                    fail = false;
                    server_fail = false;
                    ok = true;
                }
            }).finally(() => {
                if (!cancel) {
                    setLoading(false);
                    setForgotInfo({...forgotInfo, 'fail': fail, 'server_fail': server_fail, 'ok': ok});
                }
            });
        } catch (err) {
            console.log(err);
        }
    }




    const onUpdateForgotField = (name: string, value: string) => {
        setForgotInfo({
            ...forgotInfo,
            [name]: value
        });
    };

    const onTextFieldChange = (fieldId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateForgotField(fieldId, e.currentTarget.value);
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

        setForgotInfo({...forgotInfo, [name]: false});
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
                        error={forgotInfo.fail}
                        label="Email"
                        value={forgotInfo.email}
                        className={classes.textField}
                        onChange={onTextFieldChange("email")}
                        onKeyDown={onKeyDown}
                        autoFocus={true}
                    />

                </Grid>
                <Grid
                    item
                >
                    <Button variant="contained" color="primary" onClick={onSubmit}>
                        Send
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
                </Grid>


            </Grid>
            <Snackbar open={forgotInfo.fail}>
                <SnackbarContentWrapper
                    variant="error"
                    message="Unable to send reset email, may be an invalid email or not linked to any account."
                    onClose={(event?: SyntheticEvent, reason?: string) => {
                        handleSnackbarClose("fail", event, reason);
                    }}
                />
            </Snackbar>

            <Snackbar open={forgotInfo.server_fail}>
                <SnackbarContentWrapper
                    variant="error"
                    message="Server Error, contact administrators"
                    onClose={(event?: SyntheticEvent, reason?: string) => {
                        handleSnackbarClose("server_fail", event, reason);
                    }}
                />
            </Snackbar>
            <Snackbar open={forgotInfo.ok}>
                <SnackbarContentWrapper
                    variant="success"
                    message="Reset Email sent"
                    onClose={(event?: SyntheticEvent, reason?: string) => {
                        handleSnackbarClose("ok", event, reason);
                    }}
                />
            </Snackbar>
        </div>
    );
};


