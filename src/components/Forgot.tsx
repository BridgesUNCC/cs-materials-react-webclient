import React, {FunctionComponent, SyntheticEvent} from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import {postJSONData, parseJwt} from "../util/util";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContentWrapper from "./SnackbarContentWrapper";
import Grid from "@material-ui/core/Grid";


interface ForgotEntity {
    email: string;
    fail: boolean;
    server_fail: boolean;
}

const createEmptyForgot = (): ForgotEntity => ({
    email: "",
    fail: false,
    server_fail: false,
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
}

export const Forgot: FunctionComponent<ForgotProps> = ({updateId, setLoading}) => {

    const classes = useStyles();
    const [forgotInfo, setForgotInfo] = React.useState<ForgotEntity>(
        createEmptyForgot()
    );


    async function onSubmit() {
        const url = "http://localhost:5000/forgot";

        const data = {"email": forgotInfo.email};

        setLoading(true);

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

    const handleFailClose =  (event?: SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setForgotInfo({...forgotInfo, 'fail': false});
    };

    const handleServerFailClose =  (event?: SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setForgotInfo({...forgotInfo, 'server_fail': false});
    };


    return (
        <div>

        </div>
    );
};


