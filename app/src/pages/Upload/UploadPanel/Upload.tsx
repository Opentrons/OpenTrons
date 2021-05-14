import * as React from 'react'
import { UploadInput } from './UploadInput'
import { ConfirmUploadModal } from './ConfirmUploadModal'
import { UploadMenu } from './UploadMenu'

export interface UploadProps {
  filename: string | null | undefined
  sessionLoaded: boolean | null | undefined
  createSession: (file: File) => unknown
}

interface UploadState {
  uploadedFile: File | null | undefined
}

export class Upload extends React.Component<UploadProps, UploadState> {
  constructor(props: UploadProps) {
    super(props)
    this.state = { uploadedFile: null }
  }

  onUpload:
    | React.ChangeEventHandler<HTMLInputElement>
    | React.DragEventHandler = (
    event: React.ChangeEvent<HTMLInputElement> | React.DragEvent
  ) => {
    let files: File[] = []
    if (event.dataTransfer && event.dataTransfer.files) {
      files = event.dataTransfer.files as any
    } else if (event.target?.files) {
      files = event.target.files as any
    }

    if (this.props.sessionLoaded) {
      this.setState({ uploadedFile: files[0] })
    } else {
      this.props.createSession(files[0])
    }

    event.currentTarget.value = ''
  }

  confirmUpload: () => void = () => {
    const { uploadedFile } = this.state

    if (uploadedFile) {
      this.props.createSession(uploadedFile)
      this.forgetUpload()
    }
  }

  forgetUpload: () => void = () => {
    this.setState({ uploadedFile: null })
  }

  render(): JSX.Element {
    const { uploadedFile } = this.state
    const { filename } = this.props

    return (
      <>
        {filename && <UploadMenu />}
        <UploadInput onUpload={this.onUpload} isButton />
        <UploadInput onUpload={this.onUpload} />

        {uploadedFile && (
          <ConfirmUploadModal
            confirm={this.confirmUpload}
            cancel={this.forgetUpload}
          />
        )}
      </>
    )
  }
}