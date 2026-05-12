import type { SyntheticEvent } from 'react';
import { useIntl } from 'react-intl';
import { ConfirmationDialog } from '@commercetools-frontend/application-components';
import messages from './messages';

type Props = {
  bundleName: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const DeleteConfirmModal = ({ bundleName, isOpen, onConfirm, onCancel }: Props) => {
  const intl = useIntl();
  return (
    <ConfirmationDialog
      title={intl.formatMessage(messages.title)}
      isOpen={isOpen}
      onClose={onCancel}
      onCancel={(_e: SyntheticEvent) => onCancel()}
      onConfirm={(_e: SyntheticEvent) => onConfirm()}
      labelPrimary={intl.formatMessage(messages.confirm)}
      labelSecondary={intl.formatMessage(messages.cancel)}
    >
      <p>
        {intl.formatMessage(messages.message, { name: bundleName })}
      </p>
    </ConfirmationDialog>
  );
};

DeleteConfirmModal.displayName = 'DeleteConfirmModal';
export default DeleteConfirmModal;
