// flow-typed signature: 0fb22f4a66e7e05b708bc45aaffb15bb
// flow-typed version: <<STUB>>/usb-detection_v^4.7.0/flow_v0.119.1
// NOTE(mc, 2020-04-20): copied from https://github.com/MadLittleMods/node-usb-detection/blob/master/index.d.ts

declare module 'usb-detection' {
  declare export type Device = {|
    locationId: number,
    vendorId: number,
    productId: number,
    deviceName: string,
    manufacturer: string,
    serialNumber: string,
    deviceAddress: number,
  |}

  declare function find(
    vid: number,
    pid: number,
    callback: (error: any, devices: Device[]) => any
  ): void

  declare function find(vid: number, pid: number): Promise<Device[]>

  declare function find(
    vid: number,
    callback: (error: any, devices: Device[]) => any
  ): void

  declare function find(vid: number): Promise<Device[]>

  declare function find(callback: (error: any, devices: Device[]) => any): void

  declare function find(): Promise<Device[]>

  declare function startMonitoring(): void

  declare function stopMonitoring(): void

  declare function on(event: string, callback: (device: Device) => void): void

  declare var version: number

  declare export type Detector = {|
    find: find,
    on: on,
    startMonitoring: startMonitoring,
    stopMonitoring: stopMonitoring,
    version: version,
  |}

  declare var detector: Dectector
  declare module.exports: detector
}
