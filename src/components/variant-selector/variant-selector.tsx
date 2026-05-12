import { useState, type SyntheticEvent } from 'react';
import { useIntl } from 'react-intl';
import { FormDialog } from '@commercetools-frontend/application-components';
import { getVariantPrice } from '../../helpers';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import RadioInput from '@commercetools-uikit/radio-input';
import type { TProductVariant } from '../../types';
import messages from './messages';

type Props = {
  variants: TProductVariant[];
  selectedVariantId: number;
  isOpen: boolean;
  onConfirm: (variantId: number) => void;
  onClose: () => void;
};

const VariantSelector = ({
  variants,
  selectedVariantId,
  isOpen,
  onConfirm,
  onClose,
}: Props) => {
  const intl = useIntl();
  const [selected, setSelected] = useState<number>(selectedVariantId);

  return (
    <FormDialog
      title={intl.formatMessage(messages.title)}
      isOpen={isOpen}
      onClose={onClose}
      isPrimaryButtonDisabled={false}
      onPrimaryButtonClick={(_e: SyntheticEvent) => onConfirm(selected)}
      onSecondaryButtonClick={(_e: SyntheticEvent) => onClose()}
      labelPrimary={intl.formatMessage(messages.confirm)}
      labelSecondary={intl.formatMessage(messages.cancel)}
    >
      <Spacings.Stack scale="m">
        {variants.map((variant) => {
          const price = getVariantPrice(variant);
          const image = variant.images[0]?.url;
          return (
            <Spacings.Inline key={variant.id} alignItems="center" scale="m">
              <RadioInput.Option
                value={String(variant.id)}
                isChecked={selected === variant.id}
                onChange={() => setSelected(variant.id)}
              >
                <Spacings.Inline alignItems="center" scale="m">
                  {image && (
                    <img
                      src={image}
                      alt={variant.sku ?? ''}
                      style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                    />
                  )}
                  <Spacings.Stack scale="xs">
                    <Text.Body isBold>
                      {variant.sku ?? intl.formatMessage(messages.noSku)}
                    </Text.Body>
                    {price && <Text.Detail>{price}</Text.Detail>}
                  </Spacings.Stack>
                </Spacings.Inline>
              </RadioInput.Option>
            </Spacings.Inline>
          );
        })}
      </Spacings.Stack>
    </FormDialog>
  );
};

VariantSelector.displayName = 'VariantSelector';
export default VariantSelector;
