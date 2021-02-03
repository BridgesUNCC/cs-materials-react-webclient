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
}));

export const TutorialIndex: FunctionComponent = ({ }) => {

    const classes = useStyles();
    const imageLink = require('../../author.PNG')

    return (
      <div className={classes.root}>
        <Typography gutterBottom variant="h2" component="h2">
          CS Materials Full Tutorial
        </Typography>
        <iframe src='https://www.youtube.com/embed/IyEMcpXYUKU'
                className={classes.frame}
                frameBorder='1'
                allow='autoplay; encrypted-media'
                allowFullScreen
                title='video'
        />
        <Typography gutterBottom variant="h3" component="h2">
          Individual Tutorials
        </Typography>
        <Grid container spacing={6}>
          <Grid item xs={4}>
            <Paper className={classes.paper}>
              <Card className={classes.root}>
                <CardActionArea component={Link} to={'/authortutorial'}>
                  <CardMedia
                    className={classes.media}
                    image={require('../../author.PNG')}
                    title="Contemplative Reptile"
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                      Authoring Tutorial
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                      Input your own materials and classes into CS-Materials, and classify them against curriculum guidelines.
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions>
                </CardActions>
              </Card>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper className={classes.paper}>
              <Card className={classes.root}>
                <CardActionArea component={Link} to={'/analyzetutorial'}>
                  <CardMedia
                    component="img"
                    className={classes.media}
                    image={require('../../analyze.PNG')}
                    title="Contemplative Reptile"
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                      Analyzing Tutorial
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                      Study the coverage of courses and the alignment between different components of the class.
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions>
                </CardActions>
              </Card>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper className={classes.paper}>
              <Card className={classes.root}>
                <CardActionArea component={Link} to={'/searchtutorial'}>
                  <CardMedia
                    className={classes.media}
                    image={require('../../search.PNG')}
                    title="Contemplative Reptile"
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                      Searching Tutorial
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
		      Search for new materials to be integrated in your class.
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions>
                </CardActions>
              </Card>
            </Paper>
          </Grid>
        </Grid>
      </div>

    )
};
