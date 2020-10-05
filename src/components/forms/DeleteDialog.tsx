import React, {FunctionComponent} from "react";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles, TextField, Theme} from "@material-ui/core";
import LinearProgress from "@material-ui/core/LinearProgress";
import Grid from "@material-ui/core/Grid";
import {postJSONData} from "../../common/util";
import DeleteIcon from '@material-ui/icons/Delete';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        margin: {
            margin: theme.spacing(2),
        },
        extendedIcon: {
            marginRight: theme.spacing(1),
        },
        textField: {
            margin: theme.spacing(2),
            width: 200,
        },
    }),
);

interface DeleteProps {
    id: number;
    name: string;
    api_url: string;
    on_success: () => void;
    endpoint: string;
}

interface DeleteEntity {
    confirm_text: string;
    open: boolean;
    loading: boolean;
    error_mismatch: boolean;
    error_submitting: boolean;
}

const createInitialEntity = (): DeleteEntity => {
    return {
        confirm_text: "",
        open: false,
        loading: false,
        error_mismatch: false,
        error_submitting: false,

    };
};

export const DeleteDialog: FunctionComponent<DeleteProps> = ({
    id,
    name,
    api_url,
    on_success,
    endpoint,
}) => {
    let [deleteInfo, updateDeleteInfo] = React.useState(createInitialEntity());
    const classes = useStyles();

    async function submit() {
        updateDeleteInfo({...deleteInfo, loading: true});
        const url = api_url + endpoint;
        let data = {"data": {"id": id}};
        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        postJSONData(url, data, auth).then(resp =>{
              if (resp === undefined) {
               console.log("API SERVER FAIL")
              } else {
                  if (resp['status'] === "OK") {
                      // do confirm of delete
                      console.log("Deleted")
                      on_success();
                  } else {
                      updateDeleteInfo({...deleteInfo, loading: false, error_submitting: true});
                  }
              }
        });
    }

    const validateAndSubmit = () => {
        if (name === deleteInfo.confirm_text) {
            submit();
        } else {
            updateDeleteInfo({...deleteInfo, error_mismatch: true})
        }
    };


    const onTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateDeleteInfo({...deleteInfo, error_mismatch: false, confirm_text: e.currentTarget.value});
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
        if (event.key === 'Enter') {

            event.preventDefault();
            event.stopPropagation();
            validateAndSubmit();
        }
    };

    const handleOpenClose = () => {
      updateDeleteInfo({...deleteInfo, open: !deleteInfo.open});
    };

    return (
        <div>
            <Button className={classes.margin} variant={"contained"} color={"secondary"} startIcon={<DeleteIcon/>} onClick={handleOpenClose}>
                Delete {name}
            </Button>
            <Dialog open={deleteInfo.open} onClose={handleOpenClose}

                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
            >
                {deleteInfo.loading && <LinearProgress/>}
                <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
                <DialogContent>
                    <Grid
                        container
                        direction="column"
                        justify="flex-start"
                    >
                        <Grid item>
                            This deletion may be <b>irreversible</b>
                            <br/>
                            Please type <b>{name}</b> to confirm
                        </Grid>

                        <Grid item>
                            <TextField
                                required
                                error={deleteInfo.error_mismatch}
                                autoFocus={true}
                                onKeyDown={onKeyDown}
                                onChange={onTextFieldChange}
                                className={classes.textField}

                            />
                        </Grid>

                        <Grid item>
                            <Button variant="contained" color="secondary" onClick={validateAndSubmit} startIcon={<DeleteIcon/>}>
                                Delete {name}
                            </Button>
                        </Grid>
                    </Grid>

                </DialogContent>
            </Dialog>
        </div>
    );
};