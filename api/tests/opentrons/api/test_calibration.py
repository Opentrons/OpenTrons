from unittest import mock
from functools import partial
from tests.opentrons.conftest import state
import pytest

state = partial(state, 'calibration')


@pytest.fixture
def calibrate_bottom_env(monkeypatch):
    monkeypatch.setenv('CALIBRATE_BOTTOM', 'true')
    yield
    monkeypatch.delenv('CALIBRATE_BOTTOM', '')


async def test_tip_probe(main_router, model):
    with mock.patch(
            'opentrons.util.calibration_functions.probe_instrument'
         ) as probe_patch:
        probe_patch.return_value = (0, 0, 0)

        with mock.patch(
                'opentrons.util.calibration_functions.update_instrument_config'
             ) as update_patch:

            main_router.calibration_manager.tip_probe(model.instrument)

            probe_patch.assert_called_with(
                instrument=model.instrument._instrument,
                robot=model.robot)

            update_patch.assert_called_with(
                instrument=model.instrument._instrument,
                measured_center=(0, 0, 0))

    await main_router.wait_until(state('probing'))
    await main_router.wait_until(state('ready'))


async def test_move_to_front(main_router, model):
    robot = model.robot

    robot.home()

    with mock.patch(
         'opentrons.util.calibration_functions.move_instrument_for_probing_prep') as patch:  # NOQA
        main_router.calibration_manager.move_to_front(model.instrument)
        patch.assert_called_with(
            model.instrument._instrument,
            robot)

        await main_router.wait_until(state('moving'))
        await main_router.wait_until(state('ready'))


async def test_pick_up_tip(main_router, model):
    with mock.patch.object(model.instrument._instrument, 'pick_up_tip') as pick_up_tip:  # NOQA
        main_router.calibration_manager.pick_up_tip(
            model.instrument,
            model.container)

        pick_up_tip.assert_called_with(
            model.container._container[0])

        await main_router.wait_until(state('moving'))
        await main_router.wait_until(state('ready'))


async def test_drop_tip(main_router, model):
    with mock.patch.object(model.instrument._instrument, 'drop_tip') as drop_tip:  # NOQA
        main_router.calibration_manager.drop_tip(
            model.instrument,
            model.container)

        drop_tip.assert_called_with(
            model.container._container[0], home_after=True)

        await main_router.wait_until(state('moving'))
        await main_router.wait_until(state('ready'))


async def test_return_tip(main_router, model):
    with mock.patch.object(model.instrument._instrument, 'return_tip') as return_tip:  # NOQA
        main_router.calibration_manager.return_tip(model.instrument)

        return_tip.assert_called_with(home_after=True)

        await main_router.wait_until(state('moving'))
        await main_router.wait_until(state('ready'))


async def test_home(main_router, model):
    with mock.patch.object(model.instrument._instrument, 'home') as home:
        main_router.calibration_manager.home(
            model.instrument)

        home.assert_called_with()

        await main_router.wait_until(state('moving'))
        await main_router.wait_until(state('ready'))


async def test_move_to_top(main_router, model):
    with mock.patch.object(model.instrument._instrument, 'move_to') as move_to:
        main_router.calibration_manager.move_to(
            model.instrument,
            model.container)

        move_to.assert_called_with(model.container._container[0])

        await main_router.wait_until(state('moving'))
        await main_router.wait_until(state('ready'))


async def test_move_to_bottom(main_router, model, calibrate_bottom_env):

    with mock.patch.object(model.instrument._instrument, 'move_to') as move_to:
        main_router.calibration_manager.move_to(
            model.instrument,
            model.container)

        move_to.assert_called_with(model.container._container[0].bottom())

        await main_router.wait_until(state('moving'))
        await main_router.wait_until(state('ready'))


