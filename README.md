# Giftwrap

A Node.js app that watches a folder for videos in formats and wrappers that nobody can use (MKV, 2t, etc.) and transmuxes them to MP4 so that people can actually do something with them (read: AirPlay to Apple TV.)

# Requirements

- Node.js
- NPM (If you have Node.js, you should already have/want this.)
- ffmpeg
- libx264
- Coffeescript (This can be avoided by running `node application.js`)

## Installation

### ffmpeg & libx264
Download binary for ffmpeg from http://ffmpeg.org/download.html

### NPM Dependencies
`npm install` inside the app directory.

After installing all the dependencies, run the app with `coffee application.coffee`

## Usage

`coffee application.coffee`

If you don't want to install CoffeeScript, run the JS instead:

`node application.js`

## How It Works

The main purpose of the app is to just ditch the idiotic MKV wrapper format and copy the video content to MP4. This _should_ require no video quality loss or re-encoding but will have to convert AC3 audio streams to AAC. Because there is very little encoding going on it runs really fast and is probably more limited by I/O than CPU.

Any good Bittorrent client (Transmission) will run scripts that can move finished files into the processing directory so everything happens automatically.
