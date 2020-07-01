import React, {FunctionComponent, SyntheticEvent} from "react";
import {RouteComponentProps} from "react-router";
import {getJSONData, postJSONData} from "../../util/util";
import {createStyles, Divider, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContentWrapper from "../SnackbarContentWrapper";
import {ListItemLink} from "../ListItemLink";


// THIS IS A TEMPORARY FILE
// WILL BE REFACTORED INTO GENERIC MATERIAL FORMS LATER


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(3, 2),
            margin: theme.spacing(3, 2),
        },
        margin: {
            margin: theme.spacing(1),
        },
        textField: {
            margin: theme.spacing(2),
            width: '70%',
        },
        textArea: {
            margin: theme.spacing(4),
            width: '80%',
        }
    }),
);

interface MatchParams {
    id: string;
}

interface Props extends RouteComponentProps<MatchParams> {
    api_url: string;
    force_user_data_reload: () => void;
}

interface CollectionData {
    id: number | null;
    title: string;
    material_type: "assignment" | "collection" | "ordered_collection";
    instance_of: "material" | "tag";
    materials: MaterialData[]
}

export interface MaterialData {
    title: string;
    id: number;
}


interface FormEntity {
    data: CollectionData;
    fetched: boolean
    posting: boolean;
    fail: boolean;
    new: boolean;
}

const createEmptyEntity = (location: any): FormEntity => {
    return {
        data: {
            id: null,
            title: "",
            material_type: "collection",
            instance_of: "material",
            materials: []
        },
        fetched: false,
        posting: false,
        fail: false,
        new: location.pathname.endsWith("/create"),
    }
};

export const CollectionForm: FunctionComponent<Props> = (
    {
        history,
        location,
        match,
        api_url,
        force_user_data_reload,
    }
) => {

    const classes = useStyles();

    const [formInfo, setFormInfo] = React.useState(
      createEmptyEntity(location)
    );

    if (!formInfo.fetched) {
        let ids = "-1,";
        if (location.search.split("ids=")[1])
            ids += location.search.split("ids=")[1].split("&")[0];

        const url = api_url + "/data/list/materials?ids=" + ids;
        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};
        getJSONData(url, auth).then(resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            } else {
                if (resp['status'] === "OK") {
                    const mats = resp['data'];

                    let data = formInfo.data;
                    data.materials = mats;
                    setFormInfo({...formInfo, fetched: true, data})
                }
            }
        })

    }

     async function onSubmit() {
        setFormInfo({...formInfo, posting: true});
        const url = api_url + "/data/post/material";


        const data = {"data": [formInfo.data]};
        console.log(formInfo.data);

        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        //@TODO send Auth token
        postJSONData(url, data, auth).then(resp => {
           console.log(resp);

           if (resp === undefined) {
               console.log("API SERVER FAIL")
           } else {
                 if (resp['status'] === "OK") {
                     let id = resp['id'];
                     history.push({
                             pathname: "/collection/" + id
                         }
                     );
                     force_user_data_reload();
                 } else {
                     setFormInfo({...formInfo, posting: false, fail: true});
                 }
           }
        });
    }

    let output = null;
    let count = 0;
    if (formInfo.data.materials.length !== 0) {
        output = formInfo.data.materials.map((value, index) => {
            // @Hack @FIXME cull entries for speed
            if (count++ > 250)
                return null;
            return (
                <div key={`${value.id}`}>

                    <Divider/>
                    <ListItemLink
                        history={history}
                        location={location}
                        match={match}
                        primary={value.title} to={"/material/" + value.id} key={value.id}
                    />
                </div>
            )
        });
    }

    const onTextFieldChange = (field_id: string) => (e: React.ChangeEvent<HTMLInputElement>): void => {
        let fields = formInfo;
        let data = {...fields.data, [field_id]: e.currentTarget.value};
        fields = {...fields, data};
        setFormInfo(fields)
    };

    const handleSnackbarClose =  (name: string, event?: SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setFormInfo({...formInfo, [name]: false});
    };

    return (
        <div>
            <Paper>
                <Grid>
                    <Grid item>
                        <TextField
                            label={"Title"}
                            value={formInfo.data.title}
                            className={classes.textField}
                            onChange={onTextFieldChange("title")}
                        />
                    </Grid>

                    <Grid item>
                        {!formInfo.fetched &&
                            <CircularProgress/>
                        }
                        <List>
                            {output}
                        </List>
                    </Grid>

                    <Grid>
                         <Button  className={classes.margin}
                                variant="contained" color="primary" onClick={onSubmit}>
                                Submit
                            </Button>
                    </Grid>
                </Grid>
            </Paper>
            <Snackbar open={formInfo.fail}>
                <SnackbarContentWrapper
                    variant="error"
                    message="submission failed, check credentials"
                    onClose={(event?: SyntheticEvent, reason?: string) => {
                        handleSnackbarClose("fail", event, reason);
                    }}
                />
            </Snackbar>
        </div>
    )
};