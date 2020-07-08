import React from "react";
import ListItem from "@material-ui/core/ListItem";
import {RouteComponentProps} from "react-router";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import {ListItemSecondaryAction} from "@material-ui/core";
import {Link} from "react-router-dom";

interface MatchParams {
    id: string;
}

interface ListItemLinkProps extends RouteComponentProps<MatchParams> {
  icon?: React.ReactElement;
  input?: React.ReactElement;
  primary: string;
  to: string;
}

/**
 * src: https://github.com/mui-org/material-ui/blob/master/docs/src/pages/guides/composition/ListRouter.tsx
 */
export function ListItemLink(props: ListItemLinkProps) {
    const { icon, primary, to, input } = props;

    return (
        <ListItem button component={Link} to={to}>
            {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
            <ListItemText primary={primary} />
            {input ? <ListItemSecondaryAction>{input}</ListItemSecondaryAction> : null}
        </ListItem>
    );
}
