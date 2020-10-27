// @flow
import * as React from 'react'
import { mountWithStore } from '@opentrons/components/__utils__'
import { act } from 'react-dom/test-utils'

import { AskForCalibrationBlockModal } from '../AskForCalibrationBlockModal'
import { SecondaryBtn, CheckboxField } from '@opentrons/components'
import { setUseTrashSurfaceForTipCal } from '../../../calibration'

describe('AskForCalibrationBlockModal', () => {
  let onResponse
  let render

  beforeEach(() => {
    onResponse = jest.fn()
    render = (initialValue: boolean | null = null) =>
      mountWithStore(<AskForCalibrationBlockModal onResponse={onResponse} />, {
        initialState: {
          config: { calibration: { useTrashSurfaceForTipCal: initialValue } },
        },
      })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const findCalBlockModal = wrapper => wrapper.find(AskForCalibrationBlockModal)
  const findHaveBlock = wrapper =>
    findCalBlockModal(wrapper)
      .find(SecondaryBtn)
      .at(0)
  const findUseTrash = wrapper =>
    findCalBlockModal(wrapper)
      .find(SecondaryBtn)
      .at(1)
  const findRemember = wrapper =>
    findCalBlockModal(wrapper)
      .find(CheckboxField)
      .first()

  const SPECS = [
    {
      it: 'no dispatch when block is picked but not saved',
      save: false,
      savedVal: null,
      useTrash: false,
    },
    {
      it: 'no dispatch when trash is picked but not saved',
      save: false,
      savedVal: null,
      useTrash: true,
    },
    {
      it: 'dispatches config command when block is picked and saved',
      save: true,
      savedVal: true,
      useTrash: false,
    },
    {
      it: 'dispatches config command when trash is picked and saved',
      save: true,
      savedVal: false,
      useTrash: true,
    },
  ]
  SPECS.forEach(spec => {
    it(spec.it, () => {
      const { wrapper, store } = render(null)
      expect(wrapper.exists(AskForCalibrationBlockModal)).toBe(true)
      findRemember(wrapper).invoke('onChange')({
        currentTarget: { checked: spec.save },
      })

      act(() => {
        spec.useTrash
          ? findUseTrash(wrapper).invoke('onClick')()
          : findHaveBlock(wrapper).invoke('onClick')()
      })
      if (spec.save) {
        wrapper.update()
        expect(store.dispatch).toHaveBeenCalledWith(
          setUseTrashSurfaceForTipCal(!spec.savedVal)
        )
      } else {
        expect(store.dispatch).not.toHaveBeenCalled()
      }
      expect(onResponse).toHaveBeenCalledWith(!spec.useTrash)
    })
  })
})
