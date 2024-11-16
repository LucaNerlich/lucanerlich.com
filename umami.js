import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'

// https://stackoverflow.com/questions/57859350/how-can-i-add-custom-scripts-in-index-htmls-head-part-in-docusaurus-v2
if (ExecutionEnvironment.canUseDOM) {
    if (window.location.href.includes('localhost')) {
        console.debug('Skipping umami tracking on localhost');
    } else {
        // Create the script element for the umami tracking code
        const umamiScript = document.createElement('script')
        umamiScript.src = 'https://umami-t8kgsg4o4wc4o80wgwwo484c.lucanerlich.com/script.js'
        umamiScript.async = false
        umamiScript.defer = true
        umamiScript.setAttribute('data-website-id', 'ab006768-36c5-487b-a95a-3f5bbfca2cc3')

        // Insert the script into the head of the document
        document.head.appendChild(umamiScript)
    }
}
