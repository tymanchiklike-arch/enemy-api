import { app } from './app.js'

const PORT = Number(process.env.PORT || 8787)

app.listen(PORT, () => {
  console.log('Enemy API: ' + (process.env.PUBLIC_BASE || 'http://localhost:' + PORT))
})
