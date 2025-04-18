---
draft: true
---
# Adobe IO - App Builder

## Download and Upload to AEM Assets

> The following script downloads and uploads assets from a given URL to AEM Cloud Assets. It downloads the source asset
> in parts, according to the amount of presigned URLs AEM provides.
>
> This ensures a low memory footprint.

AEM Asset Upload is broken down into three steps:

1. Initiate Upload
2. Upload Binary
3. Complete Upload

The script has a function for each step, as well as some helper functions. The flow is orchestrated by
`streamAssetToAEM()`.

This is not a short script. Ive additionally removed almost all logging calls, as well as property validation, to
improve readability.

```js
// https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/admin/developer-reference-material-apis#initiate-upload
async function initUpload({host, folderPath, fileName, fileSize, auth, logger = console}) {
    const fetch = require('node-fetch');

    try {
        // Format: https://<aem-url>/content/dam/<asset-folder>.initiateUpload.json
        const url = `${host}/content/dam/${folderPath}.initiateUpload.json`;

        const formData = new URLSearchParams();
        formData.append('fileName', fileName);
        formData.append('fileSize', fileSize);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': auth
            },
            body: formData
        });

        const data = await response.json();

        const cookies = response.headers.get('set-cookie');
        const affinityCookie = cookies || null;

        return {
            success: true,
            data,
            affinityCookie
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/admin/developer-reference-material-apis#upload-binary
async function upload({uploadURL, binaryData, logger = console}) {
    const fetch = require('node-fetch');

    try {
        const response = await fetch(uploadURL, {
            method: 'PUT',
            // No authentication, urls are presigned by AEM
            headers: {
                'Content-Type': 'application/octet-stream'
            },
            body: binaryData
        });

        if (!response.ok) {
            throw new Error(`Upload failed with status: ${response.status}`);
        }

        return {
            success: true
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/admin/developer-reference-material-apis#complete-upload
async function completeUpload({completeURI, uploadToken, fileName, mimeType, auth, affinityCookie, logger = console}) {
    const fetch = require('node-fetch');

    try {
        // Create form data for the complete request (instead of JSON)
        const formData = new URLSearchParams();
        formData.append('fileName', fileName);
        formData.append('uploadToken', uploadToken);
        formData.append('mimeType', mimeType);

        // Setup headers including the affinity cookie
        const headers = {
            'Authorization': auth,
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        if (affinityCookie) {
            // Pass the cookie header exactly as received
            headers['Cookie'] = affinityCookie;
        } else {
        }

        const response = await fetch(completeURI, {
            method: 'POST',
            headers,
            body: formData
        });

        // Get response details regardless of success for debugging
        let responseText = '';
        try {
            responseText = await response.text();
        } catch (e) {
        }

        if (!response.ok) {
            throw new Error(`Complete upload failed with status: ${response.status} - Details: ${responseText}`);
        }

        // Try to parse the response as JSON
        let responseData = {};
        try {
            responseData = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
        }

        return {
            success: true,
            data: responseData
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Downloads and uploads a single part of a file
 * @param {Object} options - Options for the part upload
 * @returns {Promise<Object>} Result of the part upload
 */
async function downloadAndUploadPart({
                                         sourceUrl,
                                         uploadURL,
                                         partIndex,
                                         totalParts,
                                         partStart,
                                         partEnd,
                                         fileSize,
                                         logger = console
                                     }) {
    // Validate part size
    const partLength = partEnd - partStart + 1;
    if (partLength <= 0) {
        return {success: true, bytesProcessed: 0};
    }

    try {
        // Download this part with a range request
        const fetch = require('node-fetch');
        const partResponse = await fetch(sourceUrl, {
            method: 'GET',
            headers: {
                'Range': `bytes=${partStart}-${partEnd}`
            }
        });

        if (!partResponse.ok && partResponse.status !== 206) {
            throw new Error(`Failed to download part ${partIndex + 1}: Status ${partResponse.status}`);
        }

        // Get data as binary buffer
        const partBuffer = await partResponse.buffer();

        // Upload buffer
        const uploadResult = await upload({
            uploadURL,
            binaryData: partBuffer,
            logger
        });

        if (!uploadResult.success) {
            throw new Error(`Failed to upload part ${partIndex + 1}: ${uploadResult.error}`);
        }

        return {success: true, bytesProcessed: partBuffer.length};
    } catch (error) {
        return {success: false, error: error.message};
    }
}

/**
 * Handles the upload of all parts of a file using streaming
 * @param {Object} options - Options for the multi-part upload
 * @returns {Promise<Object>} Result of the multi-part upload
 */
async function handleMultiPartUpload({
                                         sourceUrl,
                                         uploadURIs,
                                         fileSize,
                                         minPartSize,
                                         maxPartSize,
                                         logger = console,
                                         maxConcurrent = 5
                                     }) {
    try {
        // Ensure we have at least one part
        const numParts = Math.max(uploadURIs.length, 1);

        // Guarantees the size of each part is at least the value needed to split the file for all intended parts,
        // without going below any specified minimum part size
        const partSize = Math.max(
            minPartSize || Math.ceil(fileSize / numParts),
            Math.ceil(fileSize / numParts)
        );
        let bytesProcessed = 0;

        // Create array of part descriptors
        const parts = Array.from({length: numParts}, (_, i) => {
            const partStart = i * partSize;
            const partEnd = Math.min(partStart + partSize, fileSize) - 1;
            return {
                index: i,
                partStart,
                partEnd,
                length: partEnd - partStart + 1,
                uploadURL: uploadURIs[Math.min(i, uploadURIs.length - 1)]
            };
        });

        // Filter out empty parts
        const validParts = parts.filter(part => part.length > 0);

        // Split parts into batches of maxConcurrent
        const batches = [];
        for (let i = 0; i < validParts.length; i += maxConcurrent) {
            batches.push(validParts.slice(i, i + maxConcurrent));
        }

        // Process batches sequentially
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
            const batch = batches[batchIndex];

            // Process each batch concurrently
            const batchResults = await Promise.allSettled(
                batch.map(part =>
                    downloadAndUploadPart({
                        sourceUrl,
                        uploadURL: part.uploadURL,
                        partIndex: part.index,
                        totalParts: numParts,
                        partStart: part.partStart,
                        partEnd: part.partEnd,
                        fileSize,
                        logger
                    })
                )
            );

            // Analyze the results - separate fulfilled from rejected promises
            const fulfilledResults = batchResults
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);

            const failedParts = batchResults
                .filter(result => result.status === 'rejected' ||
                    (result.status === 'fulfilled' && !result.value.success))
                .map((result, index) => ({
                    partIndex: batch[index].index,
                    error: result.status === 'rejected'
                        ? result.reason
                        : result.value.error
                }));

            if (failedParts.length > 0) {
                const failedIndexes = failedParts.map(p => p.partIndex + 1).join(', ');
                logger.error(`Parts ${failedIndexes} failed to upload in batch ${batchIndex + 1}`);
                logger.error(`First failure reason: ${failedParts[0].error}`);

                throw new Error(`Parts failed (${failedParts.length}/${batch.length}) in batch ${batchIndex + 1} - aborting`);
            }

            // Update progress (count only successful uploads)
            const batchBytes = fulfilledResults
                .filter(result => result.success)
                .reduce((sum, result) => sum + result.bytesProcessed, 0);
            bytesProcessed += batchBytes;
        }
        return {success: true};
    } catch (error) {
        return {success: false, error: error.message};
    }
}

/**
 * Creates an absolute URL from a potentially relative one
 * @param {string} url - The possibly relative URL
 * @param {string} host - The host to prepend to relative URLs
 * @returns {string} The absolute URL
 */
function createAbsoluteUrl(url, host) {
    if (url.startsWith('http')) {
        return url;
    }

    // Make sure we don't double-up on slashes when combining host and path
    if (url.startsWith('/') && host.endsWith('/')) {
        return `${host.slice(0, -1)}${url}`;
    } else if (!url.startsWith('/') && !host.endsWith('/')) {
        return `${host}/${url}`;
    } else {
        return `${host}${url}`;
    }
}

/**
 * Streams an asset from a URL to AEM Assets
 * @param {Object} options - The options object
 * @param {string} options.sourceUrl - The URL of the asset to download
 * @param {string} options.host - AEM host URL
 * @param {string} options.folderPath - Target folder path in DAM (without /content/dam/)
 * @param {string} options.fileName - Target file name
 * @param {string} options.auth - Authorization header value (e.g., Basic/Bearer)
 * @param {Object} [options.logger] - Optional logger object with info and error methods
 * @returns {Promise<Object>} - Result object with success flag and data or error
 */
async function streamAssetToAEM({sourceUrl, host, folderPath, fileName, auth, logger = console}) {
    const fetch = require('node-fetch');

    try {
        // 1. First make a HEAD request to get Content-Length without downloading the file
        const headResponse = await fetch(sourceUrl, {method: 'HEAD'});

        const fileSize = parseInt(headResponse.headers.get('Content-Length'), 10);

        // 2. Initiate upload to AEM
        const initResult = await initUpload({
            host,
            folderPath,
            fileName,
            fileSize,
            auth,
            logger
        });

        const {data, affinityCookie} = initResult;

        // The uploadURIs are in the first file object, not directly on the data object
        const fileInfo = data.files[0];

        // 3. Stream and upload binary to the blob store in parts
        const uploadResult = await handleMultiPartUpload({
            sourceUrl,
            uploadURIs: fileInfo.uploadURIs,
            fileSize,
            minPartSize: fileInfo.minPartSize,
            maxPartSize: fileInfo.maxPartSize,
            logger
        });

        // 4. Complete the upload
        const completeURL = createAbsoluteUrl(data.completeURI, host);
        const completeResult = await completeUpload({
            completeURI: completeURL,
            uploadToken: fileInfo.uploadToken,
            fileName,
            mimeType: fileInfo.mimeType,
            auth,
            affinityCookie,
            logger
        });

        return {
            success: true,
            data: {
                ...completeResult.data,
                fileSize,
                assetPath: `${folderPath}/${fileName}`
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    streamAssetToAEM,
}
```

