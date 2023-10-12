# Video Ad SDK

This is a fork of [MailOnline/mol-video-ad-sdk](https://github.com/MailOnline/mol-video-ad-sdk), made to move its development forward. The main repository has been inactive since February 2019.

To run video ads in the browser there are many alternatives. The most famous one is probably Google's [IMA SDK](https://developers.google.com/interactive-media-ads/docs/sdks/html5/) for HTML5. There are two main cons with that SDK. It only works through DoubleClick and it is a black box very hard to debug and to maintain. This SDK tries to offer an alternative to play video ads that can work with any player in the world and any ad server that supports the VAST specification. And since it is open source you can read the code and debug if you need to.

## Install

```sh
npm install video-ad-sdk
```

or

```sh
yarn add video-ad-sdk
```

## Usage

Try to start one of the ads returned by the `adTag`

```ts
import {runWaterfall} from 'video-ad-sdk'

const adTag = 'https://adserver.com/vastadtaguri'

const videoAdContainer = document.querySelector('.video-ad-container')

const onAdReady = (adUnit) => {
  // ad is ready
}

const onError = (error) => {
  // ad is failed
}

runWaterfall(adTag, videoAdContainer, {
  onAdReady,
  onError
})
```

## Demo

Demo [here](https://rambler-digital-solutions.github.io/video-ad-sdk/demo/)!

## Documentation

Currently we only have the API which you can check [here](https://rambler-digital-solutions.github.io/video-ad-sdk/docs/).

## Contributing

### Start

After you clone the repo you just need to run [`yarn`](https://yarnpkg.com/lang/en/docs/cli/#toc-default-command)'s default command to install and build the packages

```
yarn
```

### Testing

We have a test suite consisting of a bunch of unit tests to verify utils keep working as expected. Test suit is run in CI on every commit.

To run the tests

```
yarn test
```

To run the tests in watch mode

```sh
yarn test:watch
```

### Code quality

To run linting the codebase

```sh
yarn lint
```

To check typings

```sh
yarn typecheck
```

To check bundle size

```sh
yarn sizecheck
```

## Discussion

Please open an issue if you have any questions or concerns.

## License

MIT
