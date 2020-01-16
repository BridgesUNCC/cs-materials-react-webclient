import React, {FunctionComponent, SyntheticEvent} from "react";
import {RouteComponentProps} from "react-router";
import {getJSONData, postJSONData} from "../util/util";
import {createStyles, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import LinearProgress from "@material-ui/core/LinearProgress";
import Button from "@material-ui/core/Button";
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContentWrapper from "./SnackbarContentWrapper";
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';


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
            width: 400,
        },
        textArea: {
            margin: theme.spacing(4),
            width: 500,
        }
    }),
);


interface MatchParams {
    id: string;
}

interface Props extends RouteComponentProps<MatchParams> {
    api_url: string;
}

// @TODO finish the rest of the fields
interface MaterialData {
    id: number | null;
    title: string;
    description: string
    instance_of: string;
    upstream_url: string;
    tags: TagData[];
}

interface TagData {
    id: number;
    title: string;
    bloom: string;
    type: string;
}

interface MetaTags {
    author: TagData[];
    course: TagData[];
    language: TagData[];
    topic: TagData[];
    dataset: TagData[];
}

const createEmptyData = (): MaterialData => {
  return {
      id: null,
      title: "",
      description: "",
      instance_of: "material",
      upstream_url: "",
      tags: [],
  } ;
};

const createEmptyTags = (): MetaTags => {
    return {
        author: [],
        course: [],
        language: [],
        topic: [],
        dataset: [],
    }
};

interface FormEntity {
    data:  MaterialData;
    meta_tags: MetaTags;
    tags_fetched: boolean;
    fetched: boolean;
    posting: boolean;
    fail: boolean;
    new: boolean;
}

const createEmptyEntity = (location: any): FormEntity => {
    return {
        data: createEmptyData(),
        meta_tags: createEmptyTags(),
        tags_fetched: false,
        fetched: false,
        posting: false,
        fail: false,
        new: location.pathname.endsWith("/create"),
    };
};

