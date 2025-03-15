const custom_css = `
body {
    overflow-x: hidden;
}

#resizer-element {
    position: absolute;
    z-index: 10;
    top: 0;
    right: 0;
    height: 100%;
    width: 5px; /* Width of the resizer bar */
    background-color: #ddd;
    cursor: ew-resize; /* Cursor changes on hover */
}

#player {
    position: absolute !important;
    left: 50% !important;
    top: 100px !important;
    transform: translate(-50%, 0) !important;
}

#below {
    position: absolute !important;
    left: 50% !important;
    transform: translate(-50%, 0) !important;
}

#secondary {
    padding: 0 !important;
    margin: 0 !important;
    position: absolute !important;
    z-index: 11 !important;
}

#playlist {
    margin: 0 !important;
}
`

async function initExtension() {
    // Check if the current page is a youtube video page
    if (!String(document.URL).includes("/watch?v=")) { return 0 }

    // Reset all chenges
    reset_changes()

    // Save the desiganted url for this instance of the extension
    let active_on_url = document.URL

    // Initialize resizing variables
    let isResizing = false;
    let startX;
    let startWidth;

    // Define functions
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function await_loaded_video() {
        while (
            // While the video element is not loaded
            document.querySelector("#movie_player > div.html5-video-container > video") == null ||

            // Wile the width of the video element isn't specifically set in pixels
            window.getComputedStyle(document.querySelector("#movie_player > div.html5-video-container > video")).width.substring(
                window.getComputedStyle(document.querySelector("#movie_player > div.html5-video-container > video")).width.length - 2
            ) != "px" ||

            document.querySelector("#movie_player > div.html5-video-container > video").readyState < 2
        ) {
            await sleep(100)
        }
    }

    function inject_resizer_element(parent) {
        let resizer_element_div = document.createElement("div")
        resizer_element_div.id = "resizer-element"
        parent.appendChild(resizer_element_div)
    }

    function resize_elements(width) {
        // Check if the current url is the same as the one the extension was initialized on
        if (document.URL != active_on_url) { return 0 }

        // Check if the video is in full screen mode
        if (video_element.offsetWidth == document.body.offsetWidth || video_element.offsetHeight == window.innerHeight) { set_fullscreen(); return 0; }

        if (width < min_video_width) { width = min_video_width }

        let height = Math.floor(width / width_height_ratio)

        for (let el of elements_to_resize) {
            el.style.width = width + 'px';
            el.style.height = height + 'px';
            el.style.top = "0px";
        }

        position_playlist_elements()
        position_bottom_elements()
        position_bottom_bar()
    }

    function resize(e) {
        if (!isResizing) return;

        let width = startWidth + (e.clientX - startX) * 2;
        resize_elements(width)
    }

    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }

    function position_playlist_elements(top_value = null) {
        if (!secondary_contnet_container) { return }

        if (!top_value) { top_value = player_element.offsetTop + player_element.offsetHeight + 10 }
        secondary_contnet_container.style.top = `${top_value}px`
    }

    function position_bottom_elements(top_value = null) {
        if (!top_value) { top_value = secondary_contnet_container.offsetTop + secondary_contnet_container.offsetHeight }
        bottom_content.style.top = `${top_value}px`
    }

    function position_bottom_bar() {
        let bottom_bar_width = bottom_bar.offsetWidth
        let video_player_width = player_element.offsetWidth

        let bottom_bar_left_value = Math.floor((video_player_width - bottom_bar_width) / 2)

        bottom_bar.style.left = `${bottom_bar_left_value}px`
    }

    function inject_css() {
        style_element = document.createElement("style")
        style_element.textContent = custom_css
        style_element.id = "video-enlarger-extension-custom-style"

        document.body.appendChild(style_element)
    }

    function set_fullscreen() {
        // Calculate width and height assuming width is larger
        let width = window.innerWidth
        let height = Math.floor(width / width_height_ratio)
        let top_val = Math.floor((window.innerHeight - height) / 2)

        // Handle videos where height is larger that width
        if (window.innerHeight < height) {
            height = window.innerHeight
            width = Math.floor(height * width_height_ratio)
        }

        // Resize video elements to full screen and position them to center
        for (let element of elements_to_resize) {
            element.style.width = width + "px"
            element.style.height = height + "px"
            element.style.top = top_val + "px"
        }

        // Hide other elements
        secondary_contnet_container.style.display = "none"
        bottom_content.style.display = "none"
        resizer_element.style.display = "none"
    }

    function handle_full_screen_change() {
        if (document.fullscreenElement) {
            set_fullscreen()
        } else {
            // Unhide other elements
            secondary_contnet_container.style.display = ""
            bottom_content.style.display = ""
            resizer_element.style.display = ""

            resize_elements(min_video_width)
        }
    }

    // Wait for the page to be fully loaded
    await await_loaded_video()

    // Inject the custom css
    inject_css()

    // Get all necesary elements
    let video_element = document.querySelector("#movie_player > div.html5-video-container > video")
    let container_element = document.querySelector("#movie_player")
    let bottom_bar = document.querySelector("#movie_player > div.ytp-chrome-bottom")
    let related_videos_container = document.querySelector("#related")
    let secondary_contnet_container = document.querySelector("#secondary")
    let bottom_content = document.querySelector("#below")
    let player_element = document.querySelector("#player")

    let elements_to_resize = [
        document.querySelector("#movie_player > div.html5-video-container > video"),
        document.querySelector("#movie_player > div.html5-video-container"),
        document.querySelector("#movie_player"),
        document.querySelector("#container"),
        document.querySelector("#ytd-player"),
        document.querySelector("#player-container-inner"),
        document.querySelector("#player-container-outer")
    ]

    // Get all necesary values
    let min_video_width = Number(window.getComputedStyle(video_element).width.slice(0, -2))

    // Inject the resizer element
    inject_resizer_element(container_element)
    let resizer_element = document.querySelector("#resizer-element")

    // Get the video width:height ratio
    width_height_ratio = Number(video_element.style.width.slice(0, -2)) / Number(video_element.style.height.slice(0, -2))
    console.log("WH ratio:", width_height_ratio)

    // Remove the side content
    if (related_videos_container) { related_videos_container.parentNode.removeChild(related_videos_container) }
    // Adjust the elements to the new size
    resize_elements(Number(window.getComputedStyle(container_element).width.slice(0, -2)))

    // Change the width of bottom content
    bottom_content.style.width = `${min_video_width}px`

    // Change the width of playlist items
    if (secondary_contnet_container) { secondary_contnet_container.style.width = `${min_video_width}px` }

    // Implement the resizing
    resizer_element.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = video_element.offsetWidth;
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    });

    document.addEventListener('fullscreenchange', handle_full_screen_change);

    // Resize elements every 0.5s for additional redundancy
    setInterval(() => {
        resize_elements(video_element.offsetWidth)
    }, 500)

};

function reset_video_size() {
    try { document.querySelector("#container").style.width = "100% !important" } catch { }
    try { document.querySelector("#container").style.height = "100% !important" } catch { }

    try { document.querySelector("#player-container-inner").style.height = "0px !important" } catch { }

    try { document.querySelector("#movie_player > div.html5-video-container").style.height = "0px !important" } catch { }
}

function reset_changes() {
    reset_video_size()

    try {
        let resizer_element = document.querySelector("#resizer-element")
        resizer_element.parentNode.removeChild(resizer_element)
    } catch { }

    try {
        let style_element = document.querySelector("#video-enlarger-extension-custom-style")
        style_element.parentNode.removeChild(style_element)
    } catch { }
}

window.addEventListener("load", () => {
    initExtension()
})

// Observe for location changes
let last_url = document.URL
const location_change_observer = new MutationObserver(() => {
    if (document.URL !== last_url) {
        last_url = document.URL
        initExtension()
    }
})
location_change_observer.observe(document, { subtree: true, childList: true })