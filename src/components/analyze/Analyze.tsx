import React, {FunctionComponent} from "react";
import {createStyles, Theme} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {Link} from "react-router-dom";
import clsx from 'clsx';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import {ChevronRight, ChevronLeft} from "@material-ui/icons";
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import DashboardIcon from '@material-ui/icons/Dashboard';
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import Typography from '@material-ui/core/Typography';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
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
          // paddingTop: theme.spacing(4),
          paddingBottom: theme.spacing(4),
        },
        paper: {
          padding: theme.spacing(2),
          display: 'flex',
          overflow: 'auto',
          flexDirection: 'column',
        },
        fixedHeight: {
          height: 240,
        },
        ListSubheader: {
          marginRight: 50
        }
    }),
);

var compListOne: number[] = []
var compListTwo: number[] = []
var compLists: number[] = []


const drawerWidth = 300;

interface Props {
 info: number[],
 user_id: any,
 currentLoc: string,
 from: string,
}

export const Analyze: FunctionComponent<Props> = (
  {
    info,
    user_id,
    currentLoc,
    from,
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

    switch(currentLoc){
      case "materials":
        selectedIndex = 1;
        break;
      case "collection":
        selectedIndex = 2;
        break;
      case "compare":
        selectedIndex = 3;
        break;
      case "radial":
        selectedIndex = 4;
        break;
      case "radial":
        selectedIndex = 5;
        break;
      case "matrix":
        selectedIndex = 6;
        break;
    }

    if(from === "listOne"){
      compListOne = info
    }else if(from === "listTwo"){
      compListTwo = info
    }
    compLists = compListOne.concat(compListTwo)


    if(currentLoc === "compare"){
      var radialacm = <ListItem button onClick={() => setIndex(4)} selected={selectedIndex === 4} component={Link} to={'/radial?tree=acm&ids=' + compLists}>
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="Radial View ACM-CSC 2013" />
      </ListItem>
      var radialpdc = <ListItem button onClick={() => setIndex(5)} selected={selectedIndex === 5} component={Link} to={'/radial?tree=pdc&ids=' + compLists}>
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="Radial View PDC 2012" />
      </ListItem>
    }else{
      var radialacm = <ListItem button onClick={() => setIndex(4)} selected={selectedIndex === 4} component={Link} to={'/radial?tree=acm&ids=' + info}>
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="Radial View ACM-CSC 2013" />
      </ListItem>
      var radialpdc = <ListItem button onClick={() => setIndex(5)} selected={selectedIndex === 5} component={Link} to={'/radial?tree=pdc&ids=' + info}>
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="Radial View PDC 2012" />
      </ListItem>
    }

    return (
        <div className={classes.root}>
        <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>

        </AppBar>
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
                  handleDrawerClose();
              } else {
                  handleDrawerOpen();
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
          <ListSubheader inset className={classes.ListSubheader}>Analyzing</ListSubheader>
            <ListItem button onClick={() => setIndex(1)} selected={selectedIndex === 1} component={Link} to='/materials'>
              <ListItemIcon>
                <PlaylistAddIcon />
              </ListItemIcon>
              <ListItemText primary="Select Materials" />
            </ListItem>
            <ListItem button onClick={() => setIndex(2)} selected={selectedIndex === 2} component={Link} to='/materials?material_types=collection'>
              <ListItemIcon>
                <AccountTreeIcon />
              </ListItemIcon>
              <ListItemText primary="Select Collections" />
            </ListItem>
            <ListItem button onClick={() => setIndex(3)} selected={selectedIndex === 3} component={Link} to='/comparison'>
              <ListItemIcon>
                <AccountTreeIcon />
              </ListItemIcon>
              <ListItemText primary="Select Comparison" />
            </ListItem>
            {radialacm}
            {radialpdc}
            <ListItem button onClick={() => setIndex(6)} selected={selectedIndex === 6} component={Link} to={'/matrix?ids='+ (info.length === 0 ? -1 : info)}>
              <ListItemIcon>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Harmonization View" />
            </ListItem>
          </div></List>
          {(user_id !== null) ?
            <Divider />
            :
            <div></div>
          }
          <List><div>
          {(user_id !== null) ?
            <div>
            <ListSubheader inset className={classes.ListSubheader}>Authoring</ListSubheader>
            <ListItem button component={Link} to='/material/create'>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Create Materials" />
            </ListItem>
            <ListItem button component={Link} to='/materials_author'>
              <ListItemIcon>
                <AccountTreeIcon />
              </ListItemIcon>
              <ListItemText primary="Create Collections" />
            </ListItem>
            <ListItem button component={Link} to='/my_materials'>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="View My Materials" />
            </ListItem>
            </div>
            :
            <div>

            </div>
          }
          </div></List>
          <Divider />
          <List><div>
          <ListSubheader inset className={classes.ListSubheader}>Searching</ListSubheader>
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
