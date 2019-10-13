import React, {FunctionComponent} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {Login} from "./Login";
import makeStyles from "@material-ui/core/styles/makeStyles";


const useStyles = makeStyles(theme => {

});

interface LoginProps {
    updateId: (id: number) => void;
};


export const LoginDialog: FunctionComponent<LoginProps> = ({updateId}) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button color="inherit" onClick={handleClickOpen}>
          Login
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Login"}</DialogTitle>
        <DialogContent>
            <Login updateId={updateId}/>
        </DialogContent>
      </Dialog>
    </div>
  );
}