var Sheets = function (opts) {
    const key = opts.key
    const query = opts.query
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/'
    const targetUrl = 'https://spreadsheets.google.com/tq?callback=test&key=' + key
    let url = proxyUrl + targetUrl
    if (query) {
        url += '&tq=' + query
    }

    this.getData = (callback) => {
        fetch(url)
          .then(blob => blob.text())
          .then(response => {
              response = convertToJSON(response)
              callback(response)
              //console.log(response)
          })
    }

    const convertToJSON = (response) => {
        // get rid of prefix: google.visualization.Query.setResponse(
        response = response.split('google.visualization.Query.setResponse(')[1]
        // get rid of trailing );
        response = response.substring(0, response.length - 2)
        response = JSON.parse(response)
        return simplifyData(response)
    }

    const simplifyData = jsonData => {
        const columns = jsonData.table.cols
        const records = jsonData.table.rows
        //console.log(columns)
        //console.log(records)

        // create an array of arrays with cell data
        const values = records.map(record => {
            return record.c.map((cell) => cell ? cell.v : '')
        })
        const keys = columns.map(column => {
            return column.label.toLowerCase().replace(/[&\/\\#,+\s+()\-$~%.'":*?<>{}]/g,'_')
        })

        // generate objects from the values with
        const objectData = values.map((valuesArray) => {
            const object = {}
            valuesArray.forEach((value, index) => {
                // don't overthink this bit, it's using the keys array to match
                // the column name (key) with the cell data (value)
                object[keys[index]] = value
            })
            return object
        })
        return objectData
    }
}
