// IPC messenger wrapper
import { ipcMain } from 'electron'
import noop from 'lodash/noop'
import WebSocket from 'ws'
import { fromEvent } from 'rxjs'
import { tap, filter, map, mergeMap } from 'rxjs/operators'

import { getFullConfig } from './config'
import { createLogger } from './log'
import { getMainWindow } from './main-window'

import type { Observable } from 'rxjs'
import type {
  Remote,
  WebSocketRemoteMessage,
  WebSocketRemoteLogMessage,
  WebSocketRemoteDispatchMessage,
} from '@opentrons/app/src/redux/shell/remote'
import type { Action } from './types'

const log = createLogger('remote')
const rendererLogger = createLogger('renderer')

const createMainRemote = (): Remote => {
  const dispatch = (action: Action): void => {
    const mainWindow = getMainWindow()

    if (mainWindow !== null) {
      log.silly('Sending action via IPC to renderer', { action })
      mainWindow.webContents.send('dispatch', action)
    } else {
      log.warn('attempted to send action to UI without window', { action })
    }
  }

  const inbox = fromEvent(ipcMain, 'dispatch', (event, action) => action).pipe(
    tap(action =>
      log.debug('Received action from renderer via IPC', { action })
    )
  )

  ipcMain.on('log', (_, logEntry) => rendererLogger.log(logEntry))

  return { dispatch, inbox, log: noop }
}

const createWebsocketRemote = (): Remote => {
  const server = new WebSocket.Server({ port: 11201 })

  const dispatch = (action: Action): void => {
    const message = JSON.stringify({ channel: 'dispatch', payload: action })
    log.silly('Sending action via WebSocket to renderer', { action })
    Array.from(server.clients)
      .filter(c => c.readyState === WebSocket.OPEN)
      .forEach(c => c.send(message))
  }

  const incoming: Observable<WebSocketRemoteMessage> = fromEvent(
    server,
    'connection'
  ).pipe(
    // @ts-expect-error(mc, 2021-06-01): I don't know why TS hates this,
    // but I also no longer care
    mergeMap((socket: WebSocket) =>
      fromEvent(
        socket,
        'message',
        (event: WebSocket.MessageEvent): WebSocketRemoteMessage =>
          JSON.parse(event.data as string)
      )
    )
  )

  incoming.pipe(
    filter((msg): msg is WebSocketRemoteLogMessage => msg.channel === 'log'),
    tap(({ payload }: WebSocketRemoteLogMessage) => {
      rendererLogger.log(payload)
    })
  )

  const inbox = incoming.pipe(
    filter(
      (msg): msg is WebSocketRemoteDispatchMessage => msg.channel === 'dispatch'
    ),
    map(({ payload }: WebSocketRemoteDispatchMessage) => payload),
    tap(action =>
      log.debug('Received action from renderer via WebSocket', { action })
    )
  )

  return { dispatch, inbox, log: noop }
}

export function createRemote(): Remote {
  return getFullConfig().ui.externalBrowser
    ? createWebsocketRemote()
    : createMainRemote()
}
