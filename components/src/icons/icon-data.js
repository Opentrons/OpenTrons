// @flow
// icon data
const ICON_DATA_BY_NAME = {
  'alert': {
    viewBox: '0 0 24 24',
    path: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'
  },
  'arrow-left': {
    viewBox: '0 0 24 24',
    path: 'M18 11.242v1.516H8.91l4.166 4.166L12 18l-6-6 6-6 1.076 1.076-4.167 4.166z'
  },
  'circle': {
    viewBox: '0 0 24 24',
    path: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z'
  },
  'close': {
    viewBox: '0 0 24 24',
    path: 'M18 7.209L16.791 6 12 10.791 7.209 6 6 7.209 10.791 12 6 16.791 7.209 18 12 13.209 16.791 18 18 16.791 13.209 12z'
  },
  'refresh': {
    viewBox: '0 0 200 200',
    path: 'M121.9,31.3L129,4.6l56.7,56.7l-77.5,20.8c0,0,7.7-28.6,7.7-28.6c-5.7-1.8-11.7-2.7-17.9-2.7 c-33.5,0-60.8,27.3-60.8,60.8c0,33.5,27.3,60.8,60.8,60.8c26.5,0,50.5-17.7,58.1-43.1l22,6.7c-5.1,16.8-15.7,32-29.8,42.6 c-14.6,11-32,16.8-50.3,16.8c-46.2,0-83.8-37.6-83.8-83.8S51.8,27.9,98,27.9C106.1,27.9,114.1,29.1,121.9,31.3'
  },
  'ot-spinner': {
    viewBox: '0 0 512 512',
    path: 'M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z'
  },
  'usb': {
    viewBox: '0 0 24 24',
    path: 'M15.677 11.32h1.132v2.265h-3.396V4.528h2.264L12.281 0 8.885 4.528h2.264v9.057H7.753v-2.343c.792-.42 1.358-1.223 1.358-2.185 0-1.37-1.12-2.491-2.49-2.491s-2.49 1.12-2.49 2.49c0 .963.565 1.767 1.358 2.186v2.343a2.256 2.256 0 0 0 2.264 2.264h3.396v3.453a2.492 2.492 0 0 0-1.358 2.207 2.49 2.49 0 0 0 4.98 0 2.49 2.49 0 0 0-1.358-2.207v-3.453h3.396a2.256 2.256 0 0 0 2.265-2.264V11.32h1.132V6.792h-4.529v4.529z'
  },
  'wifi': {
    viewBox: '0 0 24 24',
    path: 'M0 9.414l2.182 2.182c5.422-5.422 14.214-5.422 19.636 0L24 9.414c-6.622-6.622-17.367-6.622-24 0zm8.727 8.727L12 21.414l3.273-3.273a4.622 4.622 0 0 0-6.546 0zm-4.363-4.363l2.181 2.181a7.717 7.717 0 0 1 10.91 0l2.181-2.181c-4.21-4.211-11.05-4.211-15.272 0z'
  },
  'flask-outline': {
    viewBox: '0 0 24 24',
    path: 'M2.44444444,20.4 C2.44444444,21.0627417 2.99165197,21.6 3.66666667,21.6 L18.3333333,21.6 C19.008348,21.6 19.5555556,21.0627417 19.5555556,20.4 C19.5555556,20.148 19.47,19.908 19.3355556,19.716 L12.2222222,7.62 L12.2222222,2.4 L9.77777778,2.4 L9.77777778,7.62 L2.66444444,19.716 C2.53,19.908 2.44444444,20.148 2.44444444,20.4 Z M3.66666667,24 C1.64162258,24 0,22.3882251 0,20.4 C0,19.68 0.22,19.008 0.611111111,18.444 L7.33333333,6.972 L7.33333333,4.8 C6.65831864,4.8 6.11111111,4.2627417 6.11111111,3.6 L6.11111111,2.4 C6.11111111,1.0745166 7.20552617,0 8.55555556,0 L13.4444444,0 C14.7944738,0 15.8888889,1.0745166 15.8888889,2.4 L15.8888889,3.6 C15.8888889,4.2627417 15.3416814,4.8 14.6666667,4.8 L14.6666667,6.972 L21.3888889,18.444 C21.78,19.008 22,19.68 22,20.4 C22,22.3882251 20.3583774,24 18.3333333,24 L3.66666667,24 Z M12.2222222,16.8 L13.86,15.192 L16.2188889,19.2 L5.78111111,19.2 L9.03222222,13.668 L12.2222222,16.8 Z M11.6111111,12 C11.9486185,12 12.2222222,12.2686292 12.2222222,12.6 C12.2222222,12.9313708 11.9486185,13.2 11.6111111,13.2 C11.2736038,13.2 11,12.9313708 11,12.6 C11,12.2686292 11.2736038,12 11.6111111,12 Z'
  },
  'check': {
    viewBox: '0 0 24 24',
    path: 'M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z'
  },
  'check-circle': {
    viewBox: '0 0 24 24',
    path: 'M9.6,18 L3.6,12 L5.292,10.296 L9.6,14.604 L18.708,5.496 L20.4,7.2 L9.6,18 Z M12,5.32907052e-16 C5.372583,-2.13162821e-15 5.32907052e-16,5.372583 0,12 C-1.59872116e-15,15.1825979 1.26428208,18.2348448 3.51471863,20.4852814 C5.76515517,22.7357179 8.81740212,24 12,24 C15.1825979,24 18.2348448,22.7357179 20.4852814,20.4852814 C22.7357179,18.2348448 24,15.1825979 24,12 C24,8.81740212 22.7357179,5.76515517 20.4852814,3.51471863 C18.2348448,1.26428208 15.1825979,2.66453526e-16 12,5.32907052e-16 Z'
  },
  'checkbox-blank-circle-outline': {
    viewBox: '0 0 24 24',
    path: 'M12,21.6 C6.6980664,21.6 2.4,17.3019336 2.4,12 C2.4,6.6980664 6.6980664,2.4 12,2.4 C14.5460783,2.4 16.9878759,3.41142567 18.7882251,5.2117749 C20.5885743,7.01212413 21.6,9.4539217 21.6,12 C21.6,17.3019336 17.3019336,21.6 12,21.6 Z M12,5.32907052e-16 C5.372583,-2.13162821e-15 5.32907052e-16,5.372583 0,12 C-1.59872116e-15,15.1825979 1.26428208,18.2348448 3.51471863,20.4852814 C5.76515517,22.7357179 8.81740212,24 12,24 C15.1825979,24 18.2348448,22.7357179 20.4852814,20.4852814 C22.7357179,18.2348448 24,15.1825979 24,12 C24,8.81740212 22.7357179,5.76515517 20.4852814,3.51471863 C18.2348448,1.26428208 15.1825979,2.66453526e-16 12,5.32907052e-16 Z'
  },
  'radiobox-marked': {
    viewBox: '0 0 24 24',
    path: 'M12 20a8 8 0 0 1-8-8 8 8 0 0 1 8-8 8 8 0 0 1 8 8 8 8 0 0 1-8 8m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 5a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5z'
  },
  'radiobox-blank': {
    viewBox: '0 0 24 24',
    path: 'M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z'
  },
  'checkbox-marked': {
    viewBox: '0 0 24 24',
    path: 'M10 17l-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8m0-5H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z'
  },
  'checkbox-blank-outline': {
    viewBox: '0 0 24 24',
    path: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 2v14H5V5h14z'
  },
  'ot-toggle-switch-off': {
    viewBox: '0 0 24 24',
    path: 'M19.2 7.8h-7.61a6.3 6.3 0 1 0 0 8.4h7.61a4.2 4.2 0 0 0 0-8.4zM6.9 17.3a5.3 5.3 0 1 1 5.3-5.3 5.31 5.31 0 0 1-5.3 5.3z'
  },
  'ot-toggle-switch-on': {
    viewBox: '0 0 24 24',
    path: 'M17.1,5.7a6.28,6.28,0,0,0-4.69,2.1H4.8a4.2,4.2,0,1,0,0,8.4h7.61A6.3,6.3,0,1,0,17.1,5.7Zm-5.42,9.5H4.8a3.2,3.2,0,1,1,0-6.4h6.88a6.26,6.26,0,0,0,0,6.4Z'
  },
  'chevron-up': {
    viewBox: '0 0 24 24',
    path: 'M7.41 15.857L12 11.615l4.59 4.242L18 14.545 12 9l-6 5.545z'
  },
  'chevron-down': {
    viewBox: '0 0 24 24',
    path: 'M7.41 9L12 13.242 16.59 9 18 10.312l-6 5.545-6-5.545z'
  },
  'chevron-left': {
    viewBox: '0 0 24 24',
    path: 'M15.429 17.019l-4.242-4.59 4.242-4.59-1.312-1.41-5.545 6 5.545 6z'
  },
  'chevron-right': {
    viewBox: '0 0 24 24',
    path: 'M8.571 7.839l4.242 4.59-4.242 4.59 1.312 1.41 5.545-6-5.545-6z'
  },
  'ot-connect': {
    viewBox: '0 0 24 24',
    path: 'M17.3 9.9C15.1 6.5 12.5 3 12.5 3S9.9 6.5 7.7 9.9c-1.9 2.9-2.5 6.5-.1 9 1.3 1.4 3.1 2.1 4.9 2.1 1.8 0 3.6-.7 4.9-2.1 2.4-2.6 1.8-6.1-.1-9zm-4.9 9.4h-.3c-1.2-.1-2.4-.6-3.3-1.6-.7-.9-1.1-1.9-1.1-2.9 2.4.1 4.4-1.6 6.1-3.1.4-.4 1-.7 1.6-.7h.2c1.3.4 1.9 2.6 1.8 3.7-.1 2.6-2.3 4.7-5 4.6z'
  },
  'ot-file': {
    viewBox: '0 0 24 24',
    path: 'M20.907 0H3.803C3.334.044 3 .356 3 .822c0 1.822.022 3.645.022 5.467v11.355c0 1.823-.022 3.645-.022 5.467 0 .467.334.8.803.822H7.37c2.051 0 3.88.023 6.199 0 .736 0 1.383-.289 1.918-.777.535-.49 1.048-.956 1.538-1.49a201.554 201.554 0 0 0 2.989-3.177c.379-.4.713-.822 1.025-1.267a3.17 3.17 0 0 0 .58-1.844c.045-4.867.045-9.711.067-14.578.022-.444-.312-.778-.78-.8zm-2.074 16.444c-1.115.312-2.275.312-3.434.334-.424 0-.647.155-.736.555-.045.2-.023.867-.023 1.09-.066 1-.044 1.6-.178 2.6-.134.866-.624 1.51-1.762 1.488-2.586-.022-8.005 0-8.161 0V1.556h15.61v13.222c.022 1-.536 1.466-1.316 1.666z'
  },
  'upload': {
    viewBox: '0 0 24 24',
    path: 'M7.714 18.353v-8.47H2L12 0l10 9.882h-5.714v8.47H7.714zM2 24v-2.824h20V24H2z'
  },
  'settings': {
    viewBox: '0 0 24 24',
    path: 'M23.933 10.489v3.022c-1.177.356-2.333.711-3.51 1.045-.09.022-.134.066-.156.155-.156.422-.334.822-.511 1.245-.045.088-.045.133 0 .222a213.885 213.885 0 0 0 1.688 3.11c.045.09.045.134-.022.2-.666.668-1.31 1.312-1.978 1.979-.022.022-.044.044-.088.066-.045-.022-.067-.044-.112-.066-1.022-.556-2.066-1.111-3.088-1.667-.067-.044-.134-.044-.223 0l-1.266.533a.2.2 0 0 0-.134.134c-.244.844-.51 1.689-.755 2.533-.09.333-.2.644-.29.978h-2.866c-.11 0-.155-.022-.2-.156-.333-1.133-.666-2.244-1-3.378a.2.2 0 0 0-.133-.133c-.422-.178-.867-.355-1.289-.533-.067-.022-.111-.045-.2 0l-1.6.866c-.533.29-1.089.578-1.6.867l-2.156-2.155a.486.486 0 0 0 .067-.112c.556-1.022 1.111-2.066 1.667-3.088a.167.167 0 0 0 0-.2c-.178-.423-.356-.845-.534-1.29a.2.2 0 0 0-.133-.133c-1.133-.333-2.267-.689-3.4-1.022C.044 13.49 0 13.467 0 13.378v-2.822c0-.09.022-.112.111-.134C1.244 10.09 2.4 9.756 3.533 9.4a.268.268 0 0 0 .111-.111c.178-.422.356-.867.556-1.311a.245.245 0 0 0 0-.178c-.356-.667-.733-1.333-1.089-2.022-.222-.4-.444-.8-.644-1.2l.044-.045L4.556 2.49c.066-.067.11-.045.155 0 1.045.555 2.089 1.133 3.133 1.689a.167.167 0 0 0 .2 0c.423-.178.823-.356 1.245-.511.089-.023.133-.067.155-.156.356-1.178.69-2.333 1.045-3.511h3.022a298.91 298.91 0 0 1 1.045 3.511.299.299 0 0 0 .133.156l1.267.533a.245.245 0 0 0 .177 0c.445-.244.911-.489 1.356-.733.622-.334 1.267-.69 1.867-1.023.71.712 1.444 1.423 2.155 2.156-.022.022-.044.067-.067.111-.555 1.022-1.11 2.067-1.666 3.089-.045.089-.045.133 0 .222.178.4.355.822.51 1.222.045.09.068.134.179.156 1.133.4 2.31.756 3.466 1.089zm-7.4 1.533a4.605 4.605 0 0 0-4.577-4.6c-2.512 0-4.578 2.045-4.6 4.578 0 2.533 2.044 4.6 4.577 4.6 2.556.022 4.6-2.044 4.6-4.578z'
  },
  'ot-consolidate': {
    viewBox: '0 0 24 24',
    path: 'M15.5 14.4c-1.6 0-2.6.2-3.3.5-.7.3-1.2.7-1.8 1.2-.4.4-.8.9-1.4 1.4-.7.6-1.6 1.3-2.8 1.8-1.5.7-3.5 1.1-6.2 1.1v-4c2.2 0 3.6-.3 4.6-.7.9-.4 1.6-.9 2.3-1.6.4-.4.9-.9 1.5-1.4-.6-.5-1.1-1-1.5-1.4-.8-.8-1.4-1.3-2.3-1.7-1-.4-2.4-.7-4.6-.7v-4c2.7 0 4.7.4 6.2 1.1 1.2.5 2.1 1.2 2.8 1.8.5.5 1 .9 1.4 1.3.6.6 1.1.9 1.8 1.2.7.3 1.7.5 3.3.5V7.4l8.5 5-8.5 4.9v-2.9'
  },
  'ot-distribute': {
    viewBox: '0 0 24 24',
    path: 'M15.5 16v-2.9l8.5 5-8.5 4.9v-3c-1.3 0-2.4-.3-3.4-.7-1.1-.4-2.1-1-2.9-1.6-1.7-1.2-3-2.3-4.8-3.1-1.2-.5-2.5-.8-4.4-.8V9.3c1.9 0 3.2-.3 4.4-.8 1.7-.7 3.1-1.9 4.8-3.1.8-.6 1.8-1.2 2.9-1.6 1-.4 2.2-.7 3.4-.7V.4l8.5 5-8.5 4.9V7.1c-1.1.1-1.9.3-2.7.7-.7.3-1.4.8-2.1 1.4-1 .7-2.1 1.6-3.5 2.3 1.4.8 2.5 1.6 3.5 2.3.8.6 1.4 1 2.1 1.4.8.5 1.6.7 2.7.8z'
  },
  'ot-mix': {
    viewBox: '0 0 24 24',
    path: 'M7.8 2.4v10.3H3.4V2.4h4.4zM5.6 21.5L.4 12.7h10.3l-5.1 8.8zm10.5.1V11.2h4.4v10.4h-4.4zm2.3-19.2l5.2 8.8H13.2l5.2-8.8z'
  },
  'pause': {
    viewBox: '0 0 24 24',
    path: 'M9.2 2v19.8H2V2zm13 0v19.8H15V2z'
  },
  'pause-circle': {
    viewBox: '0 0 24 24',
    path: 'M15 16h-2V8h2m-4 8H9V8h2m1-6A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2z'
  },
  'pen': {
    viewBox: '0 0 24 24',
    path: 'M20.71,7.04C20.37,7.38 20.04,7.71 20.03,8.04C20,8.36 20.34,8.69 20.66,9C21.14,9.5 21.61,9.95 21.59,10.44C21.57,10.93 21.06,11.44 20.55,11.94L16.42,16.08L15,14.66L19.25,10.42L18.29,9.46L16.87,10.87L13.12,7.12L16.96,3.29C17.35,2.9 18,2.9 18.37,3.29L20.71,5.63C21.1,6 21.1,6.65 20.71,7.04M3,17.25L12.56,7.68L16.31,11.43L6.75,21H3V17.25Z'
  },
  'ot-transfer': {
    viewBox: '0 0 24 24',
    path: 'M0 10.8h15.5V8l8.5 5-8.5 4.9v-2.8H0z'
  },
  'menu-down': {
    viewBox: '0 0 24 24',
    path: 'M7,10L12,15L17,10H7Z'
  },
  'cursor-move': {
    viewBox: '0 0 24 24',
    path: 'M13,6V11H18V7.75L22.25,12L18,16.25V13H13V18H16.25L12,22.25L7.75,18H11V13H6V16.25L1.75,12L6,7.75V11H11V6H7.75L12,1.75L16.25,6H13Z'
  },
  'plus': {
    viewBox: '0 0 24 24',
    path: 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z'
  },
  'content-copy': {
    viewBox: '0 0 24 24',
    path: 'M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z'
  },
  'dots-horizontal': {
    viewBox: '0 0 24 24',
    path: 'M5.5 10A2.5 2.5 0 1 1 3 12.5 2.5 2.5 0 0 1 5.5 10zm7 0a2.5 2.5 0 1 1-2.5 2.5 2.5 2.5 0 0 1 2.5-2.5zm7 0a2.5 2.5 0 1 1-2.5 2.5 2.5 2.5 0 0 1 2.5-2.5z'
  },
  'ot-calibrate': {
    viewBox: '0 0 24 24',
    path: 'M17.4 16.3c-1.4-.8-2.9-1.6-4.3-2.5-.2-.1-.2-.2-.2-.4V8.3c0-.4-.1-.5-.5-.5h-.9c-.4 0-.5.2-.5.5v5c0 .2-.1.3-.3.4-1.4.8-2.9 1.7-4.3 2.5-.4.3-.4.5-.2.8.1.2.3.5.4.7.2.4.4.5.8.2 1.4-.8 2.9-1.7 4.3-2.5.2-.1.3-.1.4 0 1.5.8 2.9 1.7 4.4 2.5.4.2.5.2.8-.2.1-.2.3-.5.4-.7.2-.3.2-.5-.3-.7zM3.7 19.8c0-.2.2-.4.4-.7.3-.4.5-.8.8-1.2H3.7c-.1 0-.2 0-.3.2-.2.3-.4.7-.6 1-.2-.4-.4-.7-.6-1 0-.1-.1-.1-.2-.1H.7c.2 0 .2.1.3.2.3.5.6 1 1 1.4 0 .1 0 .2-.1.4-.4.5-.7 1-1 1.5-.1.1-.1.2-.2.3h1.2c.2 0 .3-.1.3-.2.2-.3.4-.7.7-1.1.2.4.5.7.7 1.1 0 .1.1.1.2.1h1.3c-.3-.5-.6-.9-.9-1.3-.2-.2-.5-.4-.5-.6zM13.6 5.8V5h-2v-.1c.1-.1.2-.1.2-.2.6-.6 1.1-1.3 1.7-1.9.1-.1.1-.1.1-.2v-.7h-3.1v.8h1.8l-.2.2c-.6.7-1.1 1.3-1.7 2-.1.1-.2.1-.2.2v.7h3.4zM21.9 17.9c-.2 0-.3.1-.4.2-.2.4-.4.7-.7 1.1-.3-.4-.5-.8-.7-1.1 0-.1-.1-.2-.2-.2h-1.3c.1.1.1.2.2.2l1.2 1.8c.1.2.2.3.2.5v1.3h1.2v-1.4c0-.1 0-.3.1-.4.4-.6.8-1.2 1.3-1.8 0-.1.1-.1.2-.3-.4.1-.7.1-1.1.1z'
  },
  'ot-run': {
    viewBox: '0 0 24 24',
    path: 'M18.83 11.58V1.89a.6.6 0 0 0-.61-.62H5a.64.64 0 0 0-.62.64v17.34a.62.62 0 0 0 .62.64h5.45a6.06 6.06 0 1 0 8.41-8.31zm-9.36 5.09a6 6 0 0 0 .4 2.1H5.54V2.48h12.14V11a6 6 0 0 0-8.2 5.66zm4.61 2.81v-5.64l3.72 2.76z'
  },
  'ot-logo': {
    viewBox: '0 0 50 50',
    path: 'M46.79 24.83A21.79 21.79 0 1 1 21.23 3.38l.83 5.31a16.42 16.42 0 1 0 5.87 0l.83-5.31a21.82 21.82 0 0 1 18.03 21.45zm-28.14-3.14c3-4.52 6.34-9.23 6.35-9.23s3.37 4.72 6.35 9.23c2.56 3.9 3.31 8.71.15 12.13a8.76 8.76 0 0 1-6.5 2.83 8.76 8.76 0 0 1-6.46-2.82c-3.19-3.43-2.45-8.24.11-12.14zm0 6.62a5.8 5.8 0 0 0 1.42 3.88 6.29 6.29 0 0 0 4.35 2.16h.45a6.38 6.38 0 0 0 6.59-6.17c.05-1.54-.66-4.47-2.41-5a1.65 1.65 0 0 0-.31-.06 2.93 2.93 0 0 0-2.09.91c-2.17 2.08-4.73 4.46-7.96 4.28z'
  },
  'ot-design': {
    viewBox: '0 0 42 35',
    path: 'M7.25,4.62962963 L29,4.62962963 L29,1.85185185 L7.25,1.85185185 L7.25,4.62962963 Z M0,10.8796296 L2.71875,10.8796296 L0,14.2824074 L0,15.7407407 L4.53125,15.7407407 L4.53125,14.1203704 L1.8125,14.1203704 L4.53125,10.7175926 L4.53125,9.25925926 L0,9.25925926 L0,10.8796296 Z M1.359375,6.48148148 L2.71875,6.48148148 L2.71875,0 L0,0 L0,1.62037037 L1.359375,1.62037037 L1.359375,6.48148148 Z M0,20.1388889 L0,18.5185185 L4.53125,18.5185185 L4.53125,25 L0,25 L0,23.3796296 L3.02083333,23.3796296 L3.02083333,22.5694444 L1.51041667,22.5694444 L1.51041667,20.9490741 L3.02083333,20.9490741 L3.02083333,20.1388889 L0,20.1388889 Z M29,11 L26.4828564,13.7114681 L26.2150029,14 L7,14 L7,11 L29,11 Z M20,20 L17.1686211,23 L7,23 L7,20 L20,20 Z M40.6263029,13.2874601 C40.0959278,13.8162755 39.581152,14.3295376 39.5655527,14.8427996 C39.5187549,15.3405083 40.04913,15.8537703 40.5483066,16.3359256 C41.2970714,17.1135953 42.030237,17.8134981 41.9990385,18.5756145 C41.9678399,19.3377309 41.1722773,20.130954 40.3767146,20.9086238 L33.9342171,27.3477295 L31.7191211,25.1391473 L38.3488099,18.5445077 L36.8512802,17.0513818 L34.6361842,19.2444105 L28.7864588,13.4118872 L34.7765776,7.45493681 C35.384949,6.8483544 36.3989014,6.8483544 36.9760743,7.45493681 L40.6263029,11.0944313 C41.2346744,11.669907 41.2346744,12.6808777 40.6263029,13.2874601 Z M13,29.1674767 L27.9128998,14.2828774 L33.7626252,20.1154006 L18.8497254,35 L13,35 L13,29.1674767 Z'
  },
  'alert-circle': {
    viewBox: '0 0 24 24',
    path: 'M12 .33A11.67 11.67 0 1 0 23.67 12 11.67 11.67 0 0 0 12 .33zm1.17 17.5h-2.34V15.5h2.33zm0-4.67h-2.34v-7h2.33z'
  },
  'close-circle': {
    viewBox: '0 0 24 24',
    path: 'M12 .33A11.67 11.67 0 1 0 23.67 12 11.66 11.66 0 0 0 12 .33zm5.83 15.86l-1.64 1.64L12 13.65l-4.19 4.18-1.64-1.64L10.35 12 6.17 7.81l1.64-1.64L12 10.35l4.19-4.19 1.64 1.64-4.18 4.2z'
  },
  'ot-arrow-up': {
    viewBox: '0 0 24 24',
    path: 'M20 12l-8-8-8 8h4v8h8v-8z'
  },
  'ot-arrow-down': {
    viewBox: '0 0 24 24',
    path: 'M4 12l8 8 8-8h-4V4H8v8z'
  },
  'ot-arrow-left': {
    viewBox: '0 0 24 24',
    path: 'M12 4l-8 8 8 8v-4h8V8h-8z'
  },
  'ot-arrow-right': {
    viewBox: '0 0 24 24',
    path: 'M12 20l8-8-8-8v4H4v8h8z'
  },
  'information': {
    viewBox: '0 0 24 24',
    path: 'M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2z'
  }
}

export type IconName = $Keys<typeof ICON_DATA_BY_NAME>

export default ICON_DATA_BY_NAME
