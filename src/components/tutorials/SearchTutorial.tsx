/* eslint-disable */  
import React, {FunctionComponent} from "react";
import {Grid} from "@material-ui/core";
import {RouteComponentProps} from "react-router";
import { makeStyles, Theme } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import {Link} from "react-router-dom";

import '../../App.css'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  media: {
    height: 140,
  },
  frame: {
    paddingTop: 0,
    marginBottom: '5%',
    width: '100%',
    height: '700px',
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  body:{
    paddingTop: 50,
    textAlign: 'left',
    marginLeft: '200px',
    marginRight: '200px',
    fontSize: '20px',
  },
  heading:{
    paddingTop: 80,
    textAlign: 'left',
    marginLeft: '150px',
  },
  subHeading:{
    paddingTop: 80,
    textAlign: 'left',
    marginLeft: '200px',
    marginRight: '200px',
  },
}));

export const SearchTutorial: FunctionComponent = ({ }) => {

    const classes = useStyles();

    return (
      <div className={classes.root}>
        <Typography variant="h2" className={classes.heading}>
          Getting Started
        </Typography>
        <Typography variant="body1" className={classes.body} gutterBottom>
        First, you will need to click the 'BEGIN' button on the right section of the
        home page titled 'Search'. This section of the website is where you can query for materials
        related to tags, keywords, ACM/PDC learning outcomes, knowledge units, or knowledge areas.
        </Typography>
        <img src={require('../../common/images/searchtut_1.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body} gutterBottom>
          Once you have clicked the 'Begin' button on the search section of the homepage,
          you will be brought to a screen with a keywords and tags section, along with buttons
          to view the ACM and PDC hierarchy. Searching by keywords will match with words from material's
          titles and descriptions. Searching by tags will match with materials of the same tags, example: arrays, for loops.
          You can click on 'ACM CSC 2013' or 'PDC 2012' to view the knowledge areas, knowledge units, and learning outcomes.
        </Typography>
        <img src={require('../../common/images/searchtut_2.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body} gutterBottom>
          Clicking any entries box will mark that topic as a search parameter for finding materials that match to those same topics.
          The marked topics will be appended to the tags used to search within the database.
          Once finished marking desired topics, you can hit the back button to return to the main search page.
        </Typography>
        <img src={require('../../common/images/searchtut_3.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body} gutterBottom>
          To finish, after all keywords, tags, and ACM/PDC topics are selected, you can click 'search' to be directed to a page with a list
          of the resulting materials.
        </Typography>
        <img src={require('../../common/images/searchtut_4.PNG')} alt="Italian Trulli"></img>
        <img src={require('../../common/images/searchtut_5.PNG')} alt="Italian Trulli"></img>
      </div>

    )
};
