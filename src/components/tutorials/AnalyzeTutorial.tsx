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

export const AnalyzeTutorial: FunctionComponent = ({ }) => {

    const classes = useStyles();

    return (
      <div className={classes.root}>
        <Typography variant="h2" className={classes.heading}>
          Getting Started
        </Typography>
        <img src={require('../../common/images/analyzetut_1.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body} gutterBottom>
          First, you will need to click the 'BEGIN' button on the center section of the
          home page titled 'Analyze'. This section of the website is where all analysis
          of the materials and collections are performed. Clicking begin will
          bring you to a blank page with a navigation bar on the left side of the screen labeled
          as the different pages within the system.
        </Typography>
        <Typography variant="h2" className={classes.heading}>
          Selecting
        </Typography>
        <Typography variant="body1" className={classes.body} gutterBottom>
          There are three different ways of selecting materials and collections before
          the analysis process. Each selection type will provide different visualizations
          when navigating to visual pages.
        </Typography>
        <Typography variant="h4" className={classes.subHeading}>
          Select Materials
        </Typography>
        <img src={require('../../common/images/analyzetut_2.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body} gutterBottom>
           In the 'Select Materials' tab, you will see a page listing all materials within the CS Materials database.
        </Typography>
        <img src={require('../../common/images/analyzetut_3.PNG')} alt="Italian Trulli" ></img>
        <Typography variant="body1" className={classes.body} gutterBottom>
          Each material has an associated check box that you can click to select the material.
          Multiple materials can be selected at one time. The list also provides a
          'select all' and 'select none' buttons to select every material in the list or remove
          all selections respectively.
        </Typography>
        <img src={require('../../common/images/analyzetut_4.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body}>
          Once the materials desired are selected, 3 different visualization types can be performed
          on them:
        <Typography variant="body1" className={classes.body}>
          - Radial Layout against the ACM 2013 curriculum guidelines
        </Typography>
        <Typography variant="body1" className={classes.body}>
          - Radial Layout against the PDC 2012 curriculum guidelines
        </Typography>
        <Typography variant="body1" className={classes.body}>
          - Hamonization View
        </Typography>
        </Typography>
        <Typography variant="h4" className={classes.subHeading}>
          Radial Layout ACM
        </Typography>
        <Typography variant="body1" className={classes.body} gutterBottom>
          Clicking the 'Radial View ACM-CSC 2013' tab, a radial node link graph will load on the screen
        </Typography>
        <img src={require('../../common/images/analyzetut_5.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body} gutterBottom>
          Within this layout, leaf nodes represent tags while inner nodes are the higher level ACM classifications. The colors blue,
          orange, gray, and red colors represent the parent nodes of tags, tags that have been hit/classified by a material,
          non hit tags, and the root node respectively. Hovering over a tag will display all the materials associated with it in the top right
          and the path to the node from the root on the left.
        </Typography>
        <Typography variant="h4" className={classes.subHeading}>
          Radial Layout PDC
        </Typography>
        <Typography variant="body1" className={classes.body} gutterBottom>
          Clicking the 'Radial View PDC 2012' tab, a radial node link graph will load on the screen
        </Typography>
        <img src={require('../../common/images/analyzetut_6.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body} gutterBottom>
          Within this layout, leaf nodes represent tags while inner nodes are the higher level PDC classifications. The colors blue,
          orange, gray, and red colors represent the parent nodes of tags, tags that have been hit/classified by a material,
          non hit tags, and the root node respectively. Hovering over a tag will display all the materials associated with it in the top right
          and the path to the node from the root on the left.
        </Typography>
        <Typography variant="h4" className={classes.subHeading}>
          Harmonization View
        </Typography>
        <Typography variant="body1" className={classes.body} gutterBottom>
          Clicking the 'Harmonization View' tab, a matrix will load on the screen
        </Typography>
        <img src={require('../../common/images/analyzetut_7.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body} gutterBottom>
          This matrix view shows the materials listed on the x axis and the union of all tags on the y axis.
          The matrix is biclustered by similar tags for easy identification of patterns for similar materials.
          This view allows the user to easily make classification edits to their material by clicking in cells
          corresponding to the material and tag. Clicking a cell will turn it blue (assigned tag to that material),
          gray (removed tag from that material), or red (reverting the removal of a tag).
        </Typography>
        <img src={require('../../common/images/analyzetut_8.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body} gutterBottom>
          Hovering over a cell will highlight it and display the 'breadcrumbs' (path in ACM tree) to that tag
          along with the materials associated with it.
        </Typography>
        <Typography variant="body1" className={classes.body} gutterBottom>
          All of these views can also be performed on collections of materials.
          By visiting the 'Select Collections' tab, the user can select collections from a similar list
          and proceed by clicking the different vizualization tabs.
        </Typography>
        <Typography variant="h4" className={classes.subHeading}>
          Comparison View
        </Typography>
        <Typography variant="body1" className={classes.body} gutterBottom>
          To begin comparing two sets of materials, click the 'Select Comparision' tab
        </Typography>
        <img src={require('../../common/images/analyzetut_9.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body} gutterBottom>
          From here, the user can begin to select multiple materials from the list. At the top of each list
          is three tabs. These tabs manipulate each list to display either materials, collections, or your materials if
          you have created some. You can make selections from any of the lists without affecting the other. All selected
          information from the lists will be combined for the visualizations.
        </Typography>
        <img src={require('../../common/images/analyzetut_10.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body}>
          Once the materials/collections desired are selected, 2 different visualization types can be performed
          on them:
        <Typography variant="body1" className={classes.body}>
          - Comparison Radial Layout against the ACM 2013 curriculum guidelines
        </Typography>
        <Typography variant="body1" className={classes.body}>
          - Comparison Radial Layout against the PDC 2012 curriculum guidelines
        </Typography>
        </Typography>
        <Typography variant="h4" className={classes.subHeading}>
          Comparison Radial Layout ACM
        </Typography>
        <Typography variant="body1" className={classes.body} gutterBottom>
          Clicking the 'Radial View ACM-CSC 2013' tab, a radial node link graph will load on the screen
        </Typography>
        <img src={require('../../common/images/analyzetut_11.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body} gutterBottom>
          Within this layout, leaf nodes represent tags while inner nodes are the higher level ACM classifications. A divergent color scale
          is used to represent the number of materials associated with a given tag from each list. The darker the color purple or orange, the more that
          tag is covered from the first or second list respectively. The whiter the node, the more both lists cover that tag evenly.
          Hovering over a node will display all the materials
          associated with it in the top right with the percentage of coverage from each list
          and the path to the node from the root on the left.
        </Typography>
        <Typography variant="h4" className={classes.subHeading}>
          Comparison Radial Layout PDC
        </Typography>
        <Typography variant="body1" className={classes.body} gutterBottom>
          Clicking the 'Radial View PDC 2012' tab, a radial node link graph will load on the screen
        </Typography>
        <img src={require('../../common/images/analyzetut_12.PNG')} alt="Italian Trulli"></img>
        <Typography variant="body1" className={classes.body} gutterBottom>
          Within this layout, leaf nodes represent tags while inner nodes are the higher level PDC classifications. A divergent color scale
          is used to represent the number of materials associated with a given tag from each list. The darker the color purple or orange, the more that
          tag is covered from the first or second list respectively. The whiter the node, the more both lists cover that tag evenly.
          Hovering over a node will display all the materials
          associated with it in the top right with the percentage of coverage from each list
          and the path to the node from the root on the left.
        </Typography>

      </div>

    )
};
