import React, {FunctionComponent} from "react";
import {getJSONData} from "../util/util";
import CircularProgress from "@material-ui/core/CircularProgress";
import List from "@material-ui/core/List";
import {ListItemLink} from "./ListItemLink";
import {createStyles, Paper, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import {RouteComponentProps} from "react-router";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(3, 2),
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
    fetched: boolean;
}

const createEmptyEntity = (): ListEntity => {
    return {
        materials: null,
        fetched: false,
    }
};

interface MatchParams {
    id: string;
}

interface ListProps extends RouteComponentProps<MatchParams> {
    api_url: string;
}

export const MaterialList: FunctionComponent<ListProps> = ({   history,
                                                               location,
                                                               match,
                                                               api_url,
                                                           }) => {
    const classes = useStyles();

    const [listInfo, setListInfo] = React.useState<ListEntity>(
        createEmptyEntity()
    );
    console.log("in material list");

    if (!listInfo.fetched) {
        setListInfo({...listInfo, fetched: true});


        let ids = "";
        let tags = "";
        if (location.search.split("ids=")[1])
            ids = location.search.split("ids=")[1].split("&")[0];
        if (location.search.split("tags=")[1])
            tags = location.search.split("tags=")[1].split("&")[0];

        const url = api_url + "/data/list/materials?ids=" + ids + "&tags=" + tags;

        // @TODO pass in auth token
        getJSONData(url).then(resp => {
            console.log(resp);
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            }
            else {
                if (resp['status'] === "OK") {
                    const data = resp['data'];
                    setListInfo({...listInfo, fetched: true, materials: data})
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
                <ListItemLink history={history} location={location} match={match} primary={value.title}
                              to={"/material/" + value.id} key={value.id}/>
            )
        });
    }


    return (
        <div>
            <Paper className={classes.root}>
                <Typography variant="h5" component="h3">
                    Results
                </Typography>
                {listInfo.materials === null &&
                <CircularProgress/>
                }
                <List>
                    {output}
                </List>
            </Paper>
        </div>
    )
};
