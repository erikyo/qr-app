import React, { useEffect, useState, useRef } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { MuiColorInput } from 'mui-color-input'
import './App.css'
import { Accordion, AccordionDetails, AccordionSummary, Button, ListSubheader, MenuItem, Select, Slider, Stack, TextField, Typography } from '@mui/material'

import { BrowserQRCodeSvgWriter } from '@zxing/browser'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { appWindow } from '@tauri-apps/api/window'

import JsBarcode from 'jsbarcode'
import { DOMImplementation } from 'xmldom'
import { EncodeHintType } from '@zxing/library'

interface Props {
  color: string
  size: number
  margin: number
  background: string
  text: string
  format: string
  errorCorrection: string
}

const defaultProps: Props = {
  text: 'www.codekraft.it',
  color: '#000000',
  background: '#ffffff',
  size: 300,
  margin: 0,
  format: 'QR_CODE',
  errorCorrection: 'Q'
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  }
})

function App () {
  const [attributes, setAttributes] = useState(defaultProps)
  const [qrCode, setQrCode] = useState(null)

  const qrCodeRef = useRef<HTMLDivElement>()

  const handleChange = (key: string, newValue: string): void => {
    if (Object.prototype.hasOwnProperty.call(attributes, key)) {
      setAttributes({
        ...attributes,
        [key]: newValue
      })
    } else {
      console.error('cannot find the attribute')
    }
  }

  useEffect(() => {
    const text = attributes.text ?? ''
    try {
      if (attributes.format === 'QR_CODE') {
        /**
           * QR CODE
           */
        const hints = new Map<EncodeHintType, any>()
        hints.set(EncodeHintType.MARGIN, attributes.margin)
        hints.set(EncodeHintType.ERROR_CORRECTION, attributes.errorCorrection)

        const writer = new BrowserQRCodeSvgWriter()
        const svg = writer.write(
          text,
          attributes.size,
          attributes.size,
          hints
        )

        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
        svg.setAttribute('version', '1.1')

        // Traverse the SVG structure and set the color of relevant elements
        const rects = svg.querySelectorAll('rect')
        rects.forEach((rect) => {
          rect.setAttribute('fill', attributes.color)
        })

        // Traverse the SVG structure and set the background color
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('width', '100%')
        rect.setAttribute('height', '100%')
        rect.setAttribute('fill', attributes.background)

        // Insert the <rect> element as the first child of the SVG
        svg.insertBefore(rect, svg.firstChild)

        console.log(svg.outerHTML)

        setQrCode(svg.outerHTML)
      } else {
        /**
           * BARCODE
           */
        const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null)
        const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svgNode.setAttribute('height', attributes.size)
        svgNode.setAttribute('width', attributes.size)

        // Traverse the SVG structure and set the background color
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('width', '100%')
        rect.setAttribute('height', '100%')
        rect.setAttribute('fill', attributes.background)

        // Insert the <rect> element as the first child of the SVG
        svgNode.insertBefore(rect, svgNode.firstChild)

        JsBarcode(svgNode, attributes.text, {
          xmlDocument: document,
          format: attributes.format,
          height: attributes.size * 0.1,
          margin: attributes.margin
        })

        setQrCode(svgNode)
      }
    } catch (error) {
      console.error(error)
    }
  }, [attributes])

  return (
        <ThemeProvider theme={darkTheme}>
            <div data-tauri-drag-region className="titlebar">
                <div className="titlebar-button" id="titlebar-minimize" onClick={ async () => { await appWindow.minimize() }}>
                    <img
                        src="https://api.iconify.design/mdi:window-minimize.svg"
                        alt="minimize"
                    />
                </div>
                <div className="titlebar-button" id="titlebar-maximize" onClick={ async () => { await appWindow.maximize() }}>
                    <img
                        src="https://api.iconify.design/mdi:window-maximize.svg"
                        alt="maximize"
                    />
                </div>
                <div className="titlebar-button" id="titlebar-close" onClick={async () => { await appWindow.close() }}>
                    <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
                </div>
            </div>
            <div className="container">
                <div className="form_container">
                    <Select
                        sx={{ width: '100%' }}
                        value={attributes.format}
                        onChange={(event) => {
                          handleChange('format', event.target.value)
                        }}
                    >
                        <ListSubheader>Category 1D</ListSubheader>
                        <MenuItem value="UPC">UPC</MenuItem>
                        <MenuItem value="EAN8">EAN-8</MenuItem>
                        <MenuItem value="EAN13">EAN-13</MenuItem>
                        <MenuItem value="CODE128">Code 128</MenuItem>
                        <MenuItem value="CODABAR">Codabar</MenuItem>

                        <ListSubheader>Category 2D</ListSubheader>
                        <MenuItem value="QR_CODE">QR Code</MenuItem>
                        <MenuItem value="DATA_MATRIX">Data Matrix</MenuItem>

                    </Select>
                    <TextField name="text"
                               id="text"
                               value={attributes.text}
                               sx={{ width: '100%' }}
                               label="Qr text / link"
                               variant="outlined"
                               onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                 setAttributes({
                                   ...attributes,
                                   text: event.target.value
                                 })
                               }}/>

                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon/>}
                            aria-controls="settings-content"
                            id="settings-header"
                        >
                            <SettingsOutlinedIcon color={'primary'}/>
                            <Typography>Settings</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {
                                // Qr code only
                                attributes.format === 'QR_CODE' &&
                              <Select
                                id={'errorCorrection'}
                                value={ attributes.errorCorrection }
                                sx={{ width: '100%' }}
                                onChange={(event) => {
                                  handleChange('errorCorrection', event.target.value)
                                }}
                              >
                                <MenuItem value="L">L - Low</MenuItem>
                                <MenuItem value="M">M - Medium</MenuItem>
                                <MenuItem value="Q">Q - Quality</MenuItem>
                                <MenuItem value="H">H - High</MenuItem>
                              </Select>}

                            <Stack spacing={2} direction="column" alignItems={'center'}>
                                <Stack spacing={2} direction="row" alignItems={'center'} width={'100%'}>
                                    <label style={{ width: '80px', textAlign: 'left' }} htmlFor="size" className="form__label">Size</label>
                                    <Slider name="size"
                                            id="size"
                                            defaultValue={300}
                                            marks
                                            sx={{ width: '100%' }}
                                            value={attributes.size}
                                            step={10}
                                            min={50}
                                            max={1500}
                                            aria-label="Size"
                                            valueLabelDisplay="auto"
                                            onChange={(_event: Event, newValue) => {
                                              setTimeout(() => {
                                                setAttributes({
                                                  ...attributes,
                                                  size: newValue as number
                                                })
                                              }, 10)
                                            }}
                                    />
                                </Stack>

                                <Stack spacing={2} direction="row" alignItems={'center'} width={'100%'}>
                                    <label style={{ width: '80px', textAlign: 'left' }} htmlFor="size" className="form__label">Margin</label>
                                    <Slider name="margin"
                                            id="margin"
                                            defaultValue={300}
                                            marks
                                            sx={{ width: '100%' }}
                                            value={attributes.margin}
                                            step={10}
                                            min={0}
                                            max={1500}
                                            aria-label="Margin"
                                            valueLabelDisplay="auto"
                                            onChange={(_event: Event, newValue) => {
                                              setTimeout(() => {
                                                setAttributes({
                                                  ...attributes,
                                                  margin: newValue as number
                                                })
                                              }, 10)
                                            }}
                                    />
                                </Stack>

                                <Stack spacing={2} direction="row" width={'100%'}>
                                    <MuiColorInput name="background"
                                                   id="background"
                                                   sx={{ width: '100%' }}
                                                   value={attributes.background}
                                                   label="Background"
                                                   onChange={(newValue) => {
                                                     handleChange('background', newValue)
                                                   }}/>
                                    <MuiColorInput name="color"
                                                   id="color"
                                                   sx={{ width: '100%' }}
                                                   value={attributes.color}
                                                   label="Color"
                                                   onChange={(newValue) => {
                                                     handleChange('color', newValue)
                                                   }}/>
                                </Stack>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                </div>

                <div ref={qrCodeRef} className="card">
                    {qrCode !== null && <img width={attributes.size} height={attributes.size} src={`data:image/svg+xml;utf8,${encodeURIComponent(qrCode)}`} />}
                </div>

                <Stack spacing={2} direction="row" justifyContent={'center'}>
                    <Button
                        style={{ lineHeight: '40px' }}
                        onClick={() => {
                          const svgData = qrCode // Assuming qrCode contains the SVG content

                          if (svgData) {
                            const blob = new Blob([svgData], { type: 'image/svg+xml' })
                            const url = URL.createObjectURL(blob)

                            const link = document.createElement('a')
                            link.href = url
                            link.download = attributes.text + '.svg' // Set the desired file name
                            link.click()

                            URL.revokeObjectURL(url)
                          }
                        }}
                    >
                        Download SVG
                    </Button>

                    <Button
                        style={{ lineHeight: '40px' }}
                        onClick={() => {
                          if (qrCode) {
                            const svgData = qrCode // Assuming qrCode contains the SVG content

                            if (svgData) {
                              const blob = new Blob([svgData], { type: 'image/png' })
                              const url = URL.createObjectURL(blob)

                              const link = document.createElement('a')
                              link.href = url
                              link.download = attributes.text + '.png' // Set the desired file name
                              link.click()

                              URL.revokeObjectURL(url)
                            }
                          }
                        }}
                    >
                        Download PNG
                    </Button>

                </Stack>
            </div>
        </ThemeProvider>
  )
}

export default App