This script can be called like this

```js
 // 30 mb large image test
const imageUrl = 'https://sample-videos.com/img/Sample-jpg-image-30mb.jpg';
const fileName = `${fileName}.jpg`;

// Use AEM technical Account or a _Local Developer Token_ via the Developer Console.
const auth = `Bearer ${params.TOKEN}`;

const uploadResult = await streamAssetToAEM({
    sourceUrl: imageUrl,
    host: aemHost,
    folderPath: damTargetPath,
    fileName: fileName,
    auth: auth,
    logger: logger
});

const targetUrl = `${aemHost}/content/dam/${uploadResult.data.assetPath}`;
```

## Creating a Folder

```js
async function prepareFolder(params, logger) {
    const fetch = require('node-fetch');

    const formData = new URLSearchParams();
    const folderName = params['uuid'];
    formData.append('./jcr:content/jcr:title', folderName);
    formData.append(':name', folderName);
    formData.append('./jcr:primaryType', 'sling:OrderedFolder');
    formData.append('./jcr:content/jcr:primaryType', 'nt:unstructured');
    formData.append('./jcr:content/sourcing', 'false');
    formData.append('_charset_', 'UTF-8');

    const headers = {
        'Authorization': `Bearer ${params['TOKEN']}`,
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    const url = `${params.AEM_HOST}${damRootPath}/${folderName}`;
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Failed to create folder: ${response.status}`);
    }

    logger.info(`Folder at ${url} created successfully`);
    return `${damRootPath}/${folderName}`
}
```
