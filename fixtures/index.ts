/* eslint-disable import/no-unused-modules */
import path from 'path'
import fs from 'fs'
import type {ParsedXML, ParsedAd} from '../src/types'
import {parseXml} from '../src/xml'
import {getFirstAd} from '../src/vastSelectors'

export const vastWrapperXML = fs.readFileSync(
  path.join(__dirname, 'vast-wrapper.xml'),
  'utf8'
)
export const vastInlineXML = fs.readFileSync(
  path.join(__dirname, 'vast-inline.xml'),
  'utf8'
)
export const vastVpaidInlineXML = fs.readFileSync(
  path.join(__dirname, 'vast-vpaid-inline.xml'),
  'utf8'
)
export const legacyVastVpaidInlineXML = fs.readFileSync(
  path.join(__dirname, 'legacy-vast-vpaid-inline.xml'),
  'utf8'
)
export const vastPodXML = fs.readFileSync(
  path.join(__dirname, 'vast-pod.xml'),
  'utf8'
)
export const vastNoAdXML = fs.readFileSync(
  path.join(__dirname, 'vast-empty.xml'),
  'utf8'
)
export const vastWaterfallXML = fs.readFileSync(
  path.join(__dirname, 'vast-waterfall.xml'),
  'utf8'
)
export const vastWaterfallWithInlineXML = fs.readFileSync(
  path.join(__dirname, 'vast-waterfall-with-inline.xml'),
  'utf8'
)
export const vastInvalidXML = fs.readFileSync(
  path.join(__dirname, 'vast-invalid.xml'),
  'utf8'
)
export const hybridInlineXML = fs.readFileSync(
  path.join(__dirname, 'vast-hybrid-inline.xml'),
  'utf8'
)

export const wrapperParsedXML = parseXml(vastWrapperXML) as ParsedXML
export const inlineParsedXML = parseXml(vastInlineXML) as ParsedXML
export const vpaidInlineParsedXML = parseXml(vastVpaidInlineXML) as ParsedXML
export const legacyVpaidInlineParsedXML = parseXml(
  legacyVastVpaidInlineXML
) as ParsedXML
export const podParsedXML = parseXml(vastPodXML) as ParsedXML
export const noAdParsedXML = parseXml(vastNoAdXML) as ParsedXML
export const waterfallParsedXML = parseXml(vastWaterfallXML) as ParsedXML
export const waterfallWithInlineParsedXML = parseXml(
  vastWaterfallWithInlineXML
) as ParsedXML
export const vastInvalidParsedXML = parseXml(vastInvalidXML) as ParsedXML
export const hybridInlineParsedXML = parseXml(hybridInlineXML) as ParsedXML

export const wrapperAd = getFirstAd(wrapperParsedXML) as ParsedAd
export const inlineAd = getFirstAd(inlineParsedXML) as ParsedAd
export const hybridInlineAd = getFirstAd(hybridInlineParsedXML) as ParsedAd
export const vpaidInlineAd = getFirstAd(vpaidInlineParsedXML) as ParsedAd
export const legacyVpaidInlineAd = getFirstAd(
  legacyVpaidInlineParsedXML
) as ParsedAd
