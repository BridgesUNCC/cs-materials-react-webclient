import React, {FunctionComponent} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {Login} from "./Login";
import {Register} from "./Register";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles, Theme} from "@material-ui/core";


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    margin: {
      margin: theme.spacing(1),
    },
    extendedIcon: {
      marginRight: theme.spacing(1),
    },
  }),
);

interface LoginProps {
    updateId: (id: number) => void;
}

interface RegisterLoginEntity {
    login: boolean;
    register: boolean;
}

const createEmptyEntity = (): RegisterLoginEntity => ({
   login: false,
   register: false,
});


export const LoginDialog: FunctionComponent<LoginProps> = ({updateId}) => {
  const [registerLogin, setRegisterLogin] = React.useState<RegisterLoginEntity>(
      createEmptyEntity()
  );
  const classes = useStyles();

  const handleLoginOpen = () => {
    setRegisterLogin({
        login: true,
        register: false,
    });
  };

  const handleRegisterOpen = () => {
      setRegisterLogin({
          login: false,
          register: true,
      });
  };

  const handleClose = () => {
    setRegisterLogin({
        login: false,
        register: false,
    });
  };

    return (
        <div>
            <Button className={classes.margin} variant="text" color="inherit" onClick={handleRegisterOpen}>
                Register
            </Button>
            <Dialog
                open={registerLogin.register}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Register"}</DialogTitle>
                <DialogContent>
                    <Register updateId={updateId} openLogin={handleLoginOpen}/>
                </DialogContent>
            </Dialog>


            <Button className={classes.margin} variant="contained" color="primary" onClick={handleLoginOpen}>
                Login
            </Button>
            <Dialog
                open={registerLogin.login}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Login"}</DialogTitle>
                <DialogContent>
                    <Login updateId={updateId} openRegister={handleRegisterOpen}/>
                </DialogContent>
            </Dialog>
        </div>

    );
};