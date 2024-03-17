import React, {FunctionComponent} from "react";
import {createStyles, InputBase, Theme} from "@material-ui/core";
import {alpha} from "@material-ui/core/styles";

import SearchIcon from '@material-ui/icons/Search';
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
            backgroundColor: alpha(theme.palette.common.white, 0.15),
            '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.25),
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
    onChange: (value: string) => void;
    delay: number
}

interface InputInfo {
    value: string;
    timeout: number | null;
}

const defaultInfo = (): InputInfo =>  {
    return {
        value: "",
        timeout: null,
    }
};

export const DelayedSearch: FunctionComponent<Props>=  ({onChange, delay}) => {
    const [formInfo, setFormInfo] = React.useState(defaultInfo());
    const classes = useStyles();

    const onTextFieldChange = (field_id: string) => (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (formInfo.timeout !== null)
            clearTimeout(formInfo.timeout);

        let new_value = e.currentTarget.value;
        let timer = setTimeout(() => triggerChange(new_value), delay);

        // @ts-ignore
        setFormInfo({value: new_value, timeout: timer});
    };


    const triggerChange = (value: string) => {
        console.log(value);
        onChange(value);
    };

    return (
        <div className={classes.search}>
            <div className={classes.searchIcon}>
                <SearchIcon />
            </div>
            <InputBase
                placeholder="Search…"
                classes={{
                    root: classes.inputRoot,
                    input: classes.inputInput,
                }}
                inputProps={{ 'aria-label': 'search' }}
                onChange={onTextFieldChange("value")}
            />
        </div>
    )
};