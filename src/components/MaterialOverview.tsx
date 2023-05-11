import React, {FunctionComponent, ReactNode, useEffect} from "react";
import {RouteComponentProps} from "react-router";
import {getJSONData} from "../common/util";
import {createStyles, Divider, Theme, List, TextField} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import {Link, useParams} from "react-router-dom";
import Button from "@material-ui/core/Button";
import {ListItemLink} from "./ListItemLink";
import {DeleteDialog} from "./forms/DeleteDialog";
import {MaterialListData, MaterialTypesArray} from "../common/types";
import {Author} from "./author/Author";
import EditIcon from '@material-ui/icons/Edit';
import GetAppIcon from '@material-ui/icons/GetApp';
import {NotFound} from "./NotFound";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        margin: {
            margin: theme.spacing(2),
            marginLeft: 'auto',
        },
        topButton:{
          display: 'inline-block'
        },
        root: {
            margin: theme.spacing(3, 2),
            textAlign: 'center',
        },
        content: {
            margin: theme.spacing(2, 1),
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'row',
        },
        contentVertical: {
            margin: theme.spacing(2, 1),
            textAlign: 'left',
        },
        horizontalBullets: {
            marginLeft: theme.spacing(3),
        },
        link: {
            color: 'cyan',
            marginLeft: theme.spacing(2),
        },
        container: {
         display: 'flex',
         flexWrap: 'wrap',
       },
       formControl: {
         margin: theme.spacing(1),
         minWidth: 120,
       },
       paper: {
        padding: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
        wordBreak: "break-word",
      },
      materialList:{
        flexGrow: 1,
        overflowY: 'auto',
      }
    }),
);


interface MatchParams {
    id: string;
}

interface Props extends RouteComponentProps<MatchParams> {
    api_url: string;
    force_fetch_data: boolean;
    is_admin: boolean,
}


// @TODO finish the rest of the fields
interface MaterialData {
    id: number;
    title: string;
    material_type: string;
    description: string;
    upstream_url: string;
    tags: TagData[];
    materials: MaterialListData[];
    idlist: any[];
}

interface TagData {
    id: number;
    title: string;
    bloom: string;
    type: string;
}

export interface FileLink {
    name: string;
    url: string;
}

interface TreeNode{
  name: string;
  id: any;
  children: TreeNode[];
  idlist: any[];
}

interface OverviewEntity {
    data:  MaterialData | null;
    files: FileLink[];
    fetched: boolean;
    can_edit: boolean;
    can_delete: boolean;
    not_found: boolean;
}

const createEmptyEntity = (): OverviewEntity => {
    return {
        data: null,
        files: [],
        fetched: false,
        can_edit: false,
        can_delete: false,
        not_found: false,
    };
};

const createEmptyTree = (): TreeNode => {
  return {
    id: "null",
    name: "null",
    children: [],
    idlist: [],
  };
};

