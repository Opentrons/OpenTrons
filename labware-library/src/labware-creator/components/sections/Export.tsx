import cx from 'classnames'
import * as React from 'react'
import { useFormikContext } from 'formik'
import { PrimaryBtn } from '@opentrons/components'
import { reportEvent } from '../../../analytics'
import { LabwareFields } from '../../fields'
import { isEveryFieldHidden } from '../../utils'
import { pipetteNameOptions } from '../../labwareTestProtocol'
import { FormAlerts } from '../alerts/FormAlerts'
import { Dropdown } from '../Dropdown'
import { LinkOut } from '../LinkOut'
import { SectionBody } from './SectionBody'
import styles from '../../styles.css'

const PDF_URL =
  'https://opentrons-publications.s3.us-east-2.amazonaws.com/labwareDefinition_testGuide.pdf'

interface ExportProps {
  onExportClick: (e: React.MouseEvent) => unknown
}

export const Export = (props: ExportProps): JSX.Element | null => {
  const fieldList: Array<keyof LabwareFields> = ['pipetteName']
  const { values, errors, touched } = useFormikContext<LabwareFields>()

  if (isEveryFieldHidden(fieldList, values)) {
    return null
  }

  return (
    <SectionBody label="Labware Test Protocol">
      <FormAlerts touched={touched} errors={errors} fieldList={fieldList} />

      <div className={cx(styles.flex_row, styles.flex_row_start)}>
        <div className={styles.instructions_column}>
          <p>
            Your file will be exported with a protocol that will help you test
            and troubleshoot your labware definition on the robot. The protocol
            requires a Single Channel pipette on the right mount of your robot.
          </p>
        </div>
        <div className={styles.pipette_field_wrapper}>
          <Dropdown name="pipetteName" options={pipetteNameOptions} />
        </div>
      </div>
      <div className={styles.export_section}>
        <div className={cx(styles.callout, styles.export_callout)}>
          <h4 className={styles.test_labware_heading}>
            Please test your definition file!
          </h4>

          <p>
            Use the labware test protocol contained in the downloaded file to
            check the accuracy of your definition. It’s important to create
            definitions that are precise and do not rely on excessive
            calibration prior to each run to achieve accuracy.
          </p>
          <p>Use the test guide to troubleshoot your definition.</p>
          <LinkOut
            onClick={() =>
              reportEvent({
                name: 'labwareCreatorClickTestLabware',
              })
            }
            href={PDF_URL}
            className={styles.test_guide_button}
          >
            view test guide
          </LinkOut>
        </div>
        <PrimaryBtn
          className={styles.export_button}
          onClick={props.onExportClick}
        >
          EXPORT FILE
        </PrimaryBtn>
      </div>
    </SectionBody>
  )
}