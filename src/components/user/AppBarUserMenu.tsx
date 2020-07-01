import React, {FunctionComponent} from 'react';
import Button from '@material-ui/core/Button';
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles, Theme} from "@material-ui/core";
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import {AppEntity} from "../../App";
import {RouteComponentProps} from "react-router";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        margin: {
            margin: theme.spacing(1),
        },
    })
);

interface Props extends RouteComponentProps {
    logout: () => void;
    appState: AppEntity
}

export const AppBarUserMenu: FunctionComponent<Props> = ({history, location, logout, appState}) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const classes = useStyles();


    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const toPath = (path: string) => {
        history.push(
            {
                pathname: path,
            }
        );
        handleClose();
    };

    return (
        <div>
            <Button onClick={handleClick} className={classes.margin}>
                <AccountCircleIcon/>
                {appState.user_data && appState.user_data.email}
            </Button>

            <Menu
                id="account-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={() => toPath("/my_materials")}>My materials</MenuItem>
                <MenuItem onClick={() => toPath("/material/create")}>Create material</MenuItem>
                <MenuItem onClick={logout}>Logout</MenuItem>
            </Menu>
        </div>
    )
};