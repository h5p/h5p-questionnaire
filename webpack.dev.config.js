var path = require('path');
var autoprefixer = require('autoprefixer');
const nodeEnv = process.env.NODE_ENV || 'development';

module.exports = {
  mode: nodeEnv,
  context: path.resolve(__dirname, 'src'),
  entry: "./entries/dev.js",
  output: {
    path: path.join(__dirname, '/build'),
    filename: "dev.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, "src/content"),
          path.resolve(__dirname, "src/scripts"),
          path.resolve(__dirname, "src/entries")
        ],
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        include: [
          path.resolve(__dirname, "src/content"),
          path.resolve(__dirname, "src/scripts")
        ],
        use: [
          'css-loader',
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  autoprefixer
                ],
              },
            },
          },
        ]
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url?limit=10000&mimetype=application/font-woff"
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: "file-loader"
      },
      {
        test: /\.png$/,
        use: [
          { name: '[name].[ext]' }
        ]
      }
    ]
  },
  devtool: 'inline-source-map',
  devServer: {
    port: 8050,
    contentBase: "./build",
    quiet: true
  }
};
