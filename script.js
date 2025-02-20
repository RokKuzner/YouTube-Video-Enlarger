let isResizing = false;
let startX;
let startWidth;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function await_loaded_video() {
    while (
        // While the video element is not loaded
        document.querySelector("#movie_player > div.html5-video-container > video") == null || 

        // Wile the width of the video element isn't specifically set in pixels
        window.getComputedStyle(document.querySelector("#movie_player > div.html5-video-container > video")).width.substring(
            window.getComputedStyle(document.querySelector("#movie_player > div.html5-video-container > video")).width.length-2
        ) != "px"
    ) {
        await sleep(100)
    }
}

function inject_resizer_element(parent) {
    let resizer_element_div = document.createElement("div")
    resizer_element_div.id = "resizer-element"
    parent.appendChild(resizer_element_div)
}

window.onload = async function() {
    // Wait for the page to be fully loaded
    await await_loaded_video()

    // Get all necesary elements
    let video_element = document.querySelector("#movie_player > div.html5-video-container > video")
    let container_element = document.querySelector("#movie_player")
    let bottom_bar = document.querySelector("#movie_player > div.ytp-chrome-bottom")

    // Inject the resizer element
    inject_resizer_element(container_element)
    let resizer_element = document.querySelector("#resizer-element")

    // Implement the resizing
    resizer_element.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = video_element.offsetWidth;
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    });
      
    function resize(e) {
        if (!isResizing) return;
        const width = startWidth + (e.clientX - startX);
        video_element.style.width = width + 'px';
    }
      
    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }
};