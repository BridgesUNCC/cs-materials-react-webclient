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

export const AuthorTutorial: FunctionComponent = ({ }) => {

    const classes = useStyles();

    return (
      <div className={classes.root}>
        <Typography variant="h2" className={classes.heading}>
          Getting Started
        </Typography>
        <Typography variant="body1" className={classes.body} gutterBottom>
          First, you will need to first click the 'Login' button on the left section of the
          home page titled 'Author'. If you don't have an account, you can click the register
          button and fill out the necessary information. If you are already logged in, you can click 'Begin'.
          This section of the website is where you can create materials and collections
          to later view, edit, claassify, and analyze.
        </Typography>
        <img src={require('../../common/images/authortut_1.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body} gutterBottom>
          Once you have clicked the 'Begin' button on the author section of the homepage,
          you will be brought to a blank screen with with navigation tabs on the left. The tabs
          are labeled based on the section of the website they are designed for. The first three tabs:
          'Create Materials', 'Create Collections', and 'View My Materials' are a part of the authroing section.
        </Typography>
        <Typography variant="h4" className={classes.subHeading}>
          Create Materials
        </Typography>
        <Typography variant="body1" className={classes.body} gutterBottom>
          Clicking the 'Create Materials' tab will bring you to a page with a form.
        </Typography>
        <img src={require('../../common/images/authortut_2.PNG')} alt="Italian Trulli"></img>
        <img src={require('../../common/images/authortut_3.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body} gutterBottom>
          This form is to be filled out with the necessary information about the material
          you are entering. The topics section of the form allows you to enter different topic tags
          related to the material that can later be used for searching related materials.
          To classify your material with the ACM or PDC guidelines you can click either of the two
          'ACM CSC 2013' or 'PDC 2012' buttons at the bottom.
        </Typography>
        <img src={require('../../common/images/authortut_4.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body} gutterBottom>
          Clicking either of the buttons will bring up tabs representing different knowledge areas
          within that particular classification. Each tab can be expanded further to knowledge units and
          then into learning outcomes. The empty box to the right of each entry can be clicked to check that
          the current material relates to that classification.
        </Typography>
        <img src={require('../../common/images/authortut_5.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body} gutterBottom>
          Once the desired tags are choosen you may save them by clicking 'save' at the top. This
          will bring you back to the original form where you can click submit to save the material to the
          database.
        </Typography>
        <Typography variant="h4" className={classes.subHeading}>
          Create Collections
        </Typography>
        <Typography variant="body1" className={classes.body} gutterBottom>
          Clicking the 'Create Collections' tab will bring you to a page with a list of all materials within CS Materials.
        </Typography>
        <img src={require('../../common/images/authortut_6.PNG')} alt="Italian Trulli"></img>
        <img src={require('../../common/images/authortut_7.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body} gutterBottom>
          From here you can select from the list of materials by ticking the box to the right of each entry. If needed,
          'Select all' and 'Select None' buttons are provided. Once the desired materials are selected, clicking the
          'Create Collection From Selected Materials' button can be clicked. This button will send you to a blank form similar
          to the 'Create Materials' form. You can begin to fill out this form similar to the create materials one with all the
          necessary information about this collection.
        </Typography>
        <Typography variant="h4" className={classes.subHeading}>
          View My Materials
        </Typography>
        <Typography variant="body1" className={classes.body} gutterBottom>
          Clicking the 'View My Materials' tab will bring you to a page with a list of all materials and collections
          you have created.
        </Typography>
        <img src={require('../../common/images/authortut_8.PNG')} alt="Italian Trulli"></img>
        <img src={require('../../common/images/authortut_9.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body} gutterBottom>
          From here you can view the information about your material by clicking the entry (not the box). This will bring
          you to a view describing the information entered during the creation of the material.
        </Typography>
        <img src={require('../../common/images/authortut_10.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body} gutterBottom>
          As creator of this material, you have multiple choices you can make from this page. You can:
          'Duplicate', 'Edit', or 'Delete' this material. Duplicating will create a copy of this material which is useful
          when you want to create a material similar to the current one. Editing allows you to change the metadata and tags of the material.
          Deleting will remove this material from your account and CS Materials.
        </Typography>
        <Typography variant="body1" className={classes.body} gutterBottom>
          Going back to the original 'View My Materials' page, you can also choose your list of materials to be made
          into a collection. This can be done by selecting the materials you want from your list and clicking the
          'Create Collection From Selected Materials' button. This will direct you to a Collections form (same as the forms mentioned before)
          to begin filling information about the collection.
        </Typography>
      </div>

    )
};
