import React, {FunctionComponent,} from "react";
import Dialog from '@material-ui/core/Dialog';
import {OntologyTree} from './OntologyTree'
import {TagData} from "../MaterialForm";
import {AppBar, createStyles, Divider, fade, IconButton, Theme, Toolbar, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import CheckIcon from '@material-ui/icons/Check';
import {DelayedSearch} from "./DelayedInput";


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
        searchIcon: {
            width: theme.spacing(7),
            height: '100%',
            position: 'absolute',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        inputRoot: {
            color: 'inherit',
        },
        search: {
            position: 'relative',
            borderRadius: theme.shape.borderRadius,
            backgroundColor: fade(theme.palette.common.white, 0.15),
            '&:hover': {
                backgroundColor: fade(theme.palette.common.white, 0.25),
            },
            marginRight: theme.spacing(2),
            marginLeft: 0,
            width: '100%',
            [theme.breakpoints.up('sm')]: {
                marginLeft: theme.spacing(3),
                width: 'auto',
            },
        },

        inputInput: {
            padding: theme.spacing(1, 1, 1, 7),
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.up('md')]: {
                width: 200,
            },
        },

    }),
);


interface Props {
    open: boolean;
    title: string;
    onClose: () => void;
    api_url: string;
    tree_name: string;
    selected_tags: TagData[];
    onCheck: (event: React.ChangeEvent<HTMLInputElement>, id: number) => void;
}

interface State {
    search_term: string;
}

const createEmptyInfo = (): State => {
    return {
        search_term: ""
    }
};

export const TreeDialog: FunctionComponent<Props> = ({open, title, onClose, api_url, tree_name, selected_tags, onCheck}) => {
    const classes = useStyles();
    const [viewInfo, setViewInfo] = React.useState(
        createEmptyInfo()
    );



    const onTextFieldChange = (field_id: string) => (e: React.ChangeEvent<HTMLInputElement>): void => {
        let fields = viewInfo;
        // @TODO @FIXME Add timeout to prevent state update if user is still writing search term
        fields = {...fields, [field_id]: e.currentTarget.value};
        setViewInfo(fields);
    };

    const onDelayedChange = (value: string) => {
        setViewInfo({search_term: value})
    };

    const localOnClose = () => {
        setViewInfo(createEmptyInfo());
        onClose();
    };

    return (
        <div>

            <Dialog
                open={open}
                onClose={localOnClose}
                fullScreen={true}
            >
                <AppBar className={classes.appBar}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                        <CheckIcon/>
                    </IconButton>
                    <Typography variant="h6">
                        {title}
                    </Typography>
                    <DelayedSearch onChange={onDelayedChange} delay={200}/>

                </Toolbar>
                </AppBar>

                <OntologyTree api_url={api_url} tree_name={tree_name} selected_tags={selected_tags} onCheck={onCheck}
                              search_term={viewInfo.search_term}/>

            </Dialog>
        </div>
    )
};