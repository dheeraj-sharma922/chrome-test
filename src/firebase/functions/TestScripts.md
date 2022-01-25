# Test Scripts

## Import Data

### Procedure
1. Upload new files into firebase storage dev
2. Start firebase functions locally in shell mode
`
GOOGLE_APPLICATION_CREDENTIALS="../firebase/keys/rgc-dev.json" && npm run shell
`
3. Execute the respective commands to trigger local execution 

Card Values
```
dataImport({ bucket: 'gs://dataraise-retailplugin.appspot.com', id: 'gs://dataraise-retailplugin.appspot.com/data-files/credit-cards/Backend Templates - Credit Cards (1).csv', kind: 'storage#object', size: '1.62KB', storageClass: 'data', timeCreated: '2002-10-02T10:00:00-05:00', name: 'data-files/credit-cards/Backend Templates - Credit Cards (1).csv', contentType: 'text/csv' })
```

Retail Classifications
```
dataImport({ bucket: 'gs://dataraise-retailplugin.appspot.com', id: 'gs://dataraise-retailplugin.appspot.com/data-files/retail-classification/Backend Templates - Retail Classification (1).csv', kind: 'storage#object', size: '1.62KB ', storageClass : 'data', timeCreated: '2002-10-02T10:00:00-05:00', name: 'data-files/retail-classification/Backend Templates - Retail Classification (1).csv', contentType: 'text/csv' })
```

Card Values
```
dataImport({ bucket: 'gs://dataraise-retailplugin.appspot.com', id: 'gs://dataraise-retailplugin.appspot.com/data-files/card-value/Backend Templates - Card Value (1).csv', kind: 'storage#object', size: '1.62KB', storageClass : 'data', timeCreated: '2002-10-02T10:00:00-05:00', name: 'data-files/card-value/Backend Templates - Card Value (1).csv', contentType: 'text/csv' })
```
dataImport({ bucket: 'gs://dataraise-retailplugin.appspot.com', id: 'gs://dataraise-retailplugin.appspot.com/data-files/test/PortalRetailers.csv', kind: 'storage#object', size: '1.62KB', storageClass : 'data', timeCreated: '2002-10-02T10:00:00-05:00', name: 'data-files/test/PortalRetailers.csv', contentType: 'text/csv' })
