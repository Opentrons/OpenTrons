import atexit

from opentrons import robot


d = robot._driver
button_state = d.read_button()

button_color_index = 0
strips_state = 0


def button_busy_while():
    while True:
        new_state = d.read_button()
        if new_state != button_state and new_state == 0:
            button_color_index += 1
            if button_color_index % 3 == 0:
                d._set_button_light(r=True)
            elif button_color_index % 3 == 1:
                d._set_button_light(g=True)
            elif button_color_index % 3 == 2:
                d._set_button_light(b=True)
            strips_state = 1 - strips_state
            if strips_state:
                d.turn_on_rail_lights()
            else:
                d.turn_off_rail_lights()
        button_state = new_state


def turn_off_all_lights():
    d.turn_off_rail_lights()
    d.turn_off_button_light()


if __name__ == "__main__":
    print('\n')
    print('Button and LED Test')
    print('')
    print('Press button to set it\'s color, and turn on/off the rail lights')
    print('')
    print('Press CTRL-C at any time to quit')

    # turn off all lights at the beginning
    turn_off_all_lights()
    atexit.register(turn_off_all_lights)

    # enter button-read loop
    button_busy_while()
