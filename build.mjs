import { Parcel } from '@parcel/core'
import copyfiles from 'copyfiles'
import rimraf from 'rimraf'
import minimist from 'minimist'
import fs from 'fs'
import archiver from 'archiver'

const { browser } = minimist(process.argv.slice(2))

const clean = async () => {
  return new Promise((resolve, reject) => {
    rimraf(`dest-${browser}`, (err) => {
      if (err) {
        reject(err)
      } else {
        rimraf(`dest-${browser}.zip`, (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      }
    })
  })
}

const scriptBundler = new Parcel({
  entries: ['app/scripts/main.js'],
  defaultConfig: '@parcel/config-default',
  defaultTargetOptions: {
    distDir: `dest-${browser}/scripts`,
    sourceMaps: false,
    context: 'service-worker',
  },
})

const optionsBundler = new Parcel({
  entries: 'app/options/options.html',
  defaultConfig: '@parcel/config-default',
  defaultTargetOptions: {
    distDir: `dest-${browser}/options`,
    publicUrl: './',
    sourceMaps: false,
    context: 'browser',
  },
})

const copyStaticFiles = async () => {
  return new Promise((resolve, reject) => {
    copyfiles(
      [
        'app/manifest.json',
        'app/images/*',
        'app/scripts/pip.js',
        'app/styles/*',
        `dest-${browser}`,
      ],
      { up: 1 },
      (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}

const modifyManifestForFirefox = () => {
  const manifest = JSON.parse(
    fs.readFileSync(`dest-${browser}/manifest.json`, 'utf8')
  )
  manifest.background.scripts = [manifest.background.service_worker]
  delete manifest.background.service_worker
  delete manifest.background.type
  fs.writeFileSync(
    `dest-${browser}/manifest.json`,
    JSON.stringify(manifest, null, 2)
  )
}

const zipFolder = async () => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(`./dest-${browser}.zip`)
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    })
    output.on('close', function () {
      resolve()
    })
    archive.on('error', function (err) {
      throw reject(err)
    })
    archive.pipe(output)
    archive.directory(`./dest-${browser}`, false)
    archive.finalize()
  })
}

/**
 * Commands
 */

console.log('Cleaning dest folder')
await clean()
console.log('Building scripts...')

for (const bundler of [scriptBundler, optionsBundler]) {
  try {
    const { bundleGraph, buildTime } = await bundler.run()
    const bundles = bundleGraph.getBundles()
    console.log(`Built ${bundles.length} bundles in ${buildTime}ms!`)
  } catch (err) {
    console.log(err.diagnostics)
  }
}

await copyStaticFiles()

if (browser === 'firefox') {
  modifyManifestForFirefox()
}

await zipFolder()

console.log(`✨ Done!`)
