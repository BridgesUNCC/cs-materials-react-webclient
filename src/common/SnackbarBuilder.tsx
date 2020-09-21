import React, {FunctionComponent, useEffect} from "react";
import SnackbarContentWrapper, {variantIcon} from "./SnackbarContentWrapper";
import Snackbar from '@material-ui/core/Snackbar';

export interface SnackbarBuilderProps {
    variant: keyof typeof variantIcon;
    message: string;
    className?: string;
    starts_open: boolean;
    clearProps?: () => void;
}

export const emptySnackbarBuilderProps = (previous?: SnackbarBuilderProps): SnackbarBuilderProps => {
    return {
        // if had a previous variant, use that to prevent the color from changing as closing
        variant: previous?.variant || "info",
        message: "",
        starts_open: false,
    };
};

export const buildSnackbarProps = (variant: keyof typeof variantIcon,
                                   message: string,
                                   className?: string,
) => {

    return {
        variant: variant,
        message: message,
        className: className || "",
        starts_open: true,
    }
}

export const BuildSnackbar: FunctionComponent<SnackbarBuilderProps> = ({
                                                                           variant,
                                                                           message,
                                                                           className,
                                                                           clearProps,
                                                                           starts_open
}) => {
    let [open, setOpen] = React.useState(starts_open);

    useEffect(() => {
        if (starts_open) {
            setOpen(true);
        }
    }, [message, starts_open]);

    const handleClose = (event?: object, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        if (clearProps) {
            clearProps();
        }
        setOpen(false);
    }

    return (
        <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
            <SnackbarContentWrapper className={className}
                                    variant={variant}
                                    message={message}
                                    onClose={() => handleClose()}/>
        </Snackbar>
    )
}