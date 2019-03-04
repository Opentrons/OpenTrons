// @flow
import * as React from 'react'
import {Link} from 'react-router-dom'
import {Formik, Form} from 'formik'
import startCase from 'lodash/startCase'
import mapValues from 'lodash/mapValues'
import pick from 'lodash/pick'
import set from 'lodash/set'
import forOwn from 'lodash/forOwn'
import isEmpty from 'lodash/isEmpty'

import FormButtonBar from './FormButtonBar'
import ConfigFormGroup, {FormColumn} from './ConfigFormGroup'

import type {
  Pipette,
  PipetteSettingsField,
  PipetteConfigResponse,
  PipetteConfigFields,
  PipetteConfigRequest,
} from '../../http-api-client'

import type {FormValues} from './ConfigFormGroup'

export type DisplayFieldProps = PipetteSettingsField & {
  name: string,
  displayName: string,
}

type Props = {
  parentUrl: string,
  pipette: Pipette,
  pipetteConfig: PipetteConfigResponse,
  updateConfig: (id: string, PipetteConfigRequest) => mixed,
}

const PLUNGER_KEYS = ['top', 'bottom', 'blowout', 'dropTip']
const POWER_KEYS = ['plungerCurrent', 'pickUpCurrent', 'dropTipCurrent']
const TIP_KEYS = ['dropTipSpeed', 'pickUpDistance']

export default class ConfigForm extends React.Component<Props> {
  getFieldsByKey (
    keys: Array<string>,
    fields: PipetteConfigFields
  ): Array<DisplayFieldProps> {
    return keys.map(k => {
      const field = fields[k]
      const displayName = startCase(k)
      const name = k
      return {
        ...field,
        name,
        displayName,
      }
    })
  }

  getVisibleFields = () => {
    return pick(this.props.pipetteConfig.fields, [
      ...PLUNGER_KEYS,
      ...POWER_KEYS,
      ...TIP_KEYS,
    ])
  }

  handleSubmit = (values: FormValues) => {
    const params = mapValues(values, v => {
      let param
      if (!v) {
        param = null
      } else {
        param = {value: Number(v)}
      }
      return param
    })
    this.props.updateConfig(this.props.pipette.id, {fields: {...params}})
  }

  getFieldValue (
    key: string,
    fields: Array<DisplayFieldProps>,
    values: FormValues
  ): number {
    const field = fields.find(f => f.name === key)
    const _default = field && field.default
    const value = values[key] || _default
    return Number(value)
  }

  validate = (values: FormValues) => {
    let errors = {}
    const fields = this.getVisibleFields()
    const plungerFields = this.getFieldsByKey(PLUNGER_KEYS, fields)

    // validate all visible fields with min and max
    forOwn(fields, (field, name) => {
      const {min, max} = field
      const value = Number(values[name])
      const valueEntered = value || value !== 0

      if (valueEntered && min && max && (value < min || value > max)) {
        set(errors, name, `Min ${min} / Max ${max}`)
      }
    })

    const plungerGroupError =
      'Please ensure the following: \n top > bottom > blowout > droptip'
    const top = this.getFieldValue('top', plungerFields, values)
    const bottom = this.getFieldValue('bottom', plungerFields, values)
    const blowout = this.getFieldValue('blowout', plungerFields, values)
    const dropTip = this.getFieldValue('dropTip', plungerFields, values)
    if (top <= bottom || bottom <= blowout || blowout <= dropTip) {
      set(errors, 'plungerError', plungerGroupError)
    }

    return errors
  }

  render () {
    const {parentUrl} = this.props
    const fields = this.getVisibleFields()
    const initialValues = mapValues(fields, f => {
      return f.value !== f.default ? f.value.toString() : null
    })
    const plungerFields = this.getFieldsByKey(PLUNGER_KEYS, fields)
    const powerFields = this.getFieldsByKey(POWER_KEYS, fields)
    const tipFields = this.getFieldsByKey(TIP_KEYS, fields)

    return (
      <Formik
        onSubmit={this.handleSubmit}
        initialValues={initialValues}
        validate={this.validate}
        validateOnChange={false}
        render={formProps => {
          const {
            values,
            handleChange,
            handleBlur,
            handleReset,
            errors,
            touched,
          } = formProps
          const disableSubmit = !isEmpty(errors)
          return (
            <Form>
              <FormColumn>
                <ConfigFormGroup
                  groupLabel="Plunger Positions"
                  groupError={errors.plungerError}
                  values={values}
                  formFields={plungerFields}
                  onChange={handleChange}
                  errors={errors}
                  onBlur={handleBlur}
                  touched={touched}
                />
                <ConfigFormGroup
                  groupLabel="Power / Force"
                  values={values}
                  formFields={powerFields}
                  onChange={handleChange}
                  errors={errors}
                  onBlur={handleBlur}
                  touched={touched}
                />
              </FormColumn>
              <FormColumn>
                <ConfigFormGroup
                  groupLabel="Tip Pickup / Drop "
                  values={values}
                  formFields={tipFields}
                  onChange={handleChange}
                  errors={errors}
                  onBlur={handleBlur}
                  touched={touched}
                />
              </FormColumn>
              <FormButtonBar
                buttons={[
                  {children: 'reset all', onClick: handleReset},
                  {children: 'cancel', Component: Link, to: parentUrl},
                  {children: 'save', type: 'submit', disabled: disableSubmit},
                ]}
              />
            </Form>
          )
        }}
      />
    )
  }
}
