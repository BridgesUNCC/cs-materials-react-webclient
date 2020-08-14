import React, {FunctionComponent} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Link} from "react-router-dom";
import clsx from 'clsx';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import DashboardIcon from '@material-ui/icons/Dashboard';
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import {ChevronLeft, ChevronRight} from "@material-ui/icons";



const useStyles = makeStyles((theme) => ({
  root: {
      display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    // position: 'relative',
    marginTop: 52,
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(0),
    // paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 840,
  },
  ListSubheader: {
    marginRight: 50
  }
}));

const drawerWidth = 300;

interface Props {
 info: number[],
 currentLoc: string,
}


export const Author: FunctionComponent<Props> = (
  {
    info,
    currentLoc
  }
) => {
  const classes = useStyles();

  var [open, setOpen] = React.useState(true);
  var [selectedIndex, setIndex] = React.useState(0);

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  switch(currentLoc) {
    case "material_form":
      selectedIndex = 1;
      break;
    case "collection_form":
      selectedIndex = 2;
      break;
    case "my_materials":
      selectedIndex = 3;
      break;
    case "create_collection":
      selectedIndex = 4;
      break;
  }

  return (
      <div className={classes.root}>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={function(){
            if (open){
              open = false;
              setOpen(false);
            } else {
              open = true;
              setOpen(true);
            }
          }}>
            {
              open ?
                  <ChevronLeft/>
                  :
                  <ChevronRight/>
            }
          </IconButton>
        </div>
        <Divider />
        <List><div>
        <ListSubheader inset>Authoring</ListSubheader>
          <ListItem button onClick={() => setIndex(1)} selected={selectedIndex === 1} component={Link} to='/material/create'>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Create Materials" />
          </ListItem>
          <ListItem button onClick={() => setIndex(4)} selected={selectedIndex === 4} component={Link} to='/materials_author'>
            <ListItemIcon>
              <AccountTreeIcon />
            </ListItemIcon>
            <ListItemText primary="Create Collections" />
          </ListItem>
          <ListItem button onClick={() => setIndex(3)} selected={selectedIndex === 3} component={Link} to='/my_materials'>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="View My Materials" />
          </ListItem>
        </div></List>
        <Divider />
        <List><div>
        <ListSubheader inset className={classes.ListSubheader}>Analyzing</ListSubheader>
          <ListItem button component={Link} to='/materials'>
            <ListItemIcon>
              <PlaylistAddIcon />
            </ListItemIcon>
            <ListItemText primary="Select Materials" />
          </ListItem>
          <ListItem button component={Link} to='/materials?material_types=collection'>
            <ListItemIcon>
              <AccountTreeIcon />
            </ListItemIcon>
            <ListItemText primary="Select Collections" />
          </ListItem>
          <ListItem button component={Link} to={'/radial?tree=acm&ids=' + info}>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Radial View ACM-CSC 2013" />
          </ListItem>
          <ListItem button component={Link} to={'/radial?tree=pdc&ids=' + info}>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Radial View PDC 2012" />
          </ListItem>
          <ListItem button component={Link} to={'/matrix?ids='+ (info.length === 0 ? -1 : info)}>
            <ListItemIcon>
              <BarChartIcon />
            </ListItemIcon>
            <ListItemText primary="Harmonization View" />
          </ListItem>
        </div></List>
        <Divider />
        <List><div>
        <ListSubheader inset>Searching</ListSubheader>
        <ListItem button component={Link} to='/search'>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Search" />
        </ListItem>
        </div></List>
      </Drawer>
      </div>
  );
};