async def test_jog(main_router, model):
    with mock.patch('opentrons.util.calibration_functions.jog_instrument') as jog:  # NOQA
        for distance, axis in zip((1, 2, 3), 'xyz'):
            main_router.calibration_manager.jog(
                model.instrument,
                distance,
                axis
            )

        expected = [
            mock.call(
                instrument=model.instrument._instrument,
                distance=distance,
                axis=axis,
                robot=model.robot)
            for axis, distance in zip('xyz', (1, 2, 3))]

        assert jog.mock_calls == expected

        await main_router.wait_until(state('moving'))
        await main_router.wait_until(state('ready'))


async def test_update_container_offset(
        user_definition_dirs, main_router, model):
    with mock.patch.object(
            model.robot,
            'calibrate_container_with_instrument') as call:
        main_router.calibration_manager.update_container_offset(
                model.container,
                model.instrument
            )
        call.assert_called_with(
            container=model.container._container,
            instrument=model.instrument._instrument,
            save=True
        )


async def test_jog_calibrate_bottom(
        dummy_db,
        user_definition_dirs,
        main_router,
        model,
        calibrate_bottom_env):

    # Check that the feature flag correctly implements calibrate to bottom
    from numpy import array, isclose
    from opentrons.trackers import pose_tracker

    robot = model.robot

    container = model.container._container
    pos1 = pose_tracker.change_base(
        robot.poses,
        src=container[0],
        dst=robot.deck)
    coordinates1 = container.coordinates()

    main_router.calibration_manager.move_to(model.instrument, model.container)
    main_router.calibration_manager.jog(model.instrument, 1, 'x')
    main_router.calibration_manager.jog(model.instrument, 2, 'y')
    main_router.calibration_manager.jog(model.instrument, 3, 'z')

    # Todo: make tests use a tmp dir instead of a real one
    main_router.calibration_manager.update_container_offset(
        model.container,
        model.instrument
    )

    pos2 = pose_tracker.absolute(robot.poses, container[0])
    coordinates2 = container.coordinates()

    assert isclose(pos1 + (1, 2, 3), pos2).all()
    assert isclose(
        array([*coordinates1]) + (1, 2, 3),
        array([*coordinates2])).all()

    main_router.calibration_manager.pick_up_tip(
        model.instrument,
        model.container
    )

    # NOTE: only check XY, as the instrument moves up after tip pickup
    assert isclose(
        pose_tracker.absolute(robot.poses, container[0])[:-1],
        pose_tracker.absolute(robot.poses, model.instrument._instrument)[:-1]
    ).all()


async def test_jog_calibrate_top(
        dummy_db,
        user_definition_dirs,
        main_router,
        model):

    # Check that the old behavior remains the same without the feature flag
    from numpy import array, isclose
    from opentrons.trackers import pose_tracker

    robot = model.robot

    container = model.container._container
    pos1 = pose_tracker.change_base(
        robot.poses,
        src=container[0],
        dst=robot.deck)
    coordinates1 = container.coordinates()

    main_router.calibration_manager.move_to(model.instrument, model.container)
    main_router.calibration_manager.jog(model.instrument, 1, 'x')
    main_router.calibration_manager.jog(model.instrument, 2, 'y')
    main_router.calibration_manager.jog(model.instrument, 3, 'z')

    # Todo: make tests use a tmp dir instead of a real one
    main_router.calibration_manager.update_container_offset(
        model.container,
        model.instrument
    )

    pos2 = pose_tracker.absolute(robot.poses, container[0])
    coordinates2 = container.coordinates()

    assert isclose(pos1 + (1, 2, 3), pos2).all()
    assert isclose(
        array([*coordinates1]) + (1, 2, 3),
        array([*coordinates2])).all()

    main_router.calibration_manager.pick_up_tip(
        model.instrument,
        model.container
    )

    # NOTE: only check XY, as the instrument moves up after tip pickup
    assert isclose(
        pose_tracker.absolute(robot.poses, container[0])[:-1],
        pose_tracker.absolute(robot.poses, model.instrument._instrument)[:-1]
    ).all()
