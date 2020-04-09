// @flow

import React from 'react'
import * as Formik from 'formik'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import { ModelDropdown } from '../ModelDropdown'

describe('Model Dropdown', () => {
  let mockStore
  let props

  beforeEach(() => {
    props = {
      moduleType: '',
      selectedModule: '',
      onChange: jest.fn(),
    }
    mockStore = {
      dispatch: jest.fn(),
      subscribe: jest.fn(),
      getState: () => ({}),
    }
  })
  const render = props =>
    mount(
      <Provider store={mockStore}>
        <ModelDropdown {...props} />
      </Provider>
    )

  it('should initially be empty with no option filled in', () => {
    const wrapper = render(props)
  })
})
