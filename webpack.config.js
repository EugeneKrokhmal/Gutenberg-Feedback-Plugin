const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
    ...defaultConfig,
    entry: {
        index: './src/index.js',
        formRender: './src/blocks/feedback-form/frontend.js',
        entriesRender: './src/blocks/entries-list/frontend.js',

    },
    output: {
        filename: '[name].js',
        path: __dirname + '/build',
    },
    externals: {
        '@wordpress/i18n': ['wp', 'i18n'],
        '@wordpress/element': ['wp', 'element'],
        '@wordpress/block-editor': ['wp', 'blockEditor'],
    },      
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@wordpress/babel-preset-default'],
                        plugins: ['@babel/plugin-transform-react-jsx']
                    }
                }
            }
        ]
    }
};
