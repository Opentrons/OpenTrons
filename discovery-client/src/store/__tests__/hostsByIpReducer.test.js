// @flow
// discovery client reducer
import {
  mockHealthResponse,
  mockServerHealthResponse,
  mockHealthErrorJsonResponse,
} from '../../__fixtures__/health'

import * as Actions from '../actions'
import { reducer, hostsByIpReducer } from '../reducer'

describe('hostsByIp reducer', () => {
  it('should return an empty initial state', () => {
    const state = reducer(undefined, ({}: any))
    expect(state.hostsByIp).toEqual({})
  })

  it('should handle an "mdns:SERVICE_FOUND" action for a new ip', () => {
    const action = Actions.serviceFound('opentrons-dev', '127.0.0.1', 31950)
    const initialState = {}

    expect(hostsByIpReducer(initialState, action)).toEqual({
      '127.0.0.1': {
        ip: '127.0.0.1',
        port: 31950,
        seen: true,
        ok: null,
        serverOk: null,
        healthError: null,
        serverHealthError: null,
        robotName: 'opentrons-dev',
      },
    })
  })

  it('should handle an "mdns:SERVICE_FOUND" action for an existing, un-polled ip', () => {
    const action = Actions.serviceFound('opentrons-dev', '127.0.0.1', 31950)
    const initialState = {
      '127.0.0.1': {
        ip: '127.0.0.1',
        port: 31950,
        seen: false,
        ok: null,
        serverOk: null,
        healthError: null,
        serverHealthError: null,
        robotName: 'opentrons-dev',
      },
    }
    const nextState = hostsByIpReducer(initialState, action)

    expect(nextState).toEqual({
      '127.0.0.1': {
        ip: '127.0.0.1',
        port: 31950,
        seen: true,
        ok: null,
        serverOk: null,
        healthError: null,
        serverHealthError: null,
        robotName: 'opentrons-dev',
      },
    })
  })

  it('should handle an "mdns:SERVICE_FOUND" action for an existing, polled ip', () => {
    const action = Actions.serviceFound('opentrons-dev', '127.0.0.1', 31950)
    const initialState = {
      '127.0.0.1': {
        ip: '127.0.0.1',
        port: 31950,
        seen: true,
        ok: true,
        serverOk: false,
        healthError: null,
        serverHealthError: mockHealthErrorJsonResponse,
        robotName: 'opentrons-dev',
      },
    }
    const nextState = hostsByIpReducer(initialState, action)

    // ensure new object is _not_ created
    expect(nextState).toBe(initialState)
  })

  it('should handle an "mdns:SERVICE_FOUND" action for an existing ip with an old robot name', () => {
    const action = Actions.serviceFound('opentrons-dev', '127.0.0.1', 31950)
    const initialState = {
      '127.0.0.1': {
        ip: '127.0.0.1',
        port: 31950,
        seen: false,
        ok: false,
        serverOk: false,
        healthError: mockHealthErrorJsonResponse,
        serverHealthError: mockHealthErrorJsonResponse,
        robotName: 'opentrons-old-dev',
      },
    }
    const nextState = hostsByIpReducer(initialState, action)

    expect(nextState).toEqual({
      '127.0.0.1': {
        ip: '127.0.0.1',
        port: 31950,
        seen: true,
        ok: null,
        serverOk: null,
        healthError: null,
        serverHealthError: null,
        robotName: 'opentrons-dev',
      },
    })
  })

  it('should handle an "http:HEALTH_POLLED" action for a new ip', () => {
    const action = Actions.healthPolled(
      '127.0.0.1',
      31950,
      mockHealthResponse,
      mockServerHealthResponse
    )
    const initialState = {}
    const nextState = hostsByIpReducer(initialState, action)

    expect(nextState).toEqual({
      '127.0.0.1': {
        ip: '127.0.0.1',
        port: 31950,
        seen: true,
        ok: true,
        serverOk: true,
        healthError: null,
        serverHealthError: null,
        robotName: 'opentrons-dev',
      },
    })
  })

  it('should handle a good "http:HEALTH_POLLED" action for an existing ip', () => {
    const action = Actions.healthPolled(
      '127.0.0.1',
      31950,
      mockHealthResponse,
      mockServerHealthResponse
    )
    const initialState = {
      '127.0.0.1': {
        ip: '127.0.0.1',
        port: 31950,
        seen: false,
        ok: false,
        serverOk: false,
        healthError: mockHealthErrorJsonResponse,
        serverHealthError: mockHealthErrorJsonResponse,
        robotName: 'opentrons-dev',
      },
    }
    const nextState = hostsByIpReducer(initialState, action)

    expect(nextState).toEqual({
      '127.0.0.1': {
        ip: '127.0.0.1',
        port: 31950,
        seen: true,
        ok: true,
        serverOk: true,
        healthError: null,
        serverHealthError: null,
        robotName: 'opentrons-dev',
      },
    })
  })

  it('should handle a good "http:HEALTH_POLLED" action for an existing ip with the wrong robot name', () => {
    const action = Actions.healthPolled(
      '127.0.0.1',
      31950,
      mockHealthResponse,
      mockServerHealthResponse
    )
    const initialState = {
      '127.0.0.1': {
        ip: '127.0.0.1',
        port: 31950,
        seen: false,
        ok: false,
        serverOk: false,
        healthError: mockHealthErrorJsonResponse,
        serverHealthError: mockHealthErrorJsonResponse,
        robotName: 'not-opentrons-dev',
      },
    }
    const nextState = hostsByIpReducer(initialState, action)

    expect(nextState).toEqual({
      '127.0.0.1': {
        ip: '127.0.0.1',
        port: 31950,
        seen: true,
        ok: true,
        serverOk: true,
        healthError: null,
        serverHealthError: null,
        robotName: 'opentrons-dev',
      },
    })
  })

  it('should handle a good "http:HEALTH_POLLED" action that does not change the state', () => {
    const action = Actions.healthPolled(
      '127.0.0.1',
      31950,
      mockHealthResponse,
      mockServerHealthResponse
    )
    const initialState = {
      '127.0.0.1': {
        ip: '127.0.0.1',
        port: 31950,
        seen: true,
        ok: true,
        serverOk: true,
        healthError: null,
        serverHealthError: null,
        robotName: 'opentrons-dev',
      },
    }
    const nextState = hostsByIpReducer(initialState, action)

    expect(nextState).toBe(initialState)
  })

  it('should not reset seen nor robotName with a bad health poll', () => {
    const action = Actions.healthPolled(
      '127.0.0.1',
      31950,
      null,
      null,
      mockHealthErrorJsonResponse,
      mockHealthErrorJsonResponse
    )
    const initialState = {
      '127.0.0.1': {
        ip: '127.0.0.1',
        port: 31950,
        seen: true,
        ok: true,
        serverOk: true,
        healthError: null,
        serverHealthError: null,
        robotName: 'opentrons-dev',
      },
    }
    const nextState = hostsByIpReducer(initialState, action)

    expect(nextState).toEqual({
      '127.0.0.1': {
        ip: '127.0.0.1',
        port: 31950,
        seen: true,
        ok: false,
        serverOk: false,
        healthError: mockHealthErrorJsonResponse,
        serverHealthError: mockHealthErrorJsonResponse,
        robotName: 'opentrons-dev',
      },
    })
  })

  it('a good health poll will remove any un-seen un-health IPs for the same robot', () => {
    const action = Actions.healthPolled(
      '127.0.0.1',
      31950,
      mockHealthResponse,
      mockServerHealthResponse
    )
    const initialState = {
      '127.0.0.2': {
        ip: '127.0.0.2',
        port: 31950,
        seen: false,
        ok: null,
        serverOk: null,
        healthError: null,
        serverHealthError: null,
        robotName: 'opentrons-dev',
      },
      '127.0.0.3': {
        ip: '127.0.0.3',
        port: 31950,
        seen: true,
        ok: false,
        serverOk: false,
        healthError: mockHealthErrorJsonResponse,
        serverHealthError: mockHealthErrorJsonResponse,
        robotName: 'opentrons-dev',
      },
      '127.0.0.4': {
        ip: '127.0.0.4',
        port: 31950,
        seen: false,
        ok: false,
        serverOk: false,
        healthError: mockHealthErrorJsonResponse,
        serverHealthError: mockHealthErrorJsonResponse,
        robotName: 'opentrons-dev',
      },
      '127.0.0.5': {
        ip: '127.0.0.5',
        port: 31950,
        seen: false,
        ok: false,
        serverOk: false,
        healthError: mockHealthErrorJsonResponse,
        serverHealthError: mockHealthErrorJsonResponse,
        robotName: 'opentrons-other',
      },
    }
    const nextState = hostsByIpReducer(initialState, action)

    expect(nextState).toEqual({
      '127.0.0.1': {
        ip: '127.0.0.1',
        port: 31950,
        seen: true,
        ok: true,
        serverOk: true,
        healthError: null,
        serverHealthError: null,
        robotName: 'opentrons-dev',
      },
      '127.0.0.2': {
        ip: '127.0.0.2',
        port: 31950,
        seen: false,
        ok: null,
        serverOk: null,
        healthError: null,
        serverHealthError: null,
        robotName: 'opentrons-dev',
      },
      '127.0.0.3': {
        ip: '127.0.0.3',
        port: 31950,
        seen: true,
        ok: false,
        serverOk: false,
        healthError: mockHealthErrorJsonResponse,
        serverHealthError: mockHealthErrorJsonResponse,
        robotName: 'opentrons-dev',
      },
      '127.0.0.5': {
        ip: '127.0.0.5',
        port: 31950,
        seen: false,
        ok: false,
        serverOk: false,
        healthError: mockHealthErrorJsonResponse,
        serverHealthError: mockHealthErrorJsonResponse,
        robotName: 'opentrons-other',
      },
    })
  })

  it('should handle "client:ADD_IP_ADDRESS" for new address', () => {
    const action = Actions.addIpAddress('127.0.0.1')
    const initialState = {}
    const nextState = hostsByIpReducer(initialState, action)

    expect(nextState).toEqual({
      '127.0.0.1': {
        ip: '127.0.0.1',
        port: 31950,
        seen: false,
        ok: null,
        serverOk: null,
        healthError: null,
        serverHealthError: null,
        robotName: null,
      },
    })
  })

  it('should noop "client:ADD_IP_ADDRESS" for existing address', () => {
    const action = Actions.addIpAddress('127.0.0.1')
    const initialState = {
      '127.0.0.1': {
        ip: '127.0.0.1',
        port: 31950,
        seen: true,
        ok: true,
        serverOk: true,
        healthError: null,
        serverHealthError: null,
        robotName: 'opentrons-dev',
      },
    }
    const nextState = hostsByIpReducer(initialState, action)

    expect(nextState).toBe(initialState)
  })

  it('should handle "client:REMOVE_IP_ADDRESS" for unseen address', () => {
    const action = Actions.removeIpAddress('127.0.0.1')
    const initialState = {
      '127.0.0.1': {
        ip: '127.0.0.1',
        port: 31950,
        seen: false,
        ok: null,
        serverOk: null,
        healthError: null,
        serverHealthError: null,
        robotName: null,
      },
    }
    const nextState = hostsByIpReducer(initialState, action)

    expect(nextState).toEqual({})
  })

  it('should noop "client:REMOVE_IP_ADDRESS" for seen address', () => {
    const action = Actions.removeIpAddress('127.0.0.1')
    const initialState = {
      '127.0.0.1': {
        ip: '127.0.0.1',
        port: 31950,
        seen: true,
        ok: true,
        serverOk: true,
        healthError: null,
        serverHealthError: null,
        robotName: 'opentrons-dev',
      },
    }
    const nextState = hostsByIpReducer(initialState, action)

    expect(nextState).toBe(initialState)
  })

  it('should noop "client:REMOVE_IP_ADDRESS" for non-existent address', () => {
    const action = Actions.removeIpAddress('127.0.0.1')
    const initialState = {
      '127.0.0.2': {
        ip: '127.0.0.2',
        port: 31950,
        seen: true,
        ok: true,
        serverOk: true,
        healthError: null,
        serverHealthError: null,
        robotName: 'opentrons-dev',
      },
    }
    const nextState = hostsByIpReducer(initialState, action)

    expect(nextState).toBe(initialState)
  })

  it('should handle "client:REMOVE_ROBOT"', () => {
    const action = Actions.removeRobot('opentrons-dev')
    const initialState = {
      '127.0.0.1': {
        ip: '127.0.0.1',
        port: 31950,
        seen: false,
        ok: null,
        serverOk: null,
        healthError: null,
        serverHealthError: null,
        robotName: 'opentrons-dev',
      },
      '127.0.0.2': {
        ip: '127.0.0.2',
        port: 31950,
        seen: false,
        ok: null,
        serverOk: null,
        healthError: null,
        serverHealthError: null,
        robotName: 'opentrons-dev',
      },
      '127.0.0.3': {
        ip: '127.0.0.3',
        port: 31950,
        seen: false,
        ok: null,
        serverOk: null,
        healthError: null,
        serverHealthError: null,
        robotName: 'opentrons-other',
      },
    }
    const nextState = hostsByIpReducer(initialState, action)

    expect(nextState).toEqual({
      '127.0.0.3': {
        ip: '127.0.0.3',
        port: 31950,
        seen: false,
        ok: null,
        serverOk: null,
        healthError: null,
        serverHealthError: null,
        robotName: 'opentrons-other',
      },
    })
  })
})
