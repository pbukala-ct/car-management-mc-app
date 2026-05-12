import { defineMessages } from 'react-intl';

export default defineMessages({
  title: { id: 'DeleteConfirmModal.title', defaultMessage: 'Delete Look' },
  message: {
    id: 'DeleteConfirmModal.message',
    defaultMessage: 'Are you sure you want to delete "{name}"? This cannot be undone.',
  },
  confirm: { id: 'DeleteConfirmModal.confirm', defaultMessage: 'Delete' },
  cancel: { id: 'DeleteConfirmModal.cancel', defaultMessage: 'Cancel' },
});