export const MaterialForm: FunctionComponent<Props> = (
    {
        history,
        location,
        match,
        api_url,
    }
) => {

    const classes = useStyles();

    const [formInfo, setFormInfo] = React.useState(
        createEmptyEntity(location)
    );


    if (!formInfo.tags_fetched) {
        const url = api_url + "/data/meta_tags";

        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};
        getJSONData(url, auth).then(resp => {
           console.log(resp);
           if (resp === undefined) {
                console.log("API SERVER FAIL")
           } else {
               if (resp['status'] === "OK") {
                   const meta_tags = resp['data'];
                   setFormInfo({...formInfo, tags_fetched: true, meta_tags})
               }
           }
        });
    }

    if (formInfo.tags_fetched && !formInfo.fetched && !formInfo.new) {
        const url = api_url + "/data/material/meta?id=" + match.params.id;

        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};
        getJSONData(url, auth).then(resp => {
            console.log(resp);
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            } else {
                if (resp['status'] === "OK") {
                    const data = resp['data'];
                    setFormInfo({...formInfo, fetched: true, data})
                }
            }
        })
    }


    async function onSubmit() {
        setFormInfo({...formInfo, posting: true});
        const url = api_url + "/data/post/material";

        const data = {"data": [formInfo.data]};

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
                             pathname: "/material/" + id
                         }
                     )
                 } else {
                     setFormInfo({...formInfo, posting: false, fail: true});
                 }
           }

        });

    }


    //@TODO handle the tags... somehow
    const onUpdateMaterialTextField = (name: string, value: string) => {
        let fields = formInfo.data;
        fields = {...fields, [name]: value};
        setFormInfo({...formInfo, data: fields});
    };

    const onTextFieldChange = (field_id: string) => (e: React.ChangeEvent<HTMLInputElement>): void => {
        onUpdateMaterialTextField(field_id, e.currentTarget.value);
    };


    const handleSnackbarClose =  (name: string, event?: SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setFormInfo({...formInfo, [name]: false});
    };


    let tags_fields;
    if (formInfo.fetched) {
        let tag_lookup: { [tag_type: string]: TagData[]} = {
            'author': [],
            'course': [],
            'language': [],
            'topic': [],
            'dataset': [],
        };

        formInfo.data.tags.forEach(tag => {
            if (tag_lookup[tag.type]) {
                tag_lookup[tag.type].push(tag);
            }
        });

        let default_authors = tag_lookup.author.map(e => {
            return formInfo.meta_tags.author.find(ref => ref.id === e.id);
        });

        let default_courses = tag_lookup.course.map(e => {
            return formInfo.meta_tags.course.find(ref => ref.id === e.id);
        });

        let default_languages = tag_lookup.language.map(e => {
            return formInfo.meta_tags.language.find(ref => ref.id === e.id);
        });

        let default_topics = tag_lookup.topic.map(e => {
            return formInfo.meta_tags.topic.find(ref => ref.id === e.id);
        });

        let default_datasets = tag_lookup.dataset.map(e => {
            return formInfo.meta_tags.dataset.find(ref => ref.id === e.id);
        });

        tags_fields = (
            <div style={{ width: 500 }}>
                <Grid item>
                <Autocomplete
                    multiple
                    options={formInfo.meta_tags.author}
                    defaultValue={default_authors}
                    getOptionLabel={option => {
                            if (option.title !== undefined)
                                return option.title;

                            return option;
                        }}
                    freeSolo
                    renderInput={params => (
                    <TextField
                        {...params}
                        variant="standard"
                        label="Authors"
                        margin="normal"
                        fullWidth
                    />
                )}
                />
                </Grid>

                <Grid item>
                    <Autocomplete
                        multiple
                        options={formInfo.meta_tags.course}
                        defaultValue={default_courses}
                        getOptionLabel={option => {
                            if (option.title !== undefined)
                                return option.title;

                            return option;
                        }}
                        freeSolo
                        renderInput={params => (
                            <TextField
                                {...params}
                                variant="standard"
                                label="Courses"
                                margin="normal"
                                fullWidth
                            />
                        )}
                    />
                </Grid>

                <Grid item>
                    <Autocomplete
                        multiple
                        options={formInfo.meta_tags.language}
                        defaultValue={default_languages}
                        getOptionLabel={option => {
                            if (option.title !== undefined)
                                return option.title;

                            return option;
                        }}
                        freeSolo
                        renderInput={params => (
                            <TextField
                                {...params}
                                variant="standard"
                                label="Programming Languagess"
                                margin="normal"
                                fullWidth
                            />
                        )}
                    />
                </Grid>


                <Grid item>
                    <Autocomplete
                        multiple
                        options={formInfo.meta_tags.topic}
                        defaultValue={default_topics}
                        getOptionLabel={option => {
                            if (option.title !== undefined)
                                return option.title;

                            return option;
                        }}
                        freeSolo
                        renderInput={params => (
                            <TextField
                                {...params}
                                variant="standard"
                                label="Topics"
                                margin="normal"
                                fullWidth
                            />
                        )}
                    />
                </Grid>

                <Grid item>
                    <Autocomplete
                        multiple
                        options={formInfo.meta_tags.dataset}
                        defaultValue={default_datasets}
                        getOptionLabel={option => {
                            if (option.title !== undefined)
                                return option.title;

                            return option;
                        }}
                        freeSolo
                        renderInput={params => (
                            <TextField
                                {...params}
                                variant="standard"
                                label="Datasets"
                                margin="normal"
                                fullWidth
                            />
                        )}
                    />
                </Grid>

            </div>


        )

    }

    // @TODO, flash error messages for empty title
    return (
        <div className={classes.root}>
            <Paper>
                {formInfo.posting &&
                    <LinearProgress/>
                }
                {(formInfo.data === null && !formInfo.new) ?
                    <CircularProgress/>
                    :
                    <Grid
                        container
                        direction="column"
                    >
                        <Grid item>
                        <TextField
                            label={"Title"}
                            value={formInfo.data.title}
                            className={classes.textField}
                            onChange={onTextFieldChange("title")}
                        />
                        </Grid>

                        <Grid item>
                        <TextField
                            label={"Description"}
                            value={formInfo.data.description}
                            className={classes.textArea}
                            multiline={true}
                            onChange={onTextFieldChange("description")}
                        />
                        </Grid>

                        {tags_fields}

                        <Grid
                            item
                        >
                            <Button  className={classes.margin}
                                variant="contained" color="primary" onClick={onSubmit}>
                                Submit
                            </Button>
                        </Grid>
                    </Grid>
                    }
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
