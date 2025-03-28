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
    // Reset all chenges
    reset_changes()

    // Check if the current page is a youtube video page
    if (!String(document.URL).includes("/watch?v=") || String(document.URL).includes("music.youtube.com")) { return 0 }

    // Save the desiganted url for this instance of the extension
    let active_on_video_id = get_video_id()
    let is_active = true

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
        // Check if this instance of the extension should be active
        if (!is_active) { return 0 }

        // Check if the current url is the same as the one the extension was initialized on
        if (get_video_id() != active_on_video_id) { is_active = false; return 0 }

        // Check if the video is in full screen mode
        if (document.fullscreenElement) { return 0; }

        //if (width < min_video_width) { width = min_video_width }

        let height = Math.floor(width / width_height_ratio)

        for (let el of elements_to_resize) {
            if (el != null) {
                el.style.width = width + 'px';
                el.style.height = height + 'px';
                el.style.top = "0px";
            }
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

    function position_playlist_elements() {
        // Get all necesary elements
        let secondary_contnet_container = document.querySelector("#page-manager > ytd-watch-flexy > #columns > #secondary")
        let player_element = document.querySelector("#player")

        if (!secondary_contnet_container) { return }

        top_value = player_element.offsetTop + player_element.offsetHeight + 10

        secondary_contnet_container.style.top = `${top_value}px`
        secondary_contnet_container.style.width = `${min_video_width}px`
    }

    function position_bottom_elements() {
        // Get all necesary elements
        let bottom_content = document.querySelector("#page-manager > ytd-watch-flexy > #columns > #primary > #primary-inner > #below")
        let secondary_contnet_container = document.querySelector("#page-manager > ytd-watch-flexy > #columns > #secondary")
        let player_element = document.querySelector("#player")

        if (!bottom_content) { return }

        if (secondary_contnet_container) {
            top_value = secondary_contnet_container.offsetTop + secondary_contnet_container.offsetHeight
        } else {
            top_value = player_element.offsetTop + player_element.offsetHeight + 10
        }

        bottom_content.style.top = `${top_value}px`
        bottom_content.style.width = `${min_video_width}px`
    }

    function position_bottom_bar() {
        // Get all necesary elements
        let player_element = document.querySelector("#player")
        let bottom_bar = document.querySelector("#movie_player > div.ytp-chrome-bottom")

        let bottom_bar_width = bottom_bar.offsetWidth
        let video_player_width = player_element.offsetWidth

        let bottom_bar_left_value = Math.floor((video_player_width - bottom_bar_width) / 2)

        bottom_bar.style.left = `${bottom_bar_left_value}px`
    }

    function set_fullscreen() {
        // Get all necesary elements
        let bottom_content = document.querySelector("#page-manager > ytd-watch-flexy > #columns > #primary > #primary-inner > #below")
        let secondary_contnet_container = document.querySelector("#page-manager > ytd-watch-flexy > #columns > #secondary")

        while (!document.fullscreenElement) { }

        reset_video_size()

        document.querySelector("#movie_player").style.width = window.innerWidth + "px"
        document.querySelector("#movie_player").style.height = window.innerHeight + "px"

        // Hide other elements
        if (secondary_contnet_container) { secondary_contnet_container.style.display = "none" }
        if (bottom_content) { bottom_content.style.display = "none" }
        resizer_element.style.display = "none"
    }

    function handle_full_screen_change() {
        // Get all necesary elements
        let bottom_content = document.querySelector("#page-manager > ytd-watch-flexy > #columns > #primary > #primary-inner > #below")
        let secondary_contnet_container = document.querySelector("#page-manager > ytd-watch-flexy > #columns > #secondary")

        if (document.fullscreenElement) {
            setTimeout(set_fullscreen, 10);
        } else {
            // Unhide other elements
            if (secondary_contnet_container) { secondary_contnet_container.style.display = "" }
            if (bottom_content) { bottom_content.style.display = "" }
            resizer_element.style.display = ""

            resize_elements(min_video_width)
        }
    }

    function get_elements_to_resize() {
        return [
            document.querySelector("#movie_player > div.html5-video-container > video"),
            document.querySelector("#movie_player > div.html5-video-container"),
            document.querySelector("#movie_player"),
            document.querySelector("#ytd-player > #container"),
            document.querySelector("#ytd-player"),
            document.querySelector("#player-container-inner"),
            document.querySelector("#player-container-outer")
        ]
    }

    // Wait for the page to be fully loaded
    await await_loaded_video()

    // Inject the custom css
    inject_css()

    // Get all necesary elements
    let video_element = document.querySelector("#movie_player > div.html5-video-container > video")
    let container_element = document.querySelector("#movie_player")
    let related_videos_container = document.querySelector("#related")

    let elements_to_resize = get_elements_to_resize()

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
    resize_elements(Number(window.getComputedStyle(video_element).width.slice(0, -2)))

    // Implement the resizing
    resizer_element.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = video_element.offsetWidth;
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    });

    document.addEventListener('fullscreenchange', handle_full_screen_change);

    // Every 0.5s:
    //  - Try to get elements to resize if any are missing
    //  - Resize elements for additional redundancy
    setInterval(() => {
        if (elements_to_resize.includes(null)) { elements_to_resize = get_elements_to_resize() }
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

function inject_css() {
    if (document.querySelector("#video-enlarger-extension-custom-style")) { return 0 }

    style_element = document.createElement("style")
    style_element.textContent = custom_css
    style_element.id = "video-enlarger-extension-custom-style"

    document.body.appendChild(style_element)
}

function get_url_parameters() {
    let query_string = new URLSearchParams(document.URL.split("?")[1])
    let parameters = query_string.entries()
    let parameters_dict = {}
    for (let param_pair of parameters) {
        parameters_dict[param_pair[0]] = param_pair[1]
    }

    return parameters_dict
}

function get_video_id() {
    parameters = get_url_parameters()

    if (!parameters["v"]) {
        return null
    } else {
        return parameters["v"]
    }
}

window.addEventListener("load", () => {
    inject_css()
    initExtension()
})

// Observe for location changes
function observe_url_changes() {
    let last_url = document.URL
    const location_change_observer = new MutationObserver(() => {
        if (document.URL !== last_url) {
            last_url = document.URL
            initExtension()
        }
    })
    location_change_observer.observe(document, { subtree: true, childList: true })
}

observe_url_changes()