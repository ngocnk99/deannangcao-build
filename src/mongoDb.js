import mongoose from 'mongoose';
import config from './config';

const URL_CONNECTION = 'mongodb://'+config.MONGO_USER + ':' + config.MONGO_PASSWORD + '@' + config.MONGO_HOST+'/'+config.MONGO_DATABASE+'?retryWrites=true&w=majority';

/**
 *
 */
export default class MongoDb {
  /**
   *
   */
  constructor() {
    this.mongoDb = null;
  }

  /**
   *
   */
  init() {

    let options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true,
      useFindAndModify: false,
      // autoIndex: false, // Don't build indexes
      poolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4,// Use IPv4, skip trying IPv6,
      server: {
        auto_reconnect: true,
        socketOptions: {
          keepAlive: 1,
          connectTimeoutMS: 60000,
          socketTimeoutMS: 60000,
        }
      }
    };

    if (config.LOGGING_DATA_TO_MONGO === 'true') {

      mongoose.connect(URL_CONNECTION, options);
      this.mongoDb = mongoose.connection;

      // this.mongoDb.on('error', console.error.bind(console, 'connection error:'));
      this.mongoDb.once('open', function () {
        console.log('Mongoose Connect succes on ' + URL_CONNECTION);
      });
      this.mongoDb.on('error', () => {
        console.error.bind(console, 'connection error');
        mongoose.disconnect();
      });
      this.mongoDb.on('reconnect', () => { console.log('-> reconnected'); });
      this.mongoDb.on('disconnected', () => {
        console.log('MongoDB disconnected!');
        mongoose.connect(process.env.URI, options);
      });
    }

    return this.mongoDb;
  }
};
