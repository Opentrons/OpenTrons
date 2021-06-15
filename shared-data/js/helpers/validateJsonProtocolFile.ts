import Ajv from 'ajv'
import labwareV2Schema from '../../labware/schemas/2.json'
import protocolSchemaV1 from '../../protocol/schemas/1.json'
import protocolSchemaV2 from '../../protocol/schemas/2.json'
import protocolSchemaV3 from '../../protocol/schemas/3.json'
import protocolSchemaV4 from '../../protocol/schemas/4.json'
import protocolSchemaV5 from '../../protocol/schemas/5.json'

import type { ErrorObject } from 'ajv'
import type { JsonProtocolFile, ProtocolFileV1 } from '../../protocol'

export type ErrorKey = 'INVALID_FILE_TYPE' | 'INVALID_JSON_FILE'

interface ProtocolErrorDetails {
  rawError?: string
  schemaErrors?: ErrorObject[] | null
}

export type ProtocolParseErrorHandler = (
  errorKey: ErrorKey,
  errorDetails?: ProtocolErrorDetails
) => unknown

type ProtocolSchema =
  | typeof protocolSchemaV1
  | typeof protocolSchemaV2
  | typeof protocolSchemaV3
  | typeof protocolSchemaV4
  | typeof protocolSchemaV5

const SCHEMA_BY_VERSION: { [version: string]: ProtocolSchema } = {
  '1': protocolSchemaV1,
  '2': protocolSchemaV2,
  '3': protocolSchemaV3,
  '4': protocolSchemaV4,
  '5': protocolSchemaV5,
}

export type PythonProtocolMetadata = ProtocolFileV1<{
  [key: string]: unknown
}> & {
  source?: string
  [key: string]: unknown
}

// data may be a full JSON protocol or just a metadata dict from Python
export type ProtocolData =
  | JsonProtocolFile
  | { metadata: PythonProtocolMetadata }

export function parseProtocolData(
  file: File,
  contents: string,
  // optional Python protocol metadata
  metadata?: PythonProtocolMetadata | null,
  handleError?: ProtocolParseErrorHandler
): ProtocolData | null {
  if (fileExtensionIsJson(file.name)) {
    return validateJsonProtocolFileContents(contents, handleError)
  } else if (metadata != null) {
    // grab Python protocol metadata, if any
    return { metadata }
  }

  return null
}

export function fileExtensionIsPython(filename: string): boolean {
  return Boolean(/\.py$/i.test(filename))
}
export function fileExtensionIsJson(filename: string): boolean {
  return Boolean(/\.json$/i.test(filename))
}
export function fileExtensionIsZip(filename: string): boolean {
  return Boolean(/\.zip$/i.test(filename))
}
export function fileIsBinary(file: File): boolean {
  // bundles are always binary files, and currently nothing else is binary
  return fileExtensionIsZip(file.name)
}

export function validateJsonProtocolFileContents(
  fileContents: string,
  handleError?: ProtocolParseErrorHandler
): JsonProtocolFile | null {
  try {
    if (typeof fileContents !== 'string') {
      handleError && handleError('INVALID_FILE_TYPE')
      return null
    } else {
      const ajv = new Ajv({ allErrors: true, jsonPointers: true })
      // protocol schema contains reference to v2 labware schema, so give AJV access to it
      ajv.addSchema(labwareV2Schema)

      const parsedProtocol = JSON.parse(fileContents) as any
      let validateAgainstSchema
      if ('protocol-schema' in parsedProtocol) {
        // 'protocol-schema' key only present in V1
        validateAgainstSchema = ajv.compile(protocolSchemaV1)
      } else {
        const { schemaVersion } = parsedProtocol
        validateAgainstSchema = ajv.compile(
          SCHEMA_BY_VERSION[String(schemaVersion)]
        )
      }

      if (!validateAgainstSchema(parsedProtocol)) {
        handleError &&
          handleError('INVALID_JSON_FILE', {
            schemaErrors: validateAgainstSchema.errors,
          })
        return null
      }

      return parsedProtocol
    }
  } catch (error) {
    handleError && handleError('INVALID_JSON_FILE', { rawError: error })
    return null
  }
}
