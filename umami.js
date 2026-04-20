import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'

// https://stackoverflow.com/questions/57859350/how-can-i-add-custom-scripts-in-index-htmls-head-part-in-docusaurus-v2
if (ExecutionEnvironment.canUseDOM) {
    if (window.location.href.includes('localhost')) {
        console.debug('Skipping umami tracking on localhost');
    } else {
        const umamiHost = 'https://umami.lucanerlich.com'
        const websiteId = 'ab006768-36c5-487b-a95a-3f5bbfca2cc3'

        const umamiScript = document.createElement('script')
        umamiScript.src = `${umamiHost}/script.js`
        umamiScript.async = false
        umamiScript.defer = true
        umamiScript.setAttribute('data-website-id', websiteId)
        document.head.appendChild(umamiScript)

        const recorderScript = document.createElement('script')
        recorderScript.src = `${umamiHost}/recorder.js`
        recorderScript.async = false
        recorderScript.defer = true
        recorderScript.setAttribute('data-website-id', websiteId)
        recorderScript.setAttribute('data-sample-rate', '0.25')
        recorderScript.setAttribute('data-mask-level', 'moderate')
        recorderScript.setAttribute('data-max-duration', '300000')
        document.head.appendChild(recorderScript)
    }
}
