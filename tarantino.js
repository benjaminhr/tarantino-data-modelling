const blessed = require('blessed')
const contrib = require('blessed-contrib')
const csv = require('csvtojson')
const csvFilePath = './data.csv'
const data = []
const words = {}
const sortedWords = []

const convertToJson = () => {
  return new Promise((resolve,reject) => {
    csv()
      .fromFile(csvFilePath)
      .on('json', (jsonObj) => {
        data.push(jsonObj)
        resolve(data)
      })
      .on('done', (err) => reject('error occured'))
  })
}

const createAndSortData = () => {
  return new Promise((resolve,reject) => {
    convertToJson()
      .then((json) => {
        json.forEach(item => {
          if (item.type == 'word') {
            words.hasOwnProperty(item.word) ? 
              words[item.word]++
            : words[item.word] = 1
          }
        })
      })
      .then(() => {
        for (let word in words) {
          sortedWords.push(
            [word, words[word]]
          )
        }

        sortedWords.sort((a, b) => {
          return b[1] - a[1]
        })

        resolve(sortedWords)
      })
      .catch(err => console.log)
  })
}

createAndSortData()
  .then(() => {    
    const screen = blessed.screen()
    const bar = contrib.bar({ 
      label: 'Most used swear words in Tarantino movies',
      barWidth:4,
      barSpacing: 12,
      xOffset: 0,
      maxHeight: 10,         
      xLabelPadding: 3
      , xPadding: 5
    })

    screen.append(bar)

    const words = []
    const count = []

    sortedWords.forEach(set => {
      words.push(set[0])
      count.push(set[1])
    })

    console.log(words)

    bar.setData({
      titles: words.splice(0,10),
      data: count.splice(0,10)
    })

    screen.key(['escape', 'q', 'C-c'], (ch, key) => {
      return process.exit(0);
    })

    screen.render()
  })