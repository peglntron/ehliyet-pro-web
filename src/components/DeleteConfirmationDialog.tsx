import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  content: string;
  loading?: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  content,
  loading = false
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 600 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          İptal
        </Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          autoFocus
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          variant="contained"
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          {loading ? 'Siliniyor...' : 'Evet, Sil'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
