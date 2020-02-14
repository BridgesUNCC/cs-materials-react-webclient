import React, {FunctionComponent} from "react";
import {getJSONData} from "../util/util";
import CircularProgress from "@material-ui/core/CircularProgress";
import List from "@material-ui/core/List";
import {ListItemLink} from "./ListItemLink";
import {createStyles, Paper, Grid, Theme, Checkbox, Divider} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import {Link} from "react-router-dom";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(3, 2),
            margin: theme.spacing(5),

        },
        margin: {
            margin: theme.spacing(5),
        },
    }),
);



interface MaterialEntry {
    title: string;
    id: number;
}


interface ListEntity {
    materials: MaterialEntry[] | null;
    selected_materials: number[];
    fetched: boolean;
}

const createEmptyEntity = (): ListEntity => {
    return {
        materials: null,
        selected_materials: [],
        fetched: false,
    }
};

interface ListProps {
    api_url: string;
    user_materials: number[];
}

export const UserMaterialList: FunctionComponent<ListProps> = ({api_url, user_materials}) => {
    const classes = useStyles();

    const [listInfo, setListInfo] = React.useState<ListEntity>(
        createEmptyEntity()
    );

    if (!listInfo.fetched) {
        setListInfo({...listInfo, fetched: true});

        console.log(user_materials);
        if (user_materials.length === 0) {
            user_materials = [-1];
        }

        const url = api_url + "/data/list/materials?ids=" + user_materials;

        // @TODO pass in auth token
        getJSONData(url).then(resp => {
            console.log(resp);
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            }
            else {
                if (resp['status'] === "OK") {
                    const data = resp['data'];
                    setListInfo({...listInfo, fetched: true, materials: data, selected_materials: user_materials})
                }
            }
        })
    }

    // @Speed @TODO, smart cull entries so rendering doesn't take too long, maybe have a callback that renders more as
    // user scrolls down?
    let output;
    if (listInfo.materials !== null) {
        output = listInfo.materials.map((value, index) => {
            // @Hack @FIXME cull entries for speed
            if (index > 250)
                return null;

            return (
                <div>

                    <Divider/>
                    <ListItemLink primary={value.title} to={"/material/" + value.id} key={value.id}
                                  input={
                                      <Checkbox id={`checkbox-${value.id}`}
                                                checked={listInfo.selected_materials.includes(value.id)}
                                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                    handleCheck(event, value.id);
                                                }}
                                                onClick={e => (e.stopPropagation())}
                                      />
                                  }
                    />
                </div>
            )
        });
    }

    const handleCheck = (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
        let selected = listInfo.selected_materials;
        if (event.target.checked) {
            selected.push(id);
        } else {
            selected = selected.filter(e => e !== id);
        }

        setListInfo({...listInfo, selected_materials: selected});
    };

    return (
        <div>
            <Paper className={classes.root}>
                <Typography variant="h5" component="h3">
                    Your Materials
                </Typography>
                <Grid container
                      direction="column"

                >
                    <Grid item>
                        <Button className={classes.margin} variant="contained" color="primary"
                                component={ Link } to={"/matrix?ids=" + (listInfo.selected_materials.length === 0 ?
                                    -1
                                    :
                                    listInfo.selected_materials
                        )
                                }>
                            Harmonization Matrix
                        </Button>
                        <Button className={classes.margin} variant="contained" color="primary"
                                component={ Link } to={"/radial?ids=" + listInfo.selected_materials}>
                            Radial View
                        </Button>
                    </Grid>
                    <Divider/>
                      <Grid item>
                        <Button className={classes.margin} variant="contained" color="primary"
                            onClick={() => {setListInfo({...listInfo, selected_materials:user_materials})}}
                        >
                            Select All
                        </Button>
                        <Button className={classes.margin} variant="contained" color="primary"
                                onClick={() => {setListInfo({...listInfo, selected_materials:[]})}}
                        >
                            Select None
                        </Button>
                    </Grid>
                </Grid>
                {listInfo.materials === null &&
                <CircularProgress/>
                }
                <List>
                    {output}
                </List>
            </Paper>
        </div>
    )
}