import React, {FunctionComponent} from "react";
import {RouteComponentProps, Prompt} from "react-router";
import {getJSONData, parse_query_variable, postJSONData} from "../../common/util";
import {createStyles, Divider, List, MenuItem, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import LinearProgress from "@material-ui/core/LinearProgress";
import Button from "@material-ui/core/Button";
import Autocomplete from '@material-ui/lab/Autocomplete';
import {Author} from "../author/Author";
import PublishIcon from '@material-ui/icons/Publish';
import SaveIcon from '@material-ui/icons/Save';
import Tooltip from '@material-ui/core/Tooltip';
import HelpIcon from '@material-ui/icons/Help';
import {TreeDialog} from "./TreeDialog";
import {MaterialTypesArray, TagData, MaterialData, MaterialVisibilityArray, OntologyData, MaterialListData} from "../../common/types";
import {ListItemLink} from "../ListItemLink";
import Typography from "@material-ui/core/Typography";
import {FileLink} from "../MaterialOverview";
import GetAppIcon from "@material-ui/icons/GetApp";
import EditIcon from '@material-ui/icons/Edit';
import {DeleteDialog} from "./DeleteDialog";
import {
    BuildSnackbar,
    buildSnackbarProps,
    emptySnackbarBuilderProps,
    SnackbarBuilderProps
} from "../../common/SnackbarBuilder";
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { MaterialList } from "../MaterialList";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
          padding: theme.spacing(3, 2, 0, 0),
          margin: theme.spacing(2, 0, 0, 0),
          align: 'center',
          marginLeft: 100,
        },
        margin: {
            margin: theme.spacing(0,0,0,0),
        },
        textField: {
            margin: theme.spacing(2),
            width: '70%',
        },
        textArea: {
            margin: theme.spacing(4, 0, 0, 0),
            width: '90%',
        },
        icon: {
          marginRight: 100,
          marginTop: 50,
          marginLeft: 0,
        },
        saveButton: {
            verticalAlign: 'middle',
            textAlign: 'right',
        },
        paper: {
          marginTop: theme.spacing(3),
          marginBottom: theme.spacing(3),
          padding: theme.spacing(2),
          [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
            marginTop: theme.spacing(4),
            marginBottom: theme.spacing(6),
            padding: theme.spacing(1,0,5),
          },
        },
        stepper: {
          backgroundColor: 'transparent',
          boxShadow: 'none'
        },
        appBar: {
          position: 'relative',
        },
        layout: {
          width: 'auto',
          marginLeft: theme.spacing(2),
          marginRight: theme.spacing(2),
          [theme.breakpoints.up(600 + theme.spacing(2) * 2)]: {
            width: 600,
            marginLeft: 'auto',
            marginRight: 'auto',
          },
        },
        buttons: {
          display: 'flex',
          justifyContent: 'flex-end',
        },
        button: {
          marginTop: theme.spacing(3),
          marginLeft: theme.spacing(1),
        },
        mapped: {
          margin: theme.spacing(2),
          align: 'center'
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
      visibility: "public",
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
    files: FileLink[];
    snackbar_info: SnackbarBuilderProps;
    tags_fetched: boolean;
    fetched: boolean;
    posting: boolean;
    file_delete_mode: boolean;
    new: boolean;
    show_acm: boolean;
    show_pdc: boolean;
    show_material_list: boolean;
    is_dirty: boolean;
}

