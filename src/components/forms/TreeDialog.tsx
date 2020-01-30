import React, {FunctionComponent} from "react";
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import OntologyTree from './OntologyTree'

export const TreeDialog: FunctionComponent = () => {


    return (
        <div>

            <Dialog
                open={true}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">tree</DialogTitle>
                <DialogContent>
                    <OntologyTree/>
                </DialogContent>



            </Dialog>
        </div>
    )
};