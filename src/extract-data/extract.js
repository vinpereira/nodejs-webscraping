const appRoot = require('app-root-path')
const fs = require('fs')
const request = require('request')
const parser = require('xml2json')

const removeDiacritics = require(appRoot + '/helpers/remove-diacritics')
const statesCities = require(appRoot + '/config/estados-cidades.json')      // JSON with every states and cities in Brazil

const BASE_URL = 'http://www.calendario.com.br/api/api_feriados.php?'       // Brazilian Holidays API
const TOKEN = 'dmluaWNpdXMucGVyZWlyYUBpY29sYWJvcmEuY29tLmJyJmhhc2g9NDI2NzIzMTM='

const outputDir = appRoot + '/src/extract-data/data/'

let yearsArray = [2017]

// let yearsArray = []

// create an array of years -- from 2017 to 2047
// for (let index = 0; index <= 30; index++) {
//     yearsArray.push(`${2017 + index}`)
// }

for (let index = 0; index < yearsArray.length; index++) {      // for each year in yearsArray
    for (let i = 0; i < statesCities.estados.length; i++) {     // for each state in statesCities
        if (statesCities.estados[i].sigla === 'SP') {
            for (let j = 0; j < statesCities.estados[i].cidades.length; j++) {      // for each city (inside each state) in statesCities
                if (statesCities.estados[i].cidades[j] === 'São Paulo') {
                    let formattedCityName = statesCities.estados[i].cidades[j].toUpperCase()
                    formattedCityName = formattedCityName.replace(/\s/g, '_')       // replace every whitespace with _
                    formattedCityName = removeDiacritics(formattedCityName)         // remove every diacritics

                    let holidaysFile = yearsArray[index] + '_' + formattedCityName + '_city_holidays.json'

                    // create the URL to access the Brazilian Holidays API
                    // based on: http://www.calendario.com.br/api/api_feriados.php?ano=2047&estado=SP&cidade=SAO_PAULO&token=dnAudmluaWNpdXMucGVyZWlyYUBnbWFpbC5jb20maGFzaD0xNTMxMTU2MTc=
                    let url = BASE_URL + 'ano=' + yearsArray[index] + '&estado=' + statesCities.estados[i].sigla + '&cidade=' + formattedCityName + '&token=' + TOKEN

                    request(url, function(error, response, body) {
                        let json = parser.toJson(body)  // Transform XML into JSON

                        // console.log(json)

                        // save info in a JSON file
                        fs.writeFile(outputDir + holidaysFile, json, function(err) {
                            if(err) {
                               console.log(err);
                            } else {
                                console.log("JSON saved to " + holidaysFile);
                            }
                        });
                    })
                }
            }
        }
    }
}
