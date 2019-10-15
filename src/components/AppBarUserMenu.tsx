import React, {FunctionComponent} from 'react';
import Button from '@material-ui/core/Button';
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles, Theme} from "@material-ui/core";
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import {AppState} from "../App";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        margin: {
            margin: theme.spacing(1),
        },
    })
);

interface Props {
    logout: () => void;
    appState: AppState
}

export const AppBarUserMenu: FunctionComponent<Props> = ({logout, appState}) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const classes = useStyles();


    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <Button onClick={handleClick} className={classes.margin}>
                <AccountCircleIcon/>
                {appState.userData && appState.userData.email}
            </Button>

            <Menu
                id="account-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
                <MenuItem onClick={logout}>Logout</MenuItem>
            </Menu>
        </div>
    )
};