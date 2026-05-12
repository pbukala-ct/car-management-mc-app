import { useIntl } from 'react-intl';
import type { BundleStatus } from '../../types';
import messages from './messages';

const styles: Record<BundleStatus, React.CSSProperties> = {
  active: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    background: '#d4f0d0',
    color: '#1d7a1d',
  },
  draft: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    background: '#fdf0c0',
    color: '#7a5c00',
  },
};

type Props = { status: BundleStatus };

const StatusBadge = ({ status }: Props) => {
  const intl = useIntl();
  return (
    <span style={styles[status]}>
      {status === 'active'
        ? intl.formatMessage(messages.active)
        : intl.formatMessage(messages.draft)}
    </span>
  );
};

StatusBadge.displayName = 'StatusBadge';
export default StatusBadge;
