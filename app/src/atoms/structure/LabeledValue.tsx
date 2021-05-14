import * as React from 'react'
import {
  Box,
  Text,
  TEXT_TRANSFORM_CAPITALIZE,
  FONT_BODY_1_DARK,
  FONT_WEIGHT_SEMIBOLD,
} from '@opentrons/components'
import type { StyleProps } from '@opentrons/components'

interface Props extends StyleProps {
  label: string | React.ReactNode,
  value: string | React.ReactNode,
  labelProps?: React.ComponentProps<typeof Text>,
  valueProps?: React.ComponentProps<typeof Text>,
}

export function LabeledValue(props: Props): JSX.Element {
  const {
    label,
    value,
    labelProps = {},
    valueProps = {},
    ...wrapperProps
  } = props
  return (
    <Box css={FONT_BODY_1_DARK} lineHeight={1.5} {...wrapperProps}>
      <Text
        fontWeight={FONT_WEIGHT_SEMIBOLD}
        margin="0 0 0.25rem"
        textTransform={TEXT_TRANSFORM_CAPITALIZE}
        {...labelProps}
      >
        {label}
      </Text>
      <Text margin="0" {...valueProps}>
        {value}
      </Text>
    </Box>
  )
}