export const MaterialOverview: FunctionComponent<Props> = (
    {
        history,
        location,
        match,
        api_url,
        force_fetch_data,
        is_admin,
    }
) => {

    const classes = useStyles();

    const [overviewInfo, setOverviewInfo] = React.useState(
        createEmptyEntity()
    );

    const [hover, setHover] = React.useState(1);

    const handleHoverOver = (event: any) => {
        if(event.target === event.currentTarget)
            console.log(event.currentTarget.style.boxShadow)
        event.currentTarget.style.boxShadow= "0px 0px 5px red"
        //setHover(24);
    }

    const handleHoverOff = (event: any) => {
        event.currentTarget.style.boxShadow= ""

    }

    //states for opening the dialog for similar material
    const [open, setOpen] = React.useState(false);
    const [numberOfSearches, setK] = React.useState('');
    const [searchAlgo, setAlgo] = React.useState('pagerank');
    const [searchMatchpool, setSearchMatchpool] = React.useState('all');
    let [ids, setids] = React.useState([] as Number[])



    const handleChange = (event: any) => {
      setK(event.target.value || '');
    };

    const handleAlgoChange = (event: any) => {
      setAlgo(event.target.value || '');
    };

    const handleClickOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };

    if (overviewInfo.fetched && overviewInfo.data !== null && Number(match.params.id) !== overviewInfo.data.id) {
        setOverviewInfo({...overviewInfo, data: null, fetched: false})
    }

    let treeData : TreeNode;

    if (!overviewInfo.fetched || force_fetch_data) {
        const url = api_url + "/data/material/meta?id=" + match.params.id;
        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        let promises: Promise<OverviewEntity>[] = [];
        let promise;
        promise = getJSONData(url, auth).then(resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL")
                return overviewInfo
            } else {
                if (resp['status'] === "OK") {
                    let can_edit = resp['access'] === "owner" || resp['access'] === "write";

                    let can_delete = resp['access'] === "owner";

                    const data = resp['data'];
                    console.log(resp);
                    return {...overviewInfo, fetched: true, data, can_edit, can_delete}
                } else {
                    return  {...overviewInfo, fetched: true, not_found: true};
                }
            }
        })
        promises.push(promise);

        const files_url = api_url + "/data/list_files/material?id=" + match.params.id;
        promise = getJSONData(files_url, auth).then((resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL")
                return {...overviewInfo, fetched: false}
            } else {
                if (resp.status === "OK") {
                    let inner_promises: Promise<FileLink>[] = [];
                    resp.data.forEach((file_name: string) => {
                        const file_get = api_url + "/data/get_file/material?id=" + match.params.id + "&file_key=" + file_name;

                        let inner_promise: Promise<FileLink> = getJSONData(file_get, auth).then((resp) => {
                            if (resp === undefined) {
                                console.log("API SERVER FAIL")
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
                        return {...overviewInfo, files, fetched: false}
                    })
                } else {
                    return {...overviewInfo, fetched: false}
                }
            }
        }));
        promises.push(promise)

        Promise.all(promises).then((values) => {
            let real_data = values.find(e => e.fetched)
            let file_data = values.find(e => !e.fetched) || overviewInfo
            if (real_data) {
                setOverviewInfo({...real_data, files: file_data.files});
            }
        })
    }

    function getMaterialMeta(materialid:Number, td:any, list:any){
        const url = api_url + "/data/material/meta?id=" + materialid;
        const auth = {"Authorization": "bearer " + localStorage.getItem("access_token")};

        let promises: Promise<OverviewEntity>[] = [];
        let promise;
        let data;
        promise = getJSONData(url, auth).then(resp => {
            if (resp === undefined) {
                console.log("API SERVER FAIL")
                return overviewInfo
            } else {
                if (resp['status'] === "OK") {
                    let can_edit = resp['access'] === "owner" || resp['access'] === "write";

                    let can_delete = resp['access'] === "owner";

                    data = resp['data'];
                    populateTree(data, td, list)
                }
            }
        })
    }


    function populateTree(root:any, tree:any, list:any){
        if(root.materials.length <= 0){
            list.push(root.id)
            return
        }
        for(let i = 0; i < root.materials.length; i++){
            let tempBranch = {"name":root.materials[i].title, "id": root.materials[i].id, children: []}
            getMaterialMeta(root.materials[i].id, tempBranch, list);
            tree.children.push(tempBranch);

        }
    }

    let fetched = false;
    function treeView(value:TreeNode){
      if(fetched){
        let ele = (
          <TreeItem  nodeId={`${value.id}`} label={value.name} >
            <div key={`${value.id}`}>
                <ListItemLink
                    history={history}
                    location={location}
                    match={match}
                    primary={value.name} to={"/material/" + value.id} key={value.id}
                />
                {value.children.map((e:TreeNode) => treeView(e))}
            </div>


            </TreeItem>
        )


        return ele
    }


    }

    function button(treeData:any){
      //let b = (<Button component={Link} to={'/searchrelation?matID=' + overviewInfo.data.id + "&k=" + 10} variant="contained" color="primary">Search For Similar Materials</Button>)
      //return b
    }

    let tree = null;
    let but = null;

    treeData = createEmptyTree()

    let list: any[] = [];

      if(overviewInfo.data !== null){
          treeData = {"name": overviewInfo.data.title,
                "id":overviewInfo.data.id,
               "children": [],
             "idlist": []}
          populateTree(overviewInfo.data, treeData, treeData["idlist"]);

          fetched = true
          tree = treeView(treeData)
          //but = button(treeData)
          //list = [list];
          //overviewInfo.data.idlist = list
          for(let i = 0; i < list.length; i++){
            overviewInfo.data.idlist = treeData.idlist
          }
          console.log(overviewInfo.data.idlist)

      }
      useEffect(() =>{
        console.log(list)
        for(let i = 0; i < list.length; i++){
          console.log(i)
        }
        setids(ids.concat(list))
        console.log(ids)
    },[setids])



    let output;
    let count = 0;
    if (overviewInfo.data) {
        output = (
            <div>
                <Container maxWidth="lg" className={classes.container}>
                  <Grid container spacing={3}>

                    <Grid item xs={4} md={4} lg={4}>
                      <Paper onMouseOver={handleHoverOver} onMouseOut={handleHoverOff} className={classes.paper}>
                        <Typography variant={"h5"} className={classes.content}>
                            Authors
                        </Typography>
                        <Typography variant="body1" component="ul" className={classes.contentVertical} >
                            {overviewInfo.data.tags.map((value) => {
                                if (value.type !== "author") {
                                    return null;
                                }

                                return <li key={value.id}>{value.title} </li>;
                            })}
                        </Typography>

                        <Divider/>
                        <Typography variant={"h5"} className={classes.content}>
                            Courses
                        </Typography>
                        <Typography variant="body1" component="ul" className={classes.contentVertical} >
                            {overviewInfo.data.tags.map((value) => {
                                if (value.type !== "course") {
                                    return null;
                                }

                                return <li key={value.id}>{value.title}</li>;
                            })}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={8} lg={8}>
                      <Paper onMouseOver={handleHoverOver} onMouseOut={handleHoverOff} className={classes.paper}>
                         <Typography variant={"h5"} className={classes.content}>
                            Topics
                        </Typography>
                        <Typography variant="body1" component="ul" className={classes.content} >
                            {overviewInfo.data.tags.map((value) => {
                                if (value.type !== "topic") {
                                    return null;
                                }

                                return <li className={classes.horizontalBullets} key={value.id}>{value.title}</li>;
                            })}
                        </Typography>
                        <Divider/>
                         <Typography variant={"h5"} className={classes.content}>
                            Programming Languages
                        </Typography>
                        <Typography variant="body1" component="ul" className={classes.content} >
                            {overviewInfo.data.tags.map((value) => {
                                if (value.type !== "language") {
                                    return null;
                                }

                                return <li className={classes.horizontalBullets} key={value.id}>{value.title}</li>;
                            })}
                        </Typography>
                        <Divider/>
                         <Typography variant={"h5"} className={classes.content}>
                            Datasets
                        </Typography>
                        <Typography variant="body1" component="ul" className={classes.content} >
                            {overviewInfo.data.tags.map((value) => {
                                if (value.type !== "dataset") {
                                    return null;
                                }

                                return <li className={classes.horizontalBullets} key={value.id}>{value.title}</li>;
                            })}
                        </Typography>
                        <Divider/>
                         <Typography variant={"h5"} className={classes.content}>
                            Ontologies
                        </Typography>
                        <Typography variant="body1" component="ul" className={classes.contentVertical} >
                            {overviewInfo.data.tags.map((value) => {
                                if (value.type !== "ontology") {
                                    return null;
                                }

                                return <li className={classes.horizontalBullets} key={value.id}>{value.title}</li>;
                            })}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12}>
                      <Paper id="Materials" onMouseOver={handleHoverOver} onMouseOut={handleHoverOff} className={classes.paper}>
                        <Typography variant={"h5"} className={classes.content}>
                            Mapped Materials
                        </Typography>
                        <TreeView className={classes.materialList} defaultCollapseIcon={<ExpandMoreIcon />}
                                                                  defaultExpandIcon={<ChevronRightIcon />}>
                            {
                                treeData.children.map((e:any) => treeView(e))
                            }


                        </TreeView>

                      </Paper>
                    </Grid>
                  </Grid>
                </Container>
                <Divider/>


                <Divider/>

            </div>
        )

    }



    /*
      <CssBaseline />
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={3}>
            {
            <Grid item xs={12} md={8} lg={9}>
              <Paper className={classes.paper}>

              </Paper>
            </Grid>
            <Grid item xs={12} md={4} lg={3}>
              <Paper className={classes.paper}>

              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper className={classes.paper}>

              </Paper>
            </Grid>
          </Grid>
        </Container>
      </main>
      */
    return (
        <div>
            {
                !overviewInfo.not_found &&
                typeof localStorage.getItem("access_token") === "string" &&
                <Link to={"/material/create?source=" + overviewInfo.data?.id}>
                    <Button className={classes.margin} variant="contained" color="primary">
                        Duplicate
                    </Button>
                </Link>
            }
            <div className={classes.root}>

                {overviewInfo.not_found && <NotFound/>}

                    {overviewInfo.data === null ?
                        <div>
                            {!overviewInfo.not_found && <CircularProgress/>}
                        </div>
                        :
                        <div>

                                    <div className={classes.topButton}>
                                        {overviewInfo.can_edit &&
                                        <Link to={overviewInfo.data.id + "/edit"}>
                                            <Button className={classes.margin} variant="contained" color="primary" startIcon={<EditIcon/>}>
                                                edit
                                            </Button>
                                        </Link>
                                        }
                                        {is_admin &&
                                        <Link to={overviewInfo.data.id + "/edit"}>
                                            <Button className={classes.margin} variant="contained" color="secondary">
                                                edit as admin
                                            </Button>
                                        </Link>
                                        }
                                        {/* <Button variant="contained" color="primary" onClick={handleClickOpen}>Search For Similar Material</Button> */}
                                        <Button component={Link} to={'/searchrelation?matID=' + overviewInfo.data.id + "&k=" + 10} variant="contained" color="primary">Search For Similar Materials</Button>
                                          <Dialog disableBackdropClick disableEscapeKeyDown open={open} onClose={handleClose}>
                                            <DialogTitle>Fill the form</DialogTitle>
                                            <DialogContent>
                                              <form className={classes.container}>
                                                <FormControl className={classes.formControl}>
                                                  <InputLabel htmlFor="demo-dialog-native">Algorithm</InputLabel>
                                                  <Select
                                                    native
                                                    value={searchAlgo}
                                                    onChange={handleAlgoChange}
                                                    input={<Input id="demo-dialog-native" />}
                                                  >
                                                    <option value={'pagerank'}>PageRank</option>
                                                    <option value={'matching'}>Matching</option>
                                                    <option value={'jaccard'}>Jaccard</option>
                                                  </Select>
                                                </FormControl>
                                                <FormControl className={classes.formControl}>
                                                  <InputLabel id="demo-dialog-select-label"># of Results</InputLabel>
                                                  <Select
                                                    labelId="demo-dialog-select-label"
                                                    id="demo-dialog-select"
                                                    value={searchMatchpool}
                                                    onChange = {(event : any) =>{
                                                            setSearchMatchpool(event.target.value);
                                                    }}
                                                    input={<Input />}
                                                  >
                                                    <MenuItem value={"all"}>All</MenuItem>
                                                    <MenuItem value={"pdc"}>PDC</MenuItem>

                                                  </Select>
                                                  <TextField
                                                   className={classes.formControl}
                                                   value={numberOfSearches}
                                                   onChange={handleChange}
                                                   label = "Number Of Matches"></TextField>
                                                </FormControl>
                                              </form>
                                            </DialogContent>
                                            <DialogActions>
                                              <Button onClick={handleClose} color="primary">
                                                Cancel
                                              </Button>
                                              <Button color="primary" component={ Link } to={"/searchrelation?type=search&algo=" + searchAlgo + "&k=" + numberOfSearches + "&matID="+overviewInfo.data.id + "&matchpool="+searchMatchpool}>
                                                Submit
                                              </Button>
                                            </DialogActions>
                                          </Dialog>
                                        {
                                            overviewInfo.files.length !== 0 ?
                                                <div>
                                                    <Typography variant="h5">
                                                        Files
                                                    </Typography>
                                                    {overviewInfo.files.map(file => {
                                                        return <Button className={classes.margin}
                                                                       variant="contained"
                                                                       startIcon={<GetAppIcon/>}
                                                                       target={"_blank"}
                                                                       href={file.url}
                                                                       key={file.name}
                                                                       download={true}
                                                        >
                                                            {file.name}
                                                        </Button>
                                                    })}


                                            <Divider/>
                                        </div>
                                        :
                                        <div/>
                                }

                                {overviewInfo.can_delete &&
                                <DeleteDialog id={overviewInfo.data.id} name={overviewInfo.data.title} api_url={api_url}
                                              on_success={() => {
                                                  history.push({
                                                      pathname: "/my_materials",
                                                  });}}
                                              endpoint={"/data/delete/material?id=" + overviewInfo.data.id}
                                />
                                }
                            </div>
                            <Divider/>
                            <Typography variant={"h3"}>
                                {MaterialTypesArray.find(e => e.value === overviewInfo.data?.material_type)?.label}
                            </Typography>
                            <Typography variant="h4" component="h3" className={classes.root}>
                                {overviewInfo.data.title}
                            </Typography>
                            <Divider/>
                            <Typography variant={"h5"} className={classes.content}>
                                Upstream URL <a target={"_blank"} href={overviewInfo.data.upstream_url} className={classes.link}>
                                {overviewInfo.data.upstream_url}
                            </a>
                            </Typography>

                            <Divider/>
                            <Typography variant={"h5"} className={classes.content}>
                                Description
                            </Typography>
                            <Typography variant="body1" component="p" className={classes.content} >
                                {overviewInfo.data.description}
                            </Typography>
                            <Divider/>
                            {output}
                            <Divider/>
                        </div>
                    }

            </div>
        </div>
    )
};
