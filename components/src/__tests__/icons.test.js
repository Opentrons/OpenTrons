// icon components tests
import React from 'react'
import Renderer from 'react-test-renderer'

import {
  Icon,
  NotificationIcon,
  ALERT,
  BACK,
  CLOSE,
  REFRESH,
  SPINNER,
  USB,
  WIFI,
  FLASK,
  CHECKED,
  UNCHECKED,
  CHECKED_RADIO,
  UNCHECKED_RADIO,
  CHECKED_BOX,
  UNCHECKED_BOX,
  TOGGLED_OFF,
  TOGGLED_ON,
  CHEVRON_UP,
  CHEVRON_DOWN,
  CHEVRON_LEFT,
  CHEVRON_RIGHT,
  FILE,
  COG,
  CONNECT,
  CONSOLIDATE,
  DISTRIBUTE,
  MIX,
  PAUSE,
  ARROW_RIGHT,
  MENU_DOWN,
  CIRCLE,
  CALIBRATE,
  RUN
} from '..'

describe('icons', () => {
  test('ALERT icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={ALERT} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('BACK icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={BACK} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('CLOSE icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={CLOSE} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('REFRESH icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={REFRESH} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('SPINNER icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={SPINNER} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('spin prop adds spin class', () => {
    const icon = Renderer.create(
      <Icon name={SPINNER} spin />
    ).root.findByType('svg')

    expect(icon.props.className).toMatch(/\bspin\b/)
  })

  test('USB icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={USB} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('WIFI icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={WIFI} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('FLASK icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={FLASK} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('CHECKED icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={CHECKED} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('UNCHECKED icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={UNCHECKED} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('CHECKED_RADIO icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={CHECKED_RADIO} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('UNCHECKED_RADIO icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={UNCHECKED_RADIO} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('CHECKED_BOX icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={CHECKED_BOX} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('UNCHECKED_BOX icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={UNCHECKED_BOX} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('TOGGLED_OFF icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={TOGGLED_OFF} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('TOGGLED_ON icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={TOGGLED_ON} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('CHEVRON_UP icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={CHEVRON_UP} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('CHEVRON_DOWN icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={CHEVRON_DOWN} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('CHEVRON_LEFT icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={CHEVRON_LEFT} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('CHEVRON_RIGHT icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={CHEVRON_RIGHT} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('FILE icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={FILE} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('COG icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={COG} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('CONNECT icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={CONNECT} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('ARROW_RIGHT icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={ARROW_RIGHT} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('PAUSE icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={PAUSE} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('MIX icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={MIX} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('DISTRIBUTE icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={DISTRIBUTE} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('CONSOLIDATE icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={CONSOLIDATE} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('MENU_DOWN icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={MENU_DOWN} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('CALIBRATE icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={CALIBRATE} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })

  test('RUN icon renders correctly', () => {
    const tree = Renderer.create(
      <Icon name={RUN} className='foo' />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })
})

describe('Notification Icon', () => {
  test('NotificationIcon renders correctly', () => {
    const tree = Renderer.create(
      <NotificationIcon
        parentName={FLASK}
        className='foo'
        childName={CIRCLE}
        childClassName={'bar'}
      />
    ).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
