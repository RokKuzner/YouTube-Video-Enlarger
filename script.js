async function initExtension() {

    console.log("BEFORE VAR INIT")

    let isResizing = false;
    let startX;
    let startWidth;

    console.log("AFTER VAR INIT")

    console.log("BEFORE FUNCT INIT")

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
        if (width < min_video_width) { width = min_video_width }

        let height = Math.floor(width / width_height_ratio)

        for (let el of elements_to_resize) {
            el.style.width = width + 'px';
            el.style.height = height + 'px';
        }

        position_bottom_elements()
        position_bottom_bar()
    }

    function resize(e) {
        console.log("RESIZING/MOUSEMOVE 1")
        if (!isResizing) return;

        console.log("RESIZING/MOUSEMOVE 2")

        let width = startWidth + (e.clientX - startX);
        resize_elements(width)

        console.log("RESIZING/MOUSEMOVE 3")
    }

    function stopResize() {
        console.log("STOP RESIZING/MOUSEUP 1")
        isResizing = false;
        document.removeEventListener('mousemove', resize);
        console.log("STOP RESIZING/MOUSEUP 2")
        document.removeEventListener('mouseup', stopResize);
        console.log("STOP RESIZING/MOUSEUP 3")
    }

    function position_bottom_elements() {
        let top_value = player_element.offsetTop + player_element.offsetHeight + 10
        bottom_content.style.top = `${top_value}px`
    }

    function position_bottom_bar() {
        let bottom_bar_width = bottom_bar.offsetWidth
        let video_player_width = player_element.offsetWidth

        let bottom_bar_left_value = Math.floor((video_player_width - bottom_bar_width) / 2)

        bottom_bar.style.left = `${bottom_bar_left_value}px`
    }

    console.log("AFTER FUNCT INIT")
    console.log("Awaiting loaded video ...")

    // Wait for the page to be fully loaded
    await await_loaded_video()

    console.log("Video loaded")

    // Get all necesary elements
    let video_element = document.querySelector("#movie_player > div.html5-video-container > video")
    let container_element = document.querySelector("#movie_player")
    let bottom_bar = document.querySelector("#movie_player > div.ytp-chrome-bottom")
    let side_content = document.querySelector("#related")
    let bottom_content = document.querySelector("#below")
    let player_element = document.querySelector("#player")

    let elements_to_resize = [
        document.querySelector("#movie_player > div.html5-video-container > video"),
        document.querySelector("#movie_player > div.html5-video-container"),
        document.querySelector("#movie_player"),
        document.querySelector("#container"),
        document.querySelector("#ytd-player"),
        document.querySelector("#player-container"),
        document.querySelector("#player-container-inner"),
        document.querySelector("#player-container-outer")
    ]

    // Get all necesary values
    let min_video_width = Number(window.getComputedStyle(video_element).width.slice(0, -2))
    console.log("Min video width:", min_video_width)

    // Inject the resizer element
    console.log("BEFORE INJECTING RESIZER ELEMENT")
    inject_resizer_element(container_element)
    console.log("AFTER INJECTING RESIZER ELEMENT")
    let resizer_element = document.querySelector("#resizer-element")

    // Get the video width:height ratio
    console.log("BEFORE GETTING WH ratio")
    width_height_ratio = Number(video_element.style.width.slice(0, -2)) / Number(video_element.style.height.slice(0, -2))
    console.log("AFTER GETTING WH ratio")
    console.log("WH ratio:", width_height_ratio)

    // Remove the side content
    console.log("BEFORE REMOVING SIDE CONTENT")
    side_content.parentNode.removeChild(side_content)
    console.log("AFTER REMOVING SIDE CONTENT")
    // Adjust the elements to the new size
    console.log("BEFORE ADJUSTING ELEMENTS TO NEW SIZE")
    resize_elements(Number(window.getComputedStyle(container_element).width.slice(0, -2)))
    console.log("AFTER ADJUSTING ELEMENTS TO NEW SIZE")

    // Change the width of bottom content
    console.log("BEFORE CHANGING WIDTH OF BOTTOM CONTENT")
    bottom_content.style.width = `${min_video_width}px`
    console.log("AFTER CHANGING WIDTH OF BOTTOM CONTENT")

    // Implement the resizing
    console.log("BEFORE IMPLEMENTING RESIZING")
    resizer_element.addEventListener('mousedown', (e) => {
        console.log("MOUSEDOWN!")
        isResizing = true;
        startX = e.clientX;
        startWidth = video_element.offsetWidth;
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    });
    console.log("AFTER IMPLEMENTING RESIZING")

};

// Run on initial page load.
//window.addEventListener('load', () => {console.log("FROM load");initExtension});

// Run on subsequent navigations.
document.addEventListener('yt-navigate-finish', () => {console.log("FROM yt-navigate-finish");initExtension()});