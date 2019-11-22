// @flow
import * as React from 'react'
import { connect } from 'react-redux'
import moment from 'moment'

import {
  getProtocolName,
  getProtocolAuthor,
  getProtocolLastUpdated,
  getProtocolMethod,
  getProtocolDescription,
} from '../../protocol'
import { selectors as robotSelectors } from '../../robot'
import { LabeledValue } from '@opentrons/components'
import InfoSection from './InfoSection'
import { SectionContentHalf, CardRow } from '../layout'

import type { State } from '../../types'

type Props = {
  name: ?string,
  author: ?string,
  lastUpdated: ?number,
  method: ?string,
  description: ?string,
  apiLevel: ?[number, number],
}

const INFO_TITLE = 'Information'
const DESCRIPTION_TITLE = 'Description'
const DATE_FORMAT = 'DD MMM Y, hh:mmA'

export default connect<Props, {||}, _, _, _, _>(mapStateToProps)(
  InformationCard
)

function InformationCard(props: Props) {
  const { name, author, method, description, apiLevel } = props
  const lastUpdated = props.lastUpdated
    ? moment(props.lastUpdated).format(DATE_FORMAT)
    : '-'
  const formattedApiLevel = apiLevel ? `${apiLevel[0]}.${apiLevel[1]}` : null
  return (
    <React.Fragment>
      <InfoSection title={INFO_TITLE}>
        <CardRow>
          <SectionContentHalf>
            <LabeledValue label="Protocol Name" value={name || '-'} />
          </SectionContentHalf>
          <SectionContentHalf>
            <LabeledValue label="Organization/Author" value={author || '-'} />
          </SectionContentHalf>
        </CardRow>
        <CardRow>
          <SectionContentHalf>
            <LabeledValue label="Last Updated" value={lastUpdated} />
          </SectionContentHalf>
          <SectionContentHalf>
            <LabeledValue label="Creation Method" value={method || '-'} />
          </SectionContentHalf>
        </CardRow>
        <CardRow>
          <SectionContentHalf>
            <LabeledValue
              label="Protocol API Version"
              value={formattedApiLevel || '-'}
            />
          </SectionContentHalf>
        </CardRow>
      </InfoSection>
      {description && (
        <InfoSection title={DESCRIPTION_TITLE}>
          <p>{description}</p>
        </InfoSection>
      )}
    </React.Fragment>
  )
}

function mapStateToProps(state: State): $Exact<Props> {
  return {
    name: getProtocolName(state),
    author: getProtocolAuthor(state),
    lastUpdated: getProtocolLastUpdated(state),
    method: getProtocolMethod(state),
    description: getProtocolDescription(state),
    apiLevel: robotSelectors.getApiLevel(state),
  }
}
