const path = require('path');

module.exports = {
  // This is the entry point or start of your server
  entry: './src/index.js',  // Adjust if your entry file is different
  // This is where the output of the webpack compilation goes
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  target: 'node',  // Important: this specifies that the target environment is Node.js
  module: {
    rules: [
      {
        test: /\.js$/,  // This will process all .js files
        exclude: /node_modules/,  // Do not process node_modules folder
        use: {
          loader: 'babel-loader',  // This will use babel-loader for the files
          options: {
            presets: ['@babel/preset-env']  // This preset compiles ES6 and above down to ES5
          }
        }
      }
    ]
  }
};
