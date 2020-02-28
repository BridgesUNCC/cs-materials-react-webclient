import React from "react";
import ListItem from "@material-ui/core/ListItem";
import {RouteComponentProps} from "react-router";
import ListItemText from "@material-ui/core/ListItemText";
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import { Omit } from '@material-ui/types';
import ListItemIcon from "@material-ui/core/ListItemIcon";
import {ListItemSecondaryAction} from "@material-ui/core";

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
  const { history, location, match, icon, primary, to, input } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef<HTMLAnchorElement, Omit<RouterLinkProps, 'innerRef' | 'to'>>(
        (itemProps, ref) => (
          // With react-router-dom@^6.0.0 use `ref` instead of `innerRef`
          // See https://github.com/ReactTraining/react-router/issues/6056
          <RouterLink to={to} {...itemProps} innerRef={ref} />
        ),
      ),
    [to],
  );

  const routeChange = () => {
      history.push(to);
  };

    // <ListItem button component={renderLink}>
    return (
        <li>
            <ListItem button onClick={routeChange}>
            {input ? <ListItemSecondaryAction>{input}</ListItemSecondaryAction> : null}
            {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
                <ListItemText primary={primary} />
                </ListItem>
                </li>
  );
}
