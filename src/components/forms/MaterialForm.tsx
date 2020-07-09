import React, {FunctionComponent, SyntheticEvent} from "react";
import {RouteComponentProps} from "react-router";
import {getJSONData, postJSONData} from "../../common/util";
import {createStyles, MenuItem, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import LinearProgress from "@material-ui/core/LinearProgress";
import Button from "@material-ui/core/Button";
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContentWrapper from "../SnackbarContentWrapper";
import Autocomplete from '@material-ui/lab/Autocomplete';

import {TreeDialog} from "./TreeDialog";
import {MaterialTypesArray, TagData, MaterialData} from "../../common/types";

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

interface MetaTags {
    author: (TagData | string)[];
    course: (TagData | string)[];
    language: (TagData | string)[];
    topic: (TagData | string)[];
    dataset: (TagData | string)[];
    ontology: TagData[];
}

const createEmptyData = (): MaterialData => {
  return {
      id: null,
      title: "",
      description: "",
      instance_of: "material",
      material_type: "assignment",
      type: "",
      upstream_url: "",
      tags: [],
      materials: [],
  } ;
};

const createEmptyTags = (): MetaTags => {
    return {
        author: [],
        course: [],
        language: [],
        topic: [],
        dataset: [],
        ontology: []
    }
};

interface FormEntity {
    data:  MaterialData;
    temp_tags: MetaTags;
    meta_tags: MetaTags;
    tags_fetched: boolean;
    fetched: boolean;
    posting: boolean;
    fail: boolean;
    new: boolean;
    show_acm: boolean;
    show_pdc: boolean;
}

const createEmptyEntity = (location: any): FormEntity => {
    return {
        data: createEmptyData(),
        temp_tags: createEmptyTags(),
        meta_tags: createEmptyTags(),
        tags_fetched: false,
        fetched: false,
        posting: false,
        fail: false,
        new: location.pathname.endsWith("/create"),
        show_acm: false,
        show_pdc: false,
    };
};

export const MaterialForm: FunctionComponent<Props> = (
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

    let tag_map: { [tag_type: string]: (TagData | string)[]} = {
        'author': formInfo.temp_tags.author,
        'course': formInfo.temp_tags.course,
        'language': formInfo.temp_tags.language,
        'topic': formInfo.temp_tags.topic,
        'dataset': formInfo.temp_tags.dataset,
        'ontology': formInfo.temp_tags.ontology,
    };


    if (!formInfo.tags_fetched) {
        const url = api_url + "/data/meta_tags";

        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};
        getJSONData(url, auth).then(resp => {
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

    let has_source = false;
    let id = "-1";
    if (!formInfo.fetched && formInfo.new) {
        if (location.search.split("source=")[1]) {
            id = location.search.split("source=")[1].split("&")[0];
            has_source = true;
        }
    }

    if (formInfo.tags_fetched && !formInfo.fetched && (!formInfo.new || has_source)) {
        const q_id = has_source ? id : match.params.id;
        const url = api_url + "/data/material/meta?id=" + q_id;

        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};
        getJSONData(url, auth).then(resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL")
            } else {
                if (resp['status'] === "OK") {
                    const data = resp['data'];

                    //@HACK somehow this logic  gets hit twice after a refresh, this clears some annoying behavior
                    Object.values(tag_map).forEach(val => val.length = 0);

                    // Push values to be displayed as being tags on this material
                    data.tags.forEach((tag: TagData) => {
                        if (tag_map[tag.type]) {
                            tag_map[tag.type].push(tag);
                        }
                    });

                    if (has_source) {
                        data.id = null
                        data.title += " Copy"
                    }

                    setFormInfo({...formInfo, fetched: true, data})
                }
            }
        })
    }

    async function onSubmit() {
        setFormInfo({...formInfo, posting: true});
        const url = api_url + "/data/post/material";

        let data_tmp = {...formInfo.data, "instance_of": "material"};
        console.log(data_tmp);

        data_tmp.tags = [];


        // Compress tag_map back into original data form of array of objects
        Object.entries(tag_map).forEach(([key, value]) => {
            let vals = value.map(e => {
                if (typeof e !== "string")
                    return e;

                let ret: TagData = {
                    title: e,
                    type: key,
                    id: -1,
                    bloom: "",
                };

                return ret;
            });

            vals.forEach(e => data_tmp.tags.push(e));
        });

        const data = {"data": [data_tmp]};

        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        postJSONData(url, data, auth).then(resp => {
           console.log(resp);

           if (resp === undefined) {
               console.log("API SERVER FAIL")
               setFormInfo({...formInfo, posting: false, fail: true});
           } else {
                 if (resp['status'] === "OK") {
                     let id = resp['id'];
                     history.push({
                             pathname: "/material/" + id
                         }
                     );
                     force_user_data_reload();
                 } else {
                     setFormInfo({...formInfo, posting: false, fail: true});
                 }
           }
        });
    }


    const onTagTextFieldChange = (field_id: string) => (e: any, value: any): void => {
        let fields = formInfo.temp_tags;
        fields = {...fields, [field_id]: value};
        setFormInfo({...formInfo, temp_tags: fields});

    };

    //@TODO handle the tags... somehow
    const onUpdateMaterialTextField = (name: string, value: string) => {
        let fields = formInfo.data;
        fields = {...fields, [name]: value};
        setFormInfo({...formInfo, data: fields});
    };

    const onTextFieldChange = (field_id: string) => (e: React.ChangeEvent<HTMLInputElement>): void => {
        onUpdateMaterialTextField(field_id, e.currentTarget.value);
    };

    const onTypeFieldChange = (e:  React.ChangeEvent<HTMLInputElement>): void => {
        onUpdateMaterialTextField("material_type", e.target.value);
    };

    const handleSnackbarClose =  (name: string, event?: SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setFormInfo({...formInfo, [name]: false});
    };

    const treeOpen = (tree: string) => {
        let info = formInfo;
        if (tree === "acm_2013")
            info.show_acm = true;
        else if (tree === "pdc_2012")
            info.show_pdc = true;

        setFormInfo({...formInfo});
    };

    const treeClose = () => {
        setFormInfo({...formInfo, show_acm: false, show_pdc: false});
    };

    const onTreeCheckBoxClick = (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
        let selected = formInfo.temp_tags.ontology;
        if (event.target.checked)
            selected.push({id, title: "", type: "", bloom: ""});
        else {
            selected = selected.filter(e => e.id !== id);
        }

        let tags = formInfo.temp_tags;
        tags.ontology = selected;
        setFormInfo({...formInfo, temp_tags: tags});
    };


    let tags_fields;

    if (formInfo.fetched || (formInfo.tags_fetched && formInfo.new)) {

        let defaults: {[tag_type: string]: (TagData | string | undefined)[]} = {
            "author": [],
            "course": [],
            "language": [],
            "topic": [],
            "dataset": [],
        };


        let meta_tag_map: { [tag_type: string]: (TagData | string)[]} = {
            'author': formInfo.meta_tags.author,
            'course': formInfo.meta_tags.course,
            'language': formInfo.meta_tags.language,
            'topic': formInfo.meta_tags.topic,
            'dataset': formInfo.meta_tags.dataset,
        };


        Object.keys(defaults).forEach(key => {
            defaults[key] = tag_map[key].map(e => {
                    if (typeof e === "string")
                        return e;

                    return meta_tag_map[key].find(ref => {
                        if (typeof ref === "string")
                            return false;

                        return ref.id === e.id;
                    });
                }
            );
        });

        interface KeyProp {
            name: string
        }

        const MyAutocomplete: FunctionComponent<KeyProp> = ({name}) => {
            return (
                <Grid item>
                    <Autocomplete
                        multiple
                        disableClearable={true}
                        options={meta_tag_map[name]}
                        value={defaults[name]}
                        getOptionLabel={option => {
                            if (option === undefined)
                                return "";

                            if (typeof option === "string")
                                return option;

                            if (option.title !== undefined)
                                return option.title;

                            return String(option);
                        }}
                        freeSolo
                        onChange={onTagTextFieldChange(name)}
                        renderInput={params => (
                            <TextField
                                {...params}
                                variant="standard"
                                label={
                                    name.charAt(0).toUpperCase() + name.slice(1) + "s"
                                }
                                margin="normal"
                                className={classes.textArea}
                                fullWidth
                            />
                        )}
                    />
                </Grid>
            )
        };

        tags_fields = (
            <div>
                <MyAutocomplete name={"author"}/>
                <MyAutocomplete name={"course"}/>
                <MyAutocomplete name={"language"}/>
                <MyAutocomplete name={"topic"}/>
                <MyAutocomplete name={"dataset"}/>
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
                                id="standard-select-currency"
                                select
                                label="Material Type"
                                value={formInfo.data?.material_type}
                                onChange={onTypeFieldChange}
                                helperText=""
                                className={classes.textField}
                            >
                                {MaterialTypesArray.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item>
                        <TextField
                            label={"Upstream URL"}
                            value={formInfo.data.upstream_url === null ? "" : formInfo.data.upstream_url}
                            className={classes.textField}
                            onChange={onTextFieldChange("upstream_url")}
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
                                variant="contained" color="primary" onClick={() => {treeOpen("acm_2013")}}>
                                ACM CSC 2013
                            </Button>
                             <Button  className={classes.margin}
                                variant="contained" color="primary" onClick={() => {treeOpen("pdc_2012")}}>
                                 PDC 2012
                            </Button>
                        </Grid>

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

            <TreeDialog open={formInfo.show_acm} title={"ACM CSC 2013"} onClose={treeClose} api_url={api_url}
                        tree_name={"acm"}
                        selected_tags={formInfo.temp_tags.ontology}
                        onCheck={onTreeCheckBoxClick}
            />
            <TreeDialog open={formInfo.show_pdc} title={"PDC 2012"} onClose={treeClose} api_url={api_url}
                        tree_name={"pdc"}
                        selected_tags={formInfo.temp_tags.ontology}
                        onCheck={onTreeCheckBoxClick}
            />

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