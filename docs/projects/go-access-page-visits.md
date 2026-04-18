---
title: "GoAccess Page Statistics Dashboard"
description: How to set up self-hosted page visit statistics on an nginx server using the Visitors tool or GoAccess, including a scheduled Node.js script for automated HTML report generation.
tags: [nginx, analytics, self-hosted, linux, nodejs]
keywords:
  - goaccess
  - nginx statistics
  - self-hosted analytics
  - page visit tracking
  - nginx access log
sidebar_position: 2
---

# Go Access - Easy Page Statistics Dashboard

Example GoAccess Widget

![GoAccess visitor statistics widget](/images/tech/goaccess-visitor.png)

## Option 1 - Visitors

Hey there! In this post, I am going to quickly explain, how one can find the count of unique visitors on any server
running nginx.

> This how-to has been tested on [Ubuntu Server 18.04.2 LTS](https://www.ubuntu.com/download/server).

To reach this goal, we are going to use the tool [Visitors](http://www.hping.org/visitors/). We will have to download
the sourcecode, compile it to a usable program and feed it our access.log[^1].

Lets go.

1. Create a new directory where you want to place `visitors`.
2. `cd` into this directory and download the sourcecode. At the time of writing, the current version is `0.7`.

    ```bash
    cd ~/your/path && wget http://www.hping.org/visitors/visitors-0.7.tar.gz
    ```

3. This archive needs to be `unzipped.`.

    ```bash
    tar -xzvf visitors-0.7.tar.gz
    ```

4. The sourcecode needs to be compiled.

    ```bash
    make
    ```

    - If `make` fails or you are unable to execute it, your machine needs the essential build tools.

        ```bash
        # as sudo
        apt-get install build-essential
        ```

5. We are now able to let `visitors` parse the access.log[^1] and generate a `report.html` file.

    ```bash
    ~/your/path/visitors_0.7/visitors /var/log/nginx/access.log > report.html
    ```

If done correctly, `Visitors` will have written its report into the `report.html` file inside its root
folder. `cd ~/your/path/visitors_0.7/`.

Since you are most likely on a commandline only machine, you will need a handy solution to `view` this .html file. For
this, we will be using [Lynx](https://invisible-island.net/lynx/) - a text only webbrowser.

All common distributions will have Lynx in its repository. Therefore one can easily install it via the following
command:

```bash
apt-get install lynx
```

Feeding Lynx our `report.html`, gives you the opportunity to step through the report, using your keyboard.

The page will look similar to this: ![Lynx terminal browser displaying nginx access log HTML report](/images/tech/lynx.png)

Text written in Green, represent links.

Using your keyboard, `right` will follow this link, whereas `left` will go `back`.
`up` and `down` let you navigate your cursor. Quit with `Q`.

As you can see in the above screenshot, lynx will analyse and group its results by day, month and pages as well as other
files. Feel free to explore!

[^1]: Default location `/var/log/nginx/access.log`

## Option 2 - GoAccess Dashboard

[GoAccess](https://goaccess.io/)

To run the generation commands successfully, make sure that you have `zcat` and `goaccess` installed and available on
your `$PATH`.

### Simple CLI static generation

```bash
zcat -f /var/log/nginx/access.log.*.gz | 
    goaccess /var/log/nginx/access.log - 
    -o /var/www/goaccess/report.html 
    --log-format=COMBINED 
    --html-report-title=my-dashboard
```

### Automatic, scheduled script generation

The following script runs based on a .env millisecond schedule. It generates a single `.html` goaccess dashboard file
for each "group" of nginx log files. All generated `.html` dashboard files will be writte
to `/var/www/goaccess/<your-app-name/report.file`. You can either visit them directly or build a small dashboard which
links to each - for example.

You can specify the nginx output file name in the nginx config like this:

```conf
server {
[...]
    access_log /var/log/nginx/my-app-1/access.log;
    error_log /var/log/nginx/my-app-1/error.log;
[...]
}
```

![GoAccess time-based traffic chart](/images/tech/goaccess-time.png)

![GoAccess browser breakdown chart](/images/tech/goaccess-browser.png)

```javascript
const dotenvParseOutput = require('dotenv').config()
const {exec} = require('child_process');
const fs = require('fs');
const _ = require('lodash');

// DOTENV
const TIMER_MS = process.env.TIMER_MS;

/**
 * List of nginx apps / single sites to track. Each app needs to correspond to the
 * /var/log/nginx/<appName>/access.log path <appName> variable.
 * @type {string[]}
 */
const APPS = [
    'my-app-1',
    'my-app-2',
    'unsorted' // all "other" non categoriesd nginx logs
];

const basePathLogs = "/var/log/nginx";
const accessLog = "/access.log";
const accessLogWildcard = accessLog + ".*.gz";

function getAccessLogPath(appName, isWildcard) {
    const appPath = appName === 'unsorted' ? '' : appName;
    const base = basePathLogs + "/" + appPath + accessLog;
    const wildcard = basePathLogs + "/" + appPath + accessLogWildcard;

    return isWildcard ? wildcard : base;
}

const basePathReports = "/var/www/goaccess";
const reportFile = "/report.html";

function getReportPath(appName) {
    return basePathReports + "/" + appName + reportFile;
}

/**
 * Creates the goaccess --ws-url option string for a given app
 * @param appName
 * @returns {string}
 */
function getHtmlTitle(appName) {
    return "--html-report-title=" + appName + "_statistics";
}

const logFormat = "--log-format=COMBINED";

/**
 * Example: zcat -f /var/log/nginx/access.log.*.gz | goaccess /var/log/nginx/access.log - -o /var/www/goaccess/report.html --log-format=COMBINED --html-report-title=cffc_statistics
 * Create a goaccess report.html for the given app and its access.log location
 * @param appName -> the apps name
 */
function buildCommand(appName) {
    const cmdLogWildcardPath = getAccessLogPath(appName, true)
    const cmdLogPath = getAccessLogPath(appName, false)
    const reportPath = getReportPath(appName);

    const commandFragments = [];
    commandFragments.push('zcat -f')
    commandFragments.push(cmdLogWildcardPath)
    commandFragments.push('|')
    commandFragments.push('goaccess')
    commandFragments.push(cmdLogPath)
    commandFragments.push('-')
    commandFragments.push('-o')
    commandFragments.push(reportPath)
    commandFragments.push(logFormat)
    commandFragments.push('--user-name=root')
    commandFragments.push('--real-os')
    commandFragments.push('--ignore-crawlers')
    commandFragments.push('--anonymize-ip')
    commandFragments.push(getHtmlTitle(appName))

    return commandFragments.join(" ");
}

function start() {
    console.log("If not installed, please install zcat/gzip and goaccess manually! \n");
    checkPaths();
    schedule();
}

/**
 * Check if nginx log path and goaccess output report path exist {@link APPS}.
 * Create if not.
 */
function checkPaths() {
    function getPathOnly(filePath) {
        return filePath.substring(0, filePath.lastIndexOf("/"));
    }

    _.forEach(APPS, function (app) {
        const ACCESS_LOG_PATH = getPathOnly(getAccessLogPath(app, false));
        const REPORT_PATH = getPathOnly(getReportPath(app));

        console.log("Check and create path for: ", ACCESS_LOG_PATH);
        console.log("Check and create path for: ", REPORT_PATH);

        fs.mkdirSync(ACCESS_LOG_PATH, {recursive: true});
        fs.mkdirSync(REPORT_PATH, {recursive: true});
    });
}

/**
 * Execute goaccess report html generation for each given appname / path segment
 */
function schedule() {
    const commands = _.map(APPS, buildCommand);

    setInterval(() => {
        _.forEach(commands, function (command) {
            const cmd = exec(command, function (error, stdout, stderr) {
                if (error) {
                    console.log(error.stack);
                    console.log('Error code: ' + error.code);
                    console.log('Signal received: ' + error.signal);
                } else {
                    console.log(command);
                    console.log(stdout);
                }
            });

            cmd.on('exit', function (code) {
                // do nothing
            });
        });
    }, TIMER_MS)
}

// start the app
start();
```

Thanks for reading!

luca
