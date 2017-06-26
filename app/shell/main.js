const {app, BrowserWindow} = require('electron')

if (require('electron-squirrel-startup')) app.quit()

const fs = require('fs')
const path = require('path')

const rp = require('request-promise')

const {addMenu} = require('./menu')
const {getLogger} = require('./logging')
const {initAutoUpdater} = require('./updater')
const {ServerManager} = require('./servermanager')
const {waitUntilServerResponds} = require('./util')

const port = process.env.PORT || 8090
let appWindowUrl = `http://127.0.0.1:31950/`
let mainWindow
let mainLogger
let serverManager = new ServerManager()

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')({showDevTools: 'undocked'})
  appWindowUrl = `http://127.0.0.1:${port}/`
}

function createWindow (windowUrl) {
  mainLogger.info('Creating Electron App window at ' + windowUrl)
  mainWindow = new BrowserWindow({
    width: 1060,
    height: 750
  })
  mainWindow.on('closed', function () {
    mainLogger.info('Electron App window closed, quitting App')
    rp(windowUrl + 'exit')
      .then((html) => {
        mainWindow = null
        app.quit()
      })
      .catch((err) => {
        mainLogger.info('Received an expected error while calling exit route')
        mainLogger.info(err)
        mainWindow = null
        app.quit()
      })
  })
  mainWindow.on('unresponsive', function () {
    mainLogger.info('window is unresponsive, reloading')
    setTimeout(mainWindow.reload, 500)
  })
  // Note: Auth0 pop window does not close itself, this will this window when it pops up
  setInterval(() => {
    BrowserWindow.getAllWindows()
      .filter(win => win.frameName === 'auth0_signup_popup')
      .map(win => win.close())
  }, 3000)
  setTimeout(() => {
    mainWindow.webContents.loadURL(windowUrl, {'extraHeaders': 'pragma: no-cache\n'})
  }, 200)
  return mainWindow
}

function createAndSetAppDataDir () {
  if (!app.isReady()) {
    throw Error('Attempting to create otone_data dir when app is not ready')
  }
  const appDataDir = path.join(app.getPath('userData'), 'otone_data')

  if (!fs.existsSync(appDataDir)) {
    fs.mkdirSync(appDataDir)
  }
  process.env['APP_DATA_DIR'] = appDataDir
}

function startUp () {
  // Prepare app data dir (necessary for logging errors that occur during setup)
  createAndSetAppDataDir()
  mainLogger = getLogger('electron-main')
  mainLogger.info('Starting App')

  // NOTE: vue-devtools can only be installed after app the 'ready' event
  if (process.env.NODE_ENV === 'development') {
    require('vue-devtools').install()
  }

  process.on('uncaughtException', (error) => {
    if (process.listeners('uncaughtException').length > 1) {
      console.log(error)
      mainLogger.info('Uncaught Exception:')
      mainLogger.info(error)
    }
  })

  serverManager.start()
  waitUntilServerResponds(
    () => createWindow(appWindowUrl),
    appWindowUrl
  )
  addMenu()
  initAutoUpdater()
}

app.on('ready', startUp)
app.on('quit', function () {
  serverManager.shutdown()
})
