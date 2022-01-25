import { RuntimeOptions, runWith } from 'firebase-functions'
import { rest } from '../../express/rest'
import { db } from '../firebase'

// Initialize Rest API
const express = rest(db)
const settings: RuntimeOptions = {
  timeoutSeconds: 30,
  memory: '512MB'
}

exports = module.exports = runWith(settings).https.onRequest(express)
