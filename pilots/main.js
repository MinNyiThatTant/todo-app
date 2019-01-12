const { app } = require('electron')

const Window = require('./Window')

function main(){
  const mainWindow = new Window({
    file: 'index.html',
  })
  console.log(mainWindow)
}

app.on('ready', main)

app.on('window-all-closed', () => app.quit())
