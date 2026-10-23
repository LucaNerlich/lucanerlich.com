import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'

// https://stackoverflow.com/questions/57859350/how-can-i-add-custom-scripts-in-index-htmls-head-part-in-docusaurus-v2
if (ExecutionEnvironment.canUseDOM) {
    const {hostname} = window.location
    // GPC is the signal current browsers expose; DNT is kept for browsers
    // that still honor it (navigator for most, window on legacy Safari/IE).
    const isOptedOut =
        navigator.globalPrivacyControl === true ||
        navigator.doNotTrack === '1' ||
        window.doNotTrack === '1'
    // Production is the only place worth tracking: local hosts, LAN previews
    // (the documented --host 0.0.0.0) and deploy previews all stay out.
    const isProduction = hostname === 'lucanerlich.com' || hostname === 'www.lucanerlich.com'
    if (!isProduction) {
        console.debug('Skipping umami tracking outside production')
    } else if (isOptedOut) {
        console.debug('Skipping umami tracking: privacy opt-out signal is set')
    } else {
        const umamiHost = 'https://umami.lucanerlich.com'
        const websiteId = 'ab006768-36c5-487b-a95a-3f5bbfca2cc3'

        const umamiScript = document.createElement('script')
        umamiScript.src = `${umamiHost}/script.js`
        umamiScript.async = false
        umamiScript.defer = true
        umamiScript.setAttribute('data-website-id', websiteId)
        // The splitter keeps a whole session in `?s=` (people's names and
        // amounts); a shared link must never reach analytics or the stored
        // pageview. Legacy `#…` payloads are excluded for the same reason.
        umamiScript.setAttribute('data-exclude-search', 'true')
        umamiScript.setAttribute('data-exclude-hash', 'true')
        document.head.appendChild(umamiScript)
    }
}
