import log from 'loglevel'

log.setDefaultLevel(import.meta.env.PROD ? 'warn' : 'debug')

export default log