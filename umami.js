import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'

// https://stackoverflow.com/questions/57859350/how-can-i-add-custom-scripts-in-index-htmls-head-part-in-docusaurus-v2
if (ExecutionEnvironment.canUseDOM) {
    const {hostname} = window.location
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        console.debug('Skipping umami tracking on localhost')
    } else if (navigator.doNotTrack === '1') {
        console.debug('Skipping umami tracking: Do Not Track is enabled')
    } else {
        const umamiHost = 'https://umami.lucanerlich.com'
        const websiteId = 'ab006768-36c5-487b-a95a-3f5bbfca2cc3'

        const umamiScript = document.createElement('script')
        umamiScript.src = `${umamiHost}/script.js`
        umamiScript.async = false
        umamiScript.defer = true
        umamiScript.setAttribute('data-website-id', websiteId)
        document.head.appendChild(umamiScript)

        // Session recording is opt-in: the recorder script is only loaded when
        // the visitor has explicitly granted consent ('umami-recording-consent'
        // in localStorage). See the privacy note in the imprint.
        if (localStorage.getItem('umami-recording-consent') === 'granted') {
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
}
