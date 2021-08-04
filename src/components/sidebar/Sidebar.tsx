import React, {FunctionComponent} from "react";
import { useEffect } from 'react';
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
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';



const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            paddingRight: 100,
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
          //marginTop: 52,
          paddingTop: 52,
          zIndex: 10,
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
        },
        nested: {
          paddingLeft: theme.spacing(4),
        },

    }),
);

let compListOne: number[] = [];
let compListTwo: number[] = [];


const drawerWidth = 300;

interface Props {
 listOne: number[],
 compareListOne: number[],
 listTwo: number[],
 user_id: any,
 user_data: any,
 currentLoc: string,
 from: string,
}

export const Sidebar: FunctionComponent<Props> = (
  {
    listOne,
    compareListOne,
    listTwo,
    user_id,
    user_data,
    currentLoc,
    from,
  }
) => {

    const classes = useStyles();
    let [open, setOpen] = React.useState(true);
    let [selectedIndex, setIndex] = React.useState(0);
    const handleDrawerOpen = () => {
      setOpen(true);
    };
    const handleDrawerClose = () => {
      setOpen(false);
    };

    const [comparisonOpen, setComparisonOpen] = React.useState(true);
    const handleClick = () => {
      setComparisonOpen(!comparisonOpen);
    };

    const handleSelection = (selection: any) => {
      compListOne.push(selection);
    }

    const [materialOpen, setMaterialOpen] = React.useState(true);
    const handleMaterialListClick = () => {
      setMaterialOpen(!materialOpen);
    };


    // useEffect(() => {
    //     console.log("hello")
    //     return () => {
    //         console.log("hello")
    //     }
    // }, [])


    if (from === "listOne") {
      compListOne = listOne
    }
    if (from === "listTwo") {
      compListTwo = listTwo
    }
    let radialacm;
    let radialpdc;

    if (currentLoc === "compare") {
        radialacm = <ListItem button onClick={() => setIndex(4)} selected={selectedIndex === 4} component={Link} to={'/radial?tree=acm&listoneids=' + compListOne + '&listtwoids=' + compListTwo}>
            <ListItemIcon>
                <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Radial View ACM-CSC 2013" />
        </ListItem>
        radialpdc = <ListItem button onClick={() => setIndex(5)} selected={selectedIndex === 5} component={Link} to={'/radial?tree=pdc&listoneids=' + compListOne + '&listtwoids=' + compListTwo}>
            <ListItemIcon>
                <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Radial View PDC 2012" />
        </ListItem>
    } else {
        radialacm = <ListItem className={classes.nested} button onClick={() => setIndex(4)} selected={selectedIndex === 4} component={Link} to={'/radial?tree=acm&ids=' + listOne}>
            <ListItemIcon>
                <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Radial View ACM-CSC 2013" />
        </ListItem>
        radialpdc = <ListItem className={classes.nested} button onClick={() => setIndex(5)} selected={selectedIndex === 5} component={Link} to={'/radial?tree=pdc&ids=' + listOne}>
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
            <ListItem button onClick={() => {handleMaterialListClick()}} selected={selectedIndex === 1}>
              <ListItemIcon>
                <PlaylistAddIcon />
              </ListItemIcon>
              <ListItemText primary="Material Views" />
              {materialOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
              <Collapse in={materialOpen} timeout="auto" unmountOnExit>
                <List>
                  <ListItem button onClick={() => setIndex(1)} className={classes.nested} selected={selectedIndex === 1} component={Link} to='/materials'>
                    <ListItemIcon>
                      <PlaylistAddIcon />
                    </ListItemIcon>
                    <ListItemText primary="Select Materials" />
                  </ListItem>
                  <ListItem button onClick={() => setIndex(2)} className={classes.nested} selected={selectedIndex === 2} component={Link} to='/materials?material_types=collection'>
                    <ListItemIcon>
                      <AccountTreeIcon />
                    </ListItemIcon>
                    <ListItemText primary="Select Collections" />
                  </ListItem>
                  {radialacm}
                  {radialpdc}

                  <ListItem className={classes.nested} button onClick={() => setIndex(6)} selected={selectedIndex === 6} component={Link} to={'/matrix?ids='+ listOne}>
                    <ListItemIcon>
                      <BarChartIcon />
                    </ListItemIcon>
                    <ListItemText primary="Harmonization View" />
                  </ListItem>

                </List>
              </Collapse>
            <ListItem button onClick={() => {handleClick()}}>
              <ListItemIcon>
                <AccountTreeIcon />
              </ListItemIcon>
              <ListItemText primary="Comparison" />
              {comparisonOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={comparisonOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                  <ListItem className={classes.nested} button onClick={() => {setIndex(3)}} selected={selectedIndex === 3} component={Link} to='/comparison'>
                    <ListItemIcon>
                      <AccountTreeIcon />
                    </ListItemIcon>
                    <ListItemText primary="Select Comparison" />
                  </ListItem>
                  <ListItem className={classes.nested} button onClick={() => setIndex(4)} selected={selectedIndex === 4} component={Link} to={'/radial?tree=acm&listoneids=' + compareListOne + '&listtwoids=' + listTwo}>
                    <ListItemIcon>
                        <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Radial Comparison View" />
                  </ListItem>
              </List>
            </Collapse>





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
            <ListItem button onClick={() => setIndex(7)} selected={selectedIndex === 7} component={Link} to='/material/create'>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Create Materials" />
            </ListItem>
            <ListItem button onClick={() => setIndex(8)} selected={selectedIndex === 8} component={Link} to='/materials_author'>
              <ListItemIcon>
                <AccountTreeIcon />
              </ListItemIcon>
              <ListItemText primary="Create Collections" />
            </ListItem>
            <ListItem button onClick={() => setIndex(9)} selected={selectedIndex === 9} component={Link} to='/my_materials'>
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
          <ListItem button onClick={() => setIndex(10)} selected={selectedIndex === 10} component={Link} to='/search'>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Search" />
          </ListItem>

          {(false)?
          <ListItem button onClick={() => setIndex(7)} selected={selectedIndex === 7} component={Link} to={'/searchrelation?k=20&matID=1'}>
            <ListItemIcon>
              <BarChartIcon />
            </ListItemIcon>
            <ListItemText primary="Similarity" />
          </ListItem>
          :
          <div></div>}

          </div>
          </List>

        </Drawer>
        </div>
    );
};