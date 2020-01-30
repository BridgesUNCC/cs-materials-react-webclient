import React, {FunctionComponent} from "react";
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {OntologyTree} from './OntologyTree'
import {OntologyData} from "../MaterialForm";
import {AppBar, createStyles, Divider, IconButton, Theme, Toolbar, Typography} from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import {makeStyles} from "@material-ui/core/styles";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        margin: {
            margin: theme.spacing(1),
        },
        extendedIcon: {
            marginRight: theme.spacing(1),
        },
        root: {
            flexGrow: 1,
        },
        appBar: {
            position: 'relative',
        },
        title: {
            marginLeft: theme.spacing(2),
            flex: 1,
        },
    }),
);


interface Props {
    open: boolean;
    title: string;
    onClose: () => void;
    api_url: string;
    tree_name: string;

}

export const TreeDialog: FunctionComponent<Props> = ({open, title, onClose, api_url, tree_name}) => {
    const classes = useStyles();

    return (
        <div>

            <Dialog
                open={open}
                onClose={onClose}
                fullScreen={true}
            >
                <AppBar className={classes.appBar}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6">
                        {title}
                    </Typography>
                </Toolbar>
                </AppBar>

                <OntologyTree api_url={api_url} tree_name={tree_name}/>


            </Dialog>
        </div>
    )
};