const createEmptyEntity = (location: any): FormEntity => {
    return {
        data: createEmptyData(),
        temp_tags: createEmptyTags(),
        meta_tags: createEmptyTags(),
        snackbar_info: emptySnackbarBuilderProps(),
        files: [],
        tags_fetched: false,
        fetched: false,
        posting: false,
        file_delete_mode: false,
        new: location.pathname.endsWith("/create"),
        show_acm: false,
        show_pdc: false,
        show_material_list: false,
        is_dirty: false,
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

    const steps = ['Meta Data', 'Tag Fields', 'Classification'];


    const [activeStep, setActiveStep] = React.useState(0);

    const handleNext = () => {
      setActiveStep(activeStep + 1);
    };

    const handleBack = () => {
      setActiveStep(activeStep - 1);
    };


    if (formInfo.is_dirty) {
        window.onbeforeunload = (e: any) => {
            let confirmation_message = 'It looks like you have been editing something. If you leave before saving, your changes will be lost.';
            (e || window.event).returnValue = confirmation_message; //Gecko + IE
            return confirmation_message; //Gecko + Webkit, Safari, Chrome etc
        };
    } else {
        window.onbeforeunload = () => {
            return undefined;
        }
    }


    let match_id = null;
    if (match.params.id) {
        match_id = Number(match.params.id);
    }
    // check if route has changed from another instance of this Form, if so clear data and re render.
    if (formInfo.fetched && match_id !== formInfo.data.id) {
        setFormInfo(createEmptyEntity(location));
    }

    let tag_map: { [tag_type: string]: (TagData | string)[]} = {
        'author': formInfo.temp_tags.author,
        'course': formInfo.temp_tags.course,
        'language': formInfo.temp_tags.language,
        'topic': formInfo.temp_tags.topic,
        'dataset': formInfo.temp_tags.dataset,
        'ontology': formInfo.temp_tags.ontology,
    };


    let has_source = false;
    let id = parse_query_variable(location, "source");
    if (!formInfo.fetched && formInfo.new) {
        if (id !== "") {
            has_source = true;
        }
    }

    const fetchFileList = (): Promise<FormEntity> => {
        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};
        const files_url = api_url + "/data/list_files/material?id=" + match.params.id;
        let snackbar_info = {...formInfo.snackbar_info};
        return getJSONData(files_url, auth).then((resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL")
                snackbar_info = buildSnackbarProps("error", "API Error, contact admins");
                return {...formInfo, fetched: false, snackbar_info}
            } else {
                if (resp.status === "OK") {
                    let inner_promises: Promise<FileLink>[] = [];
                    resp.data.forEach((file_name: string) => {
                        const file_get = api_url + "/data/get_file/material?id=" + match.params.id + "&file_key=" + file_name;
                        let inner_promise: Promise<FileLink> = getJSONData(file_get, auth).then((resp) => {
                            if (resp === undefined) {
                                console.log("API SERVER FAIL")
                                snackbar_info = buildSnackbarProps("error", "API Error, contact admins");
                                setFormInfo({...formInfo, snackbar_info});

                            } else {
                                if (resp.status === "OK") {
                                    return {name: file_name, url: resp.url}
                                }
                            }
                            return {name: "", url: ""}
                        })
                        inner_promises.push(inner_promise);
                    })
                    return Promise.all(inner_promises).then((files) => {
                        return {...formInfo, files, fetched: false}
                    })
                } else {
                    return {...formInfo, fetched: false}
                }
            }
        }));
    }

    if (!formInfo.fetched)  {
        const q_id = has_source ? id : match.params.id;
        const mat_url = api_url + "/data/material/meta?id=" + q_id;
        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};
        const meta_tags_url = api_url + "/data/meta_tags";

        let promises: Promise<FormEntity>[] = [];
        let promise;


        let material_type = parse_query_variable(location, "type");

        let mapped_ids = parse_query_variable(location, "ids");
        let list_data_promise: Promise<any> | null = null;
        if (mapped_ids !== "") {
            const list_url = api_url + "/data/list/materials?ids=" + mapped_ids;
            list_data_promise = getJSONData(list_url, auth);
        }

        let snackbar_info = {...formInfo.snackbar_info};

        promise = getJSONData(meta_tags_url, auth).then(resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL")
                snackbar_info = buildSnackbarProps("error", "API Error, contact admins");
                return {...formInfo, tags_fetched: true, snackbar_info}
            } else {
                if (resp['status'] === "OK") {
                    const meta_tags = resp['data'];
                    const data = formInfo.data;

                    if (material_type !== "") {
                        data.material_type = material_type;
                    }

                    if (list_data_promise !== null) {
                        return list_data_promise.then(resp => {
                            if (resp === undefined) {
                                console.log("API SERVER FAIL")
                                return {...formInfo, tags_fetched: true, meta_tags}
                            }
                            else {
                                if (resp['status'] === "OK") {
                                    data.materials = resp.data;
                                    return {...formInfo, tags_fetched: true, data, meta_tags}
                                } else {
                                    return {...formInfo, tags_fetched: true, data, meta_tags}
                                }
                            }
                        });
                    } else {
                        return {...formInfo, tags_fetched: true, meta_tags}
                    }
                } else {
                    return {...formInfo, tags_fetched: true}
                }
            }
        });
        promises.push(promise);

        if (q_id) {
            promise = getJSONData(mat_url, auth).then(resp => {
                if (resp === undefined) {
                    console.log("API SERVER FAIL")
                    snackbar_info = buildSnackbarProps("error", "API Error, contact admins");
                    return {...formInfo, fetched: true, snackbar_info}
                } else {
                    if (resp['status'] === "OK") {
                        const data = resp['data'];

                        //@HACK somehow this logic  gets hit twice after a refresh, this clears some annoying behavior
                        Object.values(tag_map).forEach(val => val.length = 0);

                        // Push values to be displayed as being selected_tags on this material
                        data.tags.forEach((tag: TagData) => {
                            if (tag_map[tag.type]) {
                                tag_map[tag.type].push(tag);
                            }
                        });

                        if (has_source) {
                            data.id = null
                            data.title += " Copy"
                        }

                        return {...formInfo, fetched: true, data}
                    } else {
                        return {...formInfo, fetched: true}
                    }
                }
            })
            promises.push(promise);
        }

        if (match.params.id) {
            promise = fetchFileList();
            promises.push(promise)
        }

        Promise.all(promises).then((values) => {
            let real_data = values.find(e => e.fetched)
            let tag_data = values.find(e => e.tags_fetched) || formInfo
            let file_data = values.find(e => e.files.length !== 0) || formInfo
            if (real_data) {
                let data = {...real_data, meta_tags: tag_data.meta_tags, tags_fetched: true, files: file_data.files}
                setFormInfo(data);
            } else {
                // new material
                setFormInfo({...tag_data, fetched: true})
            }
        });
    }

    async function onSubmit(handle_success: (id:number) => number): Promise<number | undefined> {
        setFormInfo({...formInfo, posting: true});
        const url = api_url + "/data/post/material";

        let data_tmp = {...formInfo.data, "instance_of": "material"};

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

        return postJSONData(url, data, auth).then(resp => {
            let snackbar_info = {...formInfo.snackbar_info};

           if (resp === undefined) {
               console.log("API SERVER FAIL")
               snackbar_info = buildSnackbarProps("error", "API Error, contact admins");
               setFormInfo({...formInfo, posting: false, snackbar_info});
           } else {
                 if (resp['status'] === "OK") {
                     let id = resp['id'];
                     return handle_success(id);
                 } else {
                     snackbar_info = buildSnackbarProps("error", "Error posting data, contact admins.");
                     setFormInfo({...formInfo, posting: false, snackbar_info});
                 }
           }
        });
    }


    const onTagTextFieldChange = (field_id: string) => (e: any, value: any): void => {
        let fields = formInfo.temp_tags;
        fields = {...fields, [field_id]: value};
        setFormInfo({...formInfo, temp_tags: fields, is_dirty: true});
    };

    const onUpdateMaterialTextField = (name: string, value: string) => {
        let fields = formInfo.data;
        fields = {...fields, [name]: value};
        setFormInfo({...formInfo, data: fields, is_dirty: true});

    };

    const onTextFieldChange = (field_id: string) => (e: React.ChangeEvent<HTMLInputElement>): void => {
        onUpdateMaterialTextField(field_id, e.currentTarget.value);
    };

    const onTypeFieldChange = (field_id: string) => (e:  React.ChangeEvent<HTMLInputElement>): void => {
        onUpdateMaterialTextField(field_id, e.target.value);
    };

    const clearSnackbarProps = () => {
        setFormInfo({...formInfo, snackbar_info: emptySnackbarBuilderProps(formInfo.snackbar_info)})
    }

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

    const handle_mapped_materials_update = (selected_materials: MaterialListData[]) => {
        let data = formInfo.data;
        data.materials = selected_materials;
        setFormInfo({...formInfo, show_material_list: false, data});
    }

    //function to handle when a entry in the ontology view is checked or unchecked
    const onTreeCheckBoxClick = (event: React.ChangeEvent<HTMLInputElement>, node: OntologyData) => {
        let selected = formInfo.temp_tags.ontology;
        if (event.target.checked)
            selected.push({id: node.id, title: node.title, type: "", bloom: ""});
        else {
            selected = selected.filter(e => e.id !== node.id);
        }

        let tags = formInfo.temp_tags;
        tags.ontology = selected;
        setFormInfo({...formInfo, temp_tags: tags, is_dirty: true});
    };

    const getPresignedUrl = (name: string, id: string): Promise<string> => {
        const url = api_url + "/data/put_file/material?id=" + id + "&file_key=" + name;
        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        return getJSONData(url, auth).then(resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL");
                return "API ERROR";
            } else {
                if (resp.status === "OK") {
                    return resp.data;
                } else {
                    return "INVALID"
                }
            }
        });
    }

    const onFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormInfo({...formInfo, posting: true});
        let snackbar_info = {...formInfo.snackbar_info};

        const makePromise = (file: File): Promise<any> => {
            return getPresignedUrl(file.name, id).then(async url => {
                return new Promise((resolve, reject) => {
                    if (url === "API ERROR") {
                        snackbar_info = buildSnackbarProps("error", "API Error, contact admins");
                        resolve();
                    } else if (url   === "INVALID") {
                        snackbar_info = buildSnackbarProps("error", "Error getting url, contact admins.");
                        resolve();
                    }

                    const xhr = new XMLHttpRequest();
                    xhr.open('PUT', url);
                    xhr.setRequestHeader('Content-Type', file.type);
                    xhr.setRequestHeader('x-amz-acl', 'public-read');
                    xhr.onload = resolve;
                    xhr.onerror = reject;
                    xhr.send(file);
                });
            });
        }

        // cache target
        let target = event.currentTarget;
        let id = match.params.id;
        if (formInfo.new) {
            // need an id for new material, submit it and get the id, redirect after file upload
            await onSubmit((id: number) => id).then((resp) => {
                if (resp !== undefined) {
                    id = String(resp);
                }
            })
        }

        let file: File;
        let promises = []
        if (target.files) {
            for (file of target.files) {
                promises.push(makePromise(file));
            }
        }

        // if new material redirect to its page, otherwise fetch file list
        Promise.all(promises).then(() => {
            if (formInfo.new) {
                history.push({
                        pathname: "/material/" + id + "/edit"
                    }
                );
                force_user_data_reload();
                setFormInfo({...formInfo, fetched: false, new: false, posting: false, snackbar_info});
            } else {
                fetchFileList().then(value => setFormInfo({...formInfo, files: value.files, posting: false, snackbar_info}));
            }
        });
    }


    let tags_fields: any;

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
            const handleKeyDown = (event: any) => {
              switch (event.key) {
                case "Tab": {
                  event.preventDefault()
                  event.stopPropagation();
                  defaults[name].push(event.target.value)
                  event.target.value = ""
                  break;
                }
                default:
              }
            };



            return (
              <Grid container spacing={0}>
                <Grid item xs={11}>
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
                        renderInput={params => {
                          Object.assign(params.inputProps, {onKeyDown: handleKeyDown})
                            // params.inputProps.onKeyDown = handleKeyDown;
                            return(
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
                          );
                        }}
                    />
                </Grid>
                <Grid item xs={1}>
                <Tooltip title="Press 'Enter' to submit each entry">
                    <HelpIcon className={classes.icon}/>
                </Tooltip>
                </Grid>
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

    function getStepContent(step: Number) {
      switch (step) {
        case 0:
          return (
            <Paper className={classes.paper}>
              <Grid container direction="column">
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
                    id="standard-select-type"
                    select
                    label="Material Type"
                    value={formInfo.data?.material_type}
                    onChange={onTypeFieldChange("material_type")}
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
                    id="standard-select-visibility"
                    select
                    label="Material Visibility"
                    value={formInfo.data?.visibility}
                    onChange={onTypeFieldChange("visibility")}
                    helperText=""
                    className={classes.textField}
                  >
                    {MaterialVisibilityArray.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item>
                  <TextField
                    label={"Upstream URL"}
                    value={
                      formInfo.data.upstream_url === null
                        ? ""
                        : formInfo.data.upstream_url
                    }
                    className={classes.textField}
                    onChange={onTextFieldChange("upstream_url")}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    label={"Description"}
                    value={
                      formInfo.data.description === null
                        ? ""
                        : formInfo.data.description
                    }
                    className={classes.textArea}
                    multiline
                    rows={4}
                    variant="outlined"
                    onChange={onTextFieldChange("description")}
                  />
                </Grid>
              </Grid>
            </Paper>
          );
        case 1:
          return (
            <Paper className={classes.paper}>
              <Grid container direction="column">
                {tags_fields}
              </Grid>
            </Paper>
          );
        case 2:
          return (
            <Paper className={classes.paper}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  {formInfo.posting && <LinearProgress />}
                  {formInfo.files.length !== 0 ? (
                    <div>
                      <Typography variant="h5">Files</Typography>
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => {
                          setFormInfo({
                            ...formInfo,
                            file_delete_mode: !formInfo.file_delete_mode,
                          });
                        }}
                      >
                        Toggle Delete Files
                      </Button>
                      {formInfo.file_delete_mode ? (
                        <div>
                          {formInfo.files.map((file) => {
                            if (formInfo.data.id)
                              return (
                                <DeleteDialog
                                  id={formInfo.data.id}
                                  name={file.name}
                                  key={file.name}
                                  endpoint={
                                    "/data/delete_file/material?id=" +
                                    formInfo.data.id +
                                    "&file_key=" +
                                    file.name
                                  }
                                  on_success={() => {
                                    fetchFileList().then((value) =>
                                      setFormInfo({
                                        ...formInfo,
                                        files: value.files,
                                      })
                                    );
                                  }}
                                  api_url={api_url}
                                />
                              );
                            return <div />;
                          })}
                        </div>
                      ) : (
                        <div>
                          {formInfo.files.map((file) => {
                            return (
                              <Button
                                className={classes.margin}
                                variant="contained"
                                startIcon={<GetAppIcon />}
                                target={"_blank"}
                                href={file.url}
                                key={file.name}
                                download={true}
                              >
                                {file.name}
                              </Button>
                            );
                          })}
                        </div>
                      )}

                      <Divider />
                    </div>
                  ) : (
                    <div />
                  )}
                </Grid>

                <Grid item xs={4}>
                  <Button
                    variant="contained"
                    color={"primary"}
                    component="label"
                    className={classes.margin}
                  >
                    Upload File
                    <input
                      type="file"
                      style={{ display: "none" }}
                      onChange={onFileUpload}
                    />
                  </Button>
                </Grid>

                <Grid item xs={4}>
                  <Button
                    className={classes.margin}
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      treeOpen("acm_2013");
                    }}
                  >
                    ACM CSC 2013
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    className={classes.margin}
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      treeOpen("pdc_2012");
                    }}
                  >
                    PDC 2012
                  </Button>
                </Grid>
                <Grid container direction="column">
                  <Grid item>
                    <Typography variant={"h5"}>Mapped Materials</Typography>
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => {
                        setFormInfo({ ...formInfo, show_material_list: true });
                      }}
                    >
                      Edit Mapped Materials
                    </Button>

                    <List>
                      {formInfo.data.materials.map((value, index) => {
                        return (
                          <div key={`${value.id}`}>
                            <Divider />
                            <ListItemLink
                              history={history}
                              location={location}
                              match={match}
                              primary={value.title}
                              to={"/material/" + value.id}
                              key={value.id}
                            />
                          </div>
                        );
                      })}
                    </List>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          );
        default:
          throw new Error("Unknown step");
      }
    }

    if (formInfo.show_material_list) {
      let selected_materials = formInfo.data.materials.map((mat) => mat.id);
      return (
        <MaterialList
          history={history}
          location={location}
          match={match}
          api_url={api_url}
          user_id={0}
          store_tags={false}
          selected_materials={selected_materials}
          material_update={handle_mapped_materials_update}
        />
      );
    }

    // @TODO, flash error messages for empty title
    // @TODO, styling
    return (
      <div>
        {formInfo.data.material_type !== "collection" ? (
          <Typography
            component="h1"
            variant="h3"
            align="center"
            color="textPrimary"
            gutterBottom
          >
            Material Form
          </Typography>
        ) : (
          <Typography
            component="h1"
            variant="h3"
            align="center"
            color="textPrimary"
            gutterBottom
          >
            Collection Form
          </Typography>
        )}

        <Prompt
          when={formInfo.is_dirty}
          message={() =>
            `Are you sure you want to leave this form? Unsaved changes will be lost.`
          }
        />

        <Button
          className={classes.saveButton}
          startIcon={<SaveIcon />}
          variant="contained"
          color="primary"
          onClick={() =>
            onSubmit((id) => {
              if (formInfo.new) {
                window.onbeforeunload = () => {};
                setFormInfo({ ...formInfo, is_dirty: false });
                history.push({
                  pathname: "/material/" + id + "/edit",
                });
                force_user_data_reload();
              }
              let snackbar_info = buildSnackbarProps("success", "Saved");
              setFormInfo({ ...formInfo, snackbar_info, is_dirty: false });
              return id;
            })
          }
        >
          Save
        </Button>

        {formInfo.data.material_type !== "collection" ? (
          <Author info={[]} currentLoc={"material_form"} />
        ) : (
          <Author info={[]} currentLoc={"collection_form"} />
        )}

        <Stepper activeStep={activeStep} className={classes.stepper}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <React.Fragment>
          {getStepContent(activeStep)}
          <div>
            {activeStep !== 0 && <Button onClick={handleBack}>Back</Button>}
            {activeStep === steps.length - 1 && (
              <Button
                startIcon={<PublishIcon />}
                variant="contained"
                color="primary"
                onClick={() =>
                  onSubmit((id) => {
                    window.onunload = () => {};
                    setFormInfo({ ...formInfo, is_dirty: false });
                    history.push({
                      pathname: "/material/" + id,
                    });
                    force_user_data_reload();
                    return id;
                  })
                }
              >
                Save and View
              </Button>
            )}
            {activeStep !== steps.length - 1 && (
              <Button variant="contained" color="primary" onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </React.Fragment>

        <TreeDialog
          open={formInfo.show_acm}
          title={"ACM CSC 2013"}
          onClose={treeClose}
          api_url={api_url}
          tree_name={"acm"}
          selected_tags={formInfo.temp_tags.ontology}
          onCheck={onTreeCheckBoxClick}
          save={() =>
            onSubmit((id) => {
              if (formInfo.new) {
                window.onbeforeunload = () => {};
                setFormInfo({ ...formInfo, is_dirty: false });
                history.push({
                  pathname: "/material/" + id + "/edit",
                });
                force_user_data_reload();
              }
              let snackbar_info = buildSnackbarProps("success", "Saved");
              setFormInfo({ ...formInfo, snackbar_info, is_dirty: false });
              return id;
            })
          }
        />
        <TreeDialog
          open={formInfo.show_pdc}
          title={"PDC 2012"}
          onClose={treeClose}
          api_url={api_url}
          tree_name={"pdc"}
          selected_tags={formInfo.temp_tags.ontology}
          onCheck={onTreeCheckBoxClick}
          save={() =>
            onSubmit((id) => {
              if (formInfo.new) {
                window.onbeforeunload = () => {};
                setFormInfo({ ...formInfo, is_dirty: false });
                history.push({
                  pathname: "/material/" + id + "/edit",
                });
                force_user_data_reload();
              }
              let snackbar_info = buildSnackbarProps("success", "Saved");
              setFormInfo({ ...formInfo, snackbar_info, is_dirty: false });
              return id;
            })
          }
        />

        <BuildSnackbar
          {...formInfo.snackbar_info}
          clearProps={clearSnackbarProps}
        />
      </div>
    );
};